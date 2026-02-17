var express = require('express');
var app = express();
var session = require('express-session');
var conn = require('./dbConfig');
//const { title } = require('process');
var bcrypt = require('bcrypt');

app.set('view engine','ejs');
app.use(session({
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

app.get('/service', function(req, res){ // Service page
    res.render("service");
});

// FAQs page - static version for comparison
// Static FAQs version for comparison
app.get('/faqs1', function(req, res){ 
    res.render("faqs1");
});

// FAQs page - database-driven version
app.get('/faqs', function(req, res) { 
    conn.query('SELECT * FROM faqs ORDER BY faq_id', function(err, results) {
        if (err) {
            console.error('Error fetching FAQs:', err);
            return res.render('faqs', { faqData: [] }); // Render with empty data on error
        }
        res.render('faqs', { faqData: results });
    });
});

//Registration Route - Improced with validation and error handling
app.get('/register', function(req, res) {
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
    
            // 7. HASH PASSWORD & INSERT USER
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

// Reusable middleware for requires login 
function requireLogin(req, res, next) {
    if (req.session.loggedin) {
        next(); // logged in, continue
    } else {
        res.redirect('/login'); // Redirect to login page if not logged in
    }
}

//For user logged in. Apply requireLogin to both GET and POST
app.get('/userPage', requireLogin, function (req, res) {
    res.render('userPage', { 
        name: req.session.name, 
        phone: req.session.phone_number || '', // Handle case where phone_number might be null
    });
});

app.post('/userCreateBooking', requireLogin, function(req, res) {
    const { date, time, notes } = req.body;
    const user_id = req.session.user_id;
    
    conn.query(
        'INSERT INTO booking (user_id, date, time, notes) VALUES (?, ?, ?, ?)',
        [user_id, date, time, notes],
        function(err, result) {
            if (err) {
                return res.send('Error creating booking');
            }
            res.redirect('/myBookings');
        }
    );
});

app.get('/myBookings', requireLogin, function (req, res, next) {
    //Get only this user's bookings
    conn.query(
        `SELECT b.booking_id, b.date, b.time, b.notes, b.created_at,
            u.name, u.phone_number, u.email
            FROM booking b      JOIN users u ON b.user_id = u.user_id
            WHERE b.user_id = ?     ORDER BY b.date DESC, b.time ASC`,
            [req.session.user_id],
            function(err, results) {
            if (err) {
                console.log('Error fetching bookings:', err);
                return res.send('Error loading bookings');
            }
        res.render('myBookings', { 
            bookingData: results,
            message: null, // No message on initial load
        });
    });
});

app.post('/userCreateBooking', requireLogin, function(req, res) {
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
            // Create booking if no double booking
            conn.query(
            // Don't specify created_at - let MySQL handle it!
                'INSERT INTO booking (user_id, date, time, notes) VALUES (?, ?, ?, ?)',
                [user_id, date, time, notes],
                function(err, result) {
                    if (err) {
                        console.log('Error:', err);
                        return res.send('Error creating booking');
                    }
                    res.redirect('/myBookings');
            });
    })
});

// Reusable middleware for requires admin login 
function requireAdmin(req, res, next) {
    if (req.session.loggedin && req.session.role === 'admin') {
        next(); // logged in and is admin, continue
    } else {
        res.redirect('/login'); // Redirect to login page if not admin
    }
}

app.get('/adminPage', requireAdmin, function(req, res) {
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

app.post('/adminCreateBooking', requireAdmin, async function(req, res) {
    const { user_id, date, time, notes } = req.body;
    
    if (!user_id || !date || !time) {
        return res.send('Please select patient, date, and time!');
    }
    
    conn.query(
        'SELECT * FROM booking WHERE date = ? AND time = ?',         
        [date, time],
        function(err, results) {
            if (err) {
                console.log('Error checking booking:', err);
                return res.send('Error creating booking');
            }
            if (results.length > 0) {
                return res.send('This time slot is already booked! Please choose another one.');
            }
            //Create booking if no double booking
            conn.query(
                    'INSERT INTO booking (user_id, date, time, notes) VALUES (?, ?, ?, ?)',
                    [user_id, date, time, notes || null],
                    function(err, results) {
                        if (err) {
                            console.log('Error inserting booking:', err);
                            return res.send('Error creating booking');
                        }
                        console.log('Booking created successfully');
                        res.redirect('/allBookings');
                });
        });
});

app.get('/allBookings', requireAdmin, function(req, res) {
    conn.query(
        `SELECT b.booking_id, b.date, b.time, b.notes, b.created_at, u.name, u.phone_number, u.email
        FROM booking b JOIN users u     ON b.user_id = u.user_id    ORDER BY b.date DESC, b.time ASC`,
        function(err, results) {
            if (err) {
                console.log('Error fetching bookings:', err);
                return res.send('Error loading bookings');
            }
            res.render('allBookings', { 
                bookingData: results,
                message: null, // No message on initial load
            });
        }
    );
});

app.get('/allUsers', requireAdmin, function(req, res) {
    conn.query(
        'SELECT user_id, name, phone_number, email FROM users WHERE role != "admin" ORDER BY name',
        function(err, results) {
            console.log('Users found:', results.length);  // ← ADD THIS!
            console.log('Results:', results);   
            if (err) {
                console.log('Error fetching users:', err);
                return res.send('Error loading users');
            }
            
            res.render('allUsers', {
                contactsData: results
            });
        }
    );
});

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000);
console.log('Node app is running on port 3000 MQ')
