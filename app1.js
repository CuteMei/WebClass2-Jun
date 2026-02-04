var express = require('express');
var app = express();
var session = require('express-session');
var conn = require('./dbConfig'); 
var bcrypt = require('bcrypt');

const { title } = require('process');
const { error } = require('console');

app.set('view engine','ejs');
app.use(session({
    secret: 'yoursecret', //'myuniquesecretopsecret'
    resave: true,
    saveUninitialized: true
}));

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res, next){
    res.render("home");
});

app.get('/home1', function(req, res){
    res.render("home1",{session: req.session});
});

app.get('/service', function(req, res){
    res.render("service");
});

app.get('/faqs', function(req, res){
    res.render("faqs");
});

app.get('/register', function(req, res) {
    res.render("register",{title: 'Register Page'});
});

app.post('/register', async function (req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let passwordVerify = req.body.passwordVerify;

    if (password == passwordVerify) {
        var hashedPassword = bcrypt.hashSync(password, 10);
        console.log('Hashed Password:', hashedPassword);

        //const ok = await bcrypt.compare(password, u.password_hash || '');
        //const hash = await bcrypt.hash(password, 10);
        //const isMatch = await bcrypt.compare(inputPassword, hash);
        
        connection.query(
            'INSERT INTO users (name, password, email, role) VALUES ("${name}","${hashedPassword}","${email}", "user")', 

            function(err, result, fields) {
                if (err) {
                console.log('Oops an error occurred:', err);
                } 
                else {
                    console.log('New record inserted into users table');
                    req.session.newUser = username;
                    res.render('home', { session: req.session });
                }
            }
        );
        console.log('Username Value: $(username)');
        console.log('Email Value: $(email)');
        console.log('Password Value: $(password)');
        console.log('Password Verify Value: $(passwordVerify)');
    }
    else {
        res.send('Password do not match. Please try again.');
        //res.end();
    }
});

app.get('/login', function(req, res, next) {
    res.render("login",{title: 'Login Page'});
});

app.post('/auth', function(req, res,) {
    let name = req.body.name;
    let password = req.body.password;
    if (name && password) {
        conn.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password],
            function (error, results, fields) {
                if (error) throw error;
                if (results.length >0) {
                    req.session.loggedin = true;
                    req.session.name = name;
                    //req.session.username = name;
                    res.redirect('/membersOnly');
                } else {
                    res.send('Incorrect Name and/or Password!');
                }
                res.end();
            });
    } else {
        res.send('Please enter Name and Password please!');
        res.end();
    }
})

// Users can access this if they are logged in
app.get('/membersOnly', function (req, res, next) {
    if (req.session.loggedin) {
        res.render('membersOnly');
    }
    else {
        res.send('Please login to view this page!');
    }
});

// Users can access this if they are logged in
app.get('/addMPS', function (req, res) {
    if (req.session.loggedin) {
        res.render('addMPs');
    }
    else {
        res.send('Please login to view this page!');
    }
});

// Users can access this only if they are logged in
app.post('/addMPs', function (req, res) {
    let id = req.body.id;
    let name = req.body.name;
    let party = req.body.party;
    let sql = `INSERT INTO booking (id, name, date, time) VALUES ("${id}", "${name}", "${date}", "${time})`;    
    conn.query(sql, function(err, result) {
        if (err) throw err;
        console.log('record inserted');
        res.render('booking');
    }); //console.log(result);
});

app.get('/listBooking', function(req, res){
    conn.query('SELECT * FROM booking', function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('listBooking', { title: 'List of Booking', bookingData: result});
    });    
});

app.get('/listContacts', function(req, res){
    conn.query('SELECT * FROM contacts', function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('listContacts', { title: 'List of Contacts', contactsData: result});
    });    
});

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000);
console.log('Node app is running on port 3000 MQ')
