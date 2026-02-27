var express = require('express');
var app = express();
var session = require('express-session');
var conn = require('./dbConfig');
//const { title } = require('process');
var bcrypt = require('bcrypt');

app.set('view engine','ejs');
app.use(session({ // Session configuration
    secret: 'jHh2026SecureRandomString!@#', // Use a strong, random secret in production
    resave: true,
    saveUninitialized: true
}));

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res){ // Home page
    res.render("home");
});

app.get('/hService', function(req, res){ // Service page
    res.render("hService");
});

app.get('/hFaqs', function(req, res) { // FAQs page - database-driven version
    conn.query('SELECT * FROM faqs ORDER BY faq_id', function(err, results) {
        if (err) {
            console.error('Error fetching FAQs:', err);
            return res.render('hFaqs', { faqData: [] }); // Render with empty data on error
        }
        res.render('hFaqs', { faqData: results });
    });
});

app.get('/faqs1', function(req, res){ // FAQs page - static version for comparison
    res.render("faqs1");
});

app.get('/logout', (req,res) => { // Logout route
    req.session.destroy();
    res.redirect('/');
});

app.get('/register', function(req, res) { //Registration Route
    res.render("register", {
        error: null,
        success: null }); // Pass null for error and success on initial load
});

app.post('/register', function (req, res) { 
    let { name, email, phone_number, password, passwordVerify } = req.body; //destructuring assignment

    // VALIDATION - Check for empty fields
    if (!name || !phone_number || !email || !password || !passwordVerify) {
        return res.status(400).render('register', { 
             error: 'All fields are required!' 
        }); 
    }
    
    // PASSWORD MATCH CHECK
    if (password !== passwordVerify) {
        return res.status(400).render('register', { 
            error: 'Passwords do not match!' 
        });
    }

    // CHECK IF EMAIL ALREADY EXISTS
    conn.query(
        'SELECT email FROM users WHERE email = ?', [email], 
        function(err, results) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('register', { 
                    error: 'Server error. Please try again.' 
                });
            }

            if (results.length > 0) {
                return res.status(400).render('register', { 
                    error: 'Email already registered! Please login.' 
                });
            }
    
            // HASH PASSWORD & INSERT USER
            const hashedPassword = bcrypt.hashSync(password, 10);

            conn.query( 
                'INSERT INTO users (name, phone_number, email, password, created_at) VALUES (?, ?, ?, ?, NOW())', 
                [name, phone_number, email, hashedPassword], //pass values as array
                function(err, results) {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).render('register', { 
                            error: 'Registration failed. Please try again.' 
                        });
                    }
                    console.log('User registered successfully:', email);
                    res.render('login', { 
                        success: 'Registration successful! Please login.' 
                    });
                }
            );
        }
    );
});

app.get('/login', function(req, res) { // Login page
    res.render("login");
});

app.post('/auth', async function(req, res) { //added async
    let { email, password} = req.body;
    //var email = req.body.email;
    //var password = req.body.password;
    
    // validation for empty fields
    if (!email || !password) {
        return res.send('Please enter Email and Password please!'); 
    }

    conn.query('SELECT * FROM users WHERE email = ?', [email],    
        async function (error, results, fields) {
            if (error) {
                console.log('Error during login:', error);
                return res.send('An error occurred. Please try again.');
            }

            if (results.length >0) {
                const ok = await bcrypt.compare(password, results[0].password);
                if (ok) { 
                    req.session.loggedin = true;
                    req.session.email = email;
                    req.session.name = results[0].name;
                    req.session.user_id = results[0].user_id; //Important for bookings!
                    req.session.role = results[0].role; // Store user role in session
                    req.session.phone_number = results[0].phone_number;

                    console.log('User logged in:', email, 'Role:', req.session.role);
                    
                    if (results[0].role === 'admin') {
                        res.redirect('/adminPage'); // Redirect to admin dashboard
                    }else {
                        res.redirect('/userPage'); // Redirect to user dashboard
                    }
                } else {
                    res.send('Incorrect Password!');
                }
            } else { // No user found with that email
                res.send('Incorrect Email!');
            }
        });
})  
 
function requireLogin(req, res, next) { // Reusable middleware for requires login
    if (req.session.loggedin) {
        next(); // logged in, continue
    } else { // Redirect to login page if not logged in
        res.redirect('/login');    
}}

function requireAdmin(req, res, next) { // Reusable middleware for requires admin login
    if (req.session.loggedin && req.session.role === 'admin') {
        next(); // logged in and is admin, continue
    } else { // Redirect to login page if not admin
        res.redirect('/login'); 
}}

app.get('/available-slots', function(req, res) { // to get booked slots for a given date
    const date = req.query.date;
    
    if (!date) {
        return res.json({ bookedSlots: [] });
    }
    
    // Get all bookings for this date
    conn.query(
        'SELECT time FROM booking WHERE date = ?',
        [date],
        function(err, results) {
            if (err) {
                console.log('Error checking slots:', err);
                return res.json({ bookedSlots: [] });
            }
            
            // Extract just the times
            const bookedTimes = results.map(booking => {
                // Format: "09:30:00" -> "09:30"
                return booking.time.slice(0, 5);
            });
            
            res.json({ bookedSlots: bookedTimes });
        }
    );
});

app.get('/userPage', requireLogin, function (req, res) { // User dashboard
    res.render('userPage', { 
        name: req.session.name, 
        phone: req.session.phone_number || '', // Handle case where phone_number might be null
        user_id: req.session.user_id, // Pass user_id to userPage for booking form
    });
});

app.post('/userCreateBooking', requireLogin, function(req, res) { // booking creation from user dashboard
    const { date, time, notes } = req.body;
    const user_id = req.session.user_id;
    
    // Validation
    if (!date || !time) {
        return res.send('Please select both date and time!');
    }

    // Check if this slot is already booked
    conn.query(
        'SELECT * FROM booking WHERE date = ? AND time = ?',
        [date, time],
        function(err, existingBookings) {
            if (err) {
                console.log('Error checking booking:', err);
                return res.send('Error creating booking');
            }

            // If slot is taken
            if (existingBookings.length > 0) {
                return res.send('Sorry! This time slot is already booked. Please choose another time.');
            }

            // Slot is available - create booking
            conn.query(
                'INSERT INTO booking (user_id, date, time, notes) VALUES (?, ?, ?, ?)',
                [user_id, date, time, notes],
                function(err, result) {
                    if (err) {
                        console.log('Error creating booking:', err);
                        return res.send('Error creating booking');
                    }
                    console.log('Booking created successfully for user_id:', user_id, 'on', date, time);
                    res.redirect('/userMyBookings');
                }
            );
        }
    );
});

app.get('/userMyBookings', requireLogin, function (req, res, next) { //Get only this user's bookings
    conn.query(
        `SELECT b.date, b.time, b.notes, b.created_at,
            u.name, u.phone_number, u.email, b.booking_id, b.user_id
            FROM booking b      JOIN users u ON b.user_id = u.user_id
            WHERE b.user_id = ?     ORDER BY b.date ASC, b.time ASC`,
            [req.session.user_id],
            function(err, results) {
            if (err) {
                console.log('Error fetching bookings:', err);
                return res.send('Error loading bookings');
            }
        res.render('userMyBookings', { 
            bookingData: results,
            message: null, // No message on initial load
        });
    });
});

app.post('/userCreateBooking', requireLogin, function(req, res) { // booking creation from user dashboard
    const { date, time, notes } = req.body;
    const user_id = req.session.user_id;
    
    // Validation
    if (!date || !time) {
        return res.send('Please select date and time!');
    }

    // Check for double booking
    conn.query(
        'SELECT * FROM booking WHERE date = ? AND time = ?',
        [date, time],
        function(err, results) {
            if (err) {
                console.log('Error checking booking:', err);
                return res.send('Error creating booking');
            }
            
            if (results.length > 0) {
                return res.send('This time slot is already booked! Please choose another time.');
            }
            
            conn.query( // Create booking if no double booking
                'INSERT INTO booking (user_id, date, time, notes) VALUES (?, ?, ?, ?)',
                [user_id, date, time, notes],
                function(err, result) {
                    if (err) {
                        console.log('Error:', err);
                        return res.send('Error creating booking');
                    }
                    res.redirect('/userMyBookings');
            });
    })
});

app.post('/deleteMyBooking', requireLogin, function(req, res) { // User deletes their own booking
    const bookingId = req.body.bookingId;
    const userId = req.session.user_id;
    
    // Security: Only delete if booking belongs to this user
    conn.query(
        'DELETE FROM booking WHERE booking_id = ? AND user_id = ?',
        [bookingId, userId],
        function(err, result) {
            if (err) {
                console.log('Error deleting booking:', err);
                return res.send('Error deleting booking');
            }
            
            if (result.affectedRows === 0) {
                return res.send('Booking not found or unauthorized');
            }
            
            res.redirect('/userMyBookings');
        }
    );
});
 
app.get('/adminPage', requireAdmin, function(req, res) { // Admin dashboard - show all users
    conn.query(
        'SELECT user_id, name, email, phone_number FROM users WHERE role != "admin" ORDER BY name', 
        function(err, results) {
            if (err) {
                console.error('Error fetching users:', err);
                return res.render('Error loading page');
            }
            console.log('Users found:', results);  // ← ADD THIS LINE!
            console.log('Number of users:', results.length);  // ← AND THIS!
            res.render('adminPage', { 
                users: results, // Pass user data to adminPage
                name: req.session.name,
                message: null,   
            });
    });
});

app.get('/adminEditBooking', requireAdmin, function(req, res) { // Admin edit booking page
    const bookingId = req.query.bookingId;
    
    conn.query( // Get the booking to edit
        'SELECT * FROM booking WHERE booking_id = ?',
        [bookingId],
        function(err, bookingResults) {
            if (err || bookingResults.length === 0) {
                return res.send('Booking not found');
            }
            
            conn.query( // Get all users for dropdown
                'SELECT user_id, name, email FROM users WHERE role != "admin" ORDER BY name',
                function(err, userResults) {
                    if (err) {
                        return res.send('Error loading users');
                    }
                    
                    res.render('adminEditBooking', {
                        booking: bookingResults[0],
                        users: userResults
                    });
                }
            );
        }
    );
});

app.post('/adminUpdateBooking', requireAdmin, function(req, res) { // Admin updates a booking
    const { bookingId, user_id, date, time, notes } = req.body;
    
    // Check for conflicts (excluding this booking)
    conn.query(
        'SELECT * FROM booking WHERE date = ? AND time = ? AND booking_id != ?',
        [date, time, bookingId],
        function(err, conflicts) {
            if (err) {
                console.log('Error checking conflicts:', err);
                return res.send('Error updating booking');
            }
            
            if (conflicts.length > 0) {
                return res.send('This time slot is already booked! Please choose another time.');
            }
            
            // Update the booking
            conn.query(
                'UPDATE booking SET user_id = ?, date = ?, time = ?, notes = ? WHERE booking_id = ?',
                [user_id, date, time, notes, bookingId],
                function(err, result) {
                    if (err) {
                        console.log('Error updating:', err);
                        return res.send('Error updating booking');
                    }
                    res.redirect('/adminAllBookings');
                }
            );
        }
    );
});

app.post('/adminDeleteBooking', requireAdmin, function(req, res) { // Admin deletes a booking
    const bookingId = req.body.bookingId;
    
    conn.query(
        'DELETE FROM booking WHERE booking_id = ?',
        [bookingId],
        function(err, result) {
            if (err) {
                console.log('Error deleting booking:', err);
                return res.send('Error deleting booking');
            }
            res.redirect('/adminAllBookings');
        }
    );
});

app.post('/adminCreateBooking', requireAdmin, async function(req, res) { // Admin creates a booking for any user
    const { user_id, date, time, notes } = req.body;
    
    // Validation
    if (!user_id || !date || !time) {
        return res.send('Please select patient, date, and time!');
    }
    
    // Check for double booking
    conn.query(
        'SELECT * FROM booking WHERE date = ? AND time = ?',         
        [date, time],
        function(err, existingBookings) {
            if (err) {
                console.log('Error checking booking:', err);
                return res.send('Error creating booking');
            }
            if (existingBookings.length > 0) {
                return res.send('This time slot is already booked! Please choose another one.');
            }
            
            //Create booking if no double booking
            conn.query(
                    'INSERT INTO booking (user_id, date, time, notes) VALUES (?, ?, ?, ?)',
                    [user_id, date, time, notes || null],
                    function(err, results) {
                        if (err) {
                            console.log('Error creating booking:', err);
                            return res.send('Error creating booking');
                        }
                        console.log('Booking created successfully');
                        res.redirect('/adminAllBookings');
                });
        });
});

app.get('/searchBookings', requireAdmin, function(req, res) { // Admin search bookings by user name, email, or date
    const searchTerm = req.query.search || '';
    
    if (!searchTerm) {
        // No search term, redirect to all bookings
        return res.redirect('/allBookings');
    }
    
    conn.query(
        `SELECT b.booking_id, b.date, b.time, b.notes,
            u.user_id, u.name, u.email, u.phone_number
        FROM booking b      JOIN users u ON b.user_id = u.user_id
        WHERE u.name LIKE ? OR u.email LIKE ? OR DATE_FORMAT(b.date, '%Y-%m-%d') LIKE ?
        ORDER BY b.date ASC, b.time ASC`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
        function(err, results) {
            if (err) {
                console.log('Search error:', err);
                return res.send('Error searching bookings');
            }
            
            res.render('adminAllBookings', {
                bookingData: results,
                searchTerm: searchTerm
            });
        }
    );
});

app.get('/adminAllBookings', requireAdmin, function(req, res) { // Admin view all bookings - only current and future bookings
    conn.query(
        `SELECT b.booking_id, b.date, b.time, b.notes, b.created_at, 
            u.user_id, u.name, u.phone_number, u.email
        FROM booking b JOIN users u     ON b.user_id = u.user_id  WHERE b.date >= CURDATE() 
        ORDER BY b.date ASC, b.time ASC`, // Only show current and future bookings
        
        function(err, results) {
            if (err) {
                console.log('Error fetching bookings:', err);
                return res.send('Error loading bookings');
            }
            res.render('adminAllBookings', { 
                bookingData: results,
                searchTerm: null // No search term on initial load
            });
        }
    );
});

app.get('/adminCreateUser', requireAdmin, function(req, res) { // Admin page to create a new user with default password
    res.render('adminCreateUser', { error: null });
});

app.post('/adminRegisterUser', requireAdmin, function(req, res) { // Admin creates a new user with default password
    const { name, email, phone_number } = req.body;
    const defaultPassword = 'Welcome123';
    
    // Hash the default password
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
    
    conn.query(
        'INSERT INTO users (name, email, phone_number, password) VALUES (?, ?, ?, ?)',
        [name, email, phone_number, hashedPassword],
        function(err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.render('adminCreateUser', { 
                        error: 'Email already exists!' 
                    });
                }
                console.log('Error creating user:', err);
                return res.render('adminCreateUser', { 
                    error: 'Error creating user' 
                });
            }
            res.redirect('/adminAllUsers');
        }
    );
});

app.get('/adminAllUsers', requireAdmin, function(req, res) { // Admin view all users - for editing and deleting users
    conn.query(
        'SELECT user_id, name, phone_number, email FROM users WHERE role != "admin" ORDER BY name',
        function(err, results) {
            console.log('Users found:', results.length);  // ← ADD THIS!
            console.log('Results:', results);   
            if (err) {
                console.log('Error fetching users:', err);
                return res.send('Error loading users');
            }
            
            res.render('adminAllUsers', {
                contactsData: results
            });
        }
    );
});

app.get('/adminEditUser', requireAdmin, function(req, res) { // Admin edit user page - for updating user info (except password)
    const userId = req.query.userId;
    
    conn.query(
        'SELECT * FROM users WHERE user_id = ?',
        [userId],
        function(err, results) {
            if (err || results.length === 0) {
                return res.send('User not found');
            }
            res.render('adminEditUser', {
                user: results[0],
                error: null
            });
        }
    );
});

app.post('/adminUpdateUser', requireAdmin, function(req, res) { // Admin updates user info (except password)
    const { userId, name, email, phone_number } = req.body;
    
    conn.query(
        'UPDATE users SET name = ?, email = ?, phone_number = ? WHERE user_id = ?',
        [name, email, phone_number, userId],
        function(err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    conn.query('SELECT * FROM users WHERE user_id = ?', [userId], function(err2, results) {
                        return res.render('adminEditUser', {
                            user: results[0],
                            error: 'Email already in use by another user!'
                        });
                    });
                } else {
                    return res.send('Error updating user');
                }
            } else {
                res.redirect('/adminAllUsers');
            }
        }
    );
});

app.listen(3000);
console.log('Node app is running on port 3000 MQ')
