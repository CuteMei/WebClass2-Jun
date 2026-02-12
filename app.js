var express = require('express');
var app = express();
var session = require('express-session');
var conn = require('./dbConfig');
//const { title } = require('process');
var bcrypt = require('bcrypt');

app.set('view engine','ejs');
app.use(session({
    secret: 'jHh2026SecureRandomString!@#',
    resave: true,
    saveUninitialized: true
}));

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res){
    res.render("home");
});

app.get('/service', function(req, res){
    res.render("service");
});

// Static FAQs version for comparison
app.get('/faqs1', function(req, res){
    res.render("faqs1");
});
// Database-driven FAQs version
app.get('/faqs', function(req, res) {
    conn.query('SELECT * FROM faqs ORDER BY faq_id', function(err, results) {
        if (err) {
            console.log('Error fetching FAQs:', err);
            return res.send('Error loading FAQs.');
        }
        res.render('faqs', { faqData: results });
    });
});

//Refistration Route.
app.get('/register', function(req, res) {
    res.render("register", {
        error: null,
        success: null }); // Pass null for error and success on initial load
});

app.post('/register', function (req, res) {
    //debug:see what is received from form
    //console.log('Form data received:', req.body);
    let { name, email, phone_number, password, passwordVerify } = req.body; //destructuring assignment
    
    //4xx = "YOU (user) messed up!", 5xx = "I (server) messed up!", 2xx = "We're good!" 

    // 1. VALIDATION - Check for empty fields
    if (!name || !phone_number || !email || !password || !passwordVerify) {
        return res.status(400).render('register', { 
            // 400 = USER'S fault - they sent bad data
            // 400 = Bad Request (Invalid data sent)
             error: 'All fields are required! Please fill in all the details.' 
        }); 
    }
    
    // 2. EMAIL FORMAT VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).render('register', { // 400 = USER'S fault - duplicate email
            error: 'Please enter a valid email address!' 
        });
    }

    // 3. PHONE NUMBER VALIDATION (basic - adjust for your country format)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone_number.replace(/[-\s]/g, ''))) {
        return res.status(400).render('register', { 
            error: 'Please enter a valid phone number!' 
        });
    }

    // 4. PASSWORD STRENGTH CHECK
    if (password.length < 8) {
        return res.status(400).render('register', { 
            error: 'Password must be at least 8 characters long!' 
        });
    }

    // 5. PASSWORD MATCH CHECK
    if (password !== passwordVerify) {
        return res.status(400).render('register', { 
            error: 'Passwords do not match!' 
        });
    }

    // 6. CHECK IF EMAIL ALREADY EXISTS
    conn.query(
        'SELECT email FROM users WHERE email = ?', [email], 
        // Layer 1: CODE CHECK (in app.js)
        //-- Layer 2: DATABASE CHECK (in MySQL)
        //ALTER TABLE users ADD UNIQUE KEY unique_email (email);
        //-- This means MySQL itself rejects duplicate emails!
        function(err, results) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).render('register', { 
                    // 500 = Internal Server Error (Something broke in your code)
                    // 500 = SERVER'S fault - database crashed or query is wrong
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
                'INSERT INTO users (name, phone_number, email, password) VALUES (?, ?, ?, ?)', //use parameterized query
                [name, phone_number, email, hashedPassword], //pass values as array
                function(err, results) {
                    if (err) {
                        console.error('Error inserting user:', err);
                        return res.status(500).render('register', { 
                            error: 'Registration failed. Please try again.' 
                        });
                    }
                    console.log('✅ User registered successfully:', email);
                    res.render('login', { 
                        success: 'Registration successful! Please login.' 
                    });
                }
            );
        }
    );
});

app.get('/login', function(req, res) {
    res.render("login");
});

app.post('/auth', async function(req, res) { //added async
    var email = req.body.email;
    var password = req.body.password;
    
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
                    //Passwords match, set session variables
                    req.session.loggedin = true;
                    req.session.email = email;
                    req.session.name = results[0].name;
                    req.session.user_id = results[0].user_id; //Important for bookings!
                    req.session.role = results[0].role; // Store user role in session
                    
                    console.log('User logged in:', email, 'Role:', req.session.role);
                    
                    if (results[0].role === 'admin') {
                        res.redirect('/adminPage'); // Redirect to admin dashboard
                    }else {
                        res.redirect('/userPage'); // Redirect to user dashboard
                    }
                } else {
                    //passwords incorrect.
                    res.send('Incorrect Name and/or Password!');
                }
            } else {
                //user not found.
                res.send('Incorrect Name and/or Password!');
            }
        });
})  

// Reusable middleware: protects any route that requires login
function requireLogin(req, res, next) {
    if (req.session.loggedin) {
        next(); // logged in, continue
    } else {
        res.send('Please login to view this page!');
    }
}
// Apply requireLogin to both GET and POST
app.get('/adminPage', requireLogin, function (req, res) {
    res.render('adminPage', { message: null });
});
app.post('/adminPage', requireLogin, function (req, res, next) {
    var name = req.body.name;
    var phone = req.body.phone;
    var date = req.body.date;
    var time = req.body.time;

    // Fixed: use parameterized query instead of template literal
    var sql = 'INSERT INTO booking (name, phone, date, time) VALUES (?, ?, ?, ?)';
    conn.query(sql, [name, phone, date, time], function(err, result) {
        if (err) {
            console.log('Error inserting booking:', err);
            return res.send('Error creating booking.');  // Fixed: don't crash on error
        }
        console.log('record inserted');
        res.render('adminPage', { message: 'Booking added successfully!' });
    });
});
app.get('/newBooking', requireLogin, function (req, res) {
    res.render('newBooking', { message: null, name:req.session.name });
});
  
app.post('/newBooking', requireLogin, function (req, res, next) {
    var name = req.body.name;
    var phone = req.body.phone;
    var date = req.body.date;
    var time = req.body.time;

    // Fixed: use parameterized query instead of template literal
    var sql = 'INSERT INTO booking (name, phone, date, time) VALUES (?, ?, ?, ?)';
    conn.query(sql, [name, phone, date, time], function(err, result) {
        if (err) {
            console.log('Error inserting booking:', err);
            return res.send('Error creating booking.');  // Fixed: don't crash on error
        }
        console.log('record inserted');
        res.render('newBooking', { message: 'Booking added successfully!' });
    });
});

// Apply requireLogin to both GET and POST
app.get('/newBookingA', requireLogin, function (req, res) {
    res.render('newBookingA', { message: null });
});
  
app.post('/newBookingA', requireLogin, function (req, res, next) {
    var name = req.body.name;
    var phone = req.body.phone;
    var date = req.body.date;
    var time = req.body.time;

    // Fixed: use parameterized query instead of template literal
    var sql = 'INSERT INTO booking (name, phone, date, time) VALUES (?, ?, ?, ?)';
    conn.query(sql, [name, phone, date, time], function(err, result) {
        if (err) {
            console.log('Error inserting booking:', err);
            return res.send('Error creating booking.');  // Fixed: don't crash on error
        }
        console.log('record inserted');
        res.render('newBookingA', { message: 'Booking added successfully!' });
    });
});

app.get('/listBooking', requireLogin, function(req, res) {
    conn.query('SELECT booking.id, users.name, users.email, booking.phone, booking.date, booking.time FROM booking JOIN users ON booking.name = users.name', function (err, result) {
        if (err) {
            console.log('Error fetching bookings:', err);
            return res.send('Error loading bookings.');  // Fixed: don't crash on error
        }
        console.log(result);
        res.render('listBooking', { title: 'List of Booking', bookingData: result });
    });    
});

app.get('/listContacts', function(req, res){
    conn.query('SELECT * FROM users', function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('listContacts', { title: 'List of Contacts   ', contactsData: result});
    });    
});

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000);
console.log('Node app is running on port 3000 MQ')
