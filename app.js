var express = require('express');
var app = express();
var session = require('express-session');
var conn = require('./dbConfig'); //const { error } = require('console');
const { title } = require('process');
var bcrypt = require('bcrypt');

app.set('view engine','ejs');
app.use(session({
    secret: 'yoursecret',
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

app.get('/faqs', function(req, res){
    res.render("faqs");
});

app.get('/register', function(req, res) {
    res.render("register");
});

app.post('/register', function (req, res) {

    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let passwordVerify = req.body.passwordVerify;

    // Add validation for empty fields
    if (!name || !email || !password || !passwordVerify) {
        return res.send('All fields are required!');
    }
    
    if (password !== passwordVerify) {
        return res.send('Passwords do not match. Please try again.');
    }

    var hashedPassword = bcrypt.hashSync(password, 10);
    conn.query(
        `INSERT INTO users (name, password, email) VALUES (?, ?, ?)`, //use parameterized query
        [name, hashedPassword, email],
        function(err, results, fields) {
            if (err) {
                console.log('Error inserting record: ', err);
                return res.send('Error inserting record'); //send error response
            }
                
            console.log('Record inserted successfully');
            res.render('login');
        } 
    );
});

app.get('/login', function(req, res) {
    res.render("login");
});

app.post('/auth', async function(req, res) { //added async
    var name = req.body.name;
    var password = req.body.password;
    let role = null;
    
    // Add validation for empty fields
    if (!name || !password) {
        return res.send('Please enter Name and Password please!'); // Fixed: added return to prevent further execution
    }

    conn.query('SELECT * FROM users WHERE name = ?', [name],    
        async function (error, results, fields) {
            if (error) throw error;

            if (results.length >0) {
                const ok = await bcrypt.compare(password, results[0].password);// column name 'password' in db
                if (ok) {
                    req.session.loggedin = true;
                    req.session.name = name;
                    req.session.role = results[0].role; // Store user role in session
                    role = results[0].role;
                    //console.log('User logged in:', name, 'Role:', req.session.role);
                    if (role === 'admin') {
                        res.redirect('/adminPage'); // Redirect to admin dashboard
                    }else {
                        res.redirect('/newBooking'); // Redirect to user dashboard
                    }
                    res.end();
                }
        } else {
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

// Apply requireLogin to both GET and POST
app.get('/newBooking', requireLogin, function (req, res) {
    res.render('newBooking', { message: null });
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
