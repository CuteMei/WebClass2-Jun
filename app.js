var express = require('express');
var app = express();
var session = require('express-session');
var conn = require('./dbConfig'); //const { error } = require('console');
const { title } = require('process');
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

app.get('/login', function(req, res) {
    res.render("login.ejs");
});

app.post('/auth', function(req, res) {
    let name = req.body.username;
    let password = req.body.password;
    if (name && password) {
        conn.query('SELECT * FROM users WHERE name = ? AND password = ?', [name, password],
            function (error, results, fields) {
                if (error) throw error;
                if (results.length >0) {
                    req.session.loggedin = true;
                    req.session.username = name;
                    res.redirect('/membersOnly');
                } else {
                    res.send('Incorrect Username and/or Password!');
                }
                res.end();
            });
    } else {
        res.send('Please enter Username and Password!');
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
app.get('/addMps', function (req, res, next) {
    if (req.session.loggedin) {
        res.render('addMPs');
    }
    else {
        res.send('Please login to view this page!');
    }
});
// Users can access this only if they are logged in
app.post('/addMPs', function (req, res, next) {
    var id = req.body.id;
    var name = req.body.name;
    var party = req.body.party;
    var sql = `INSERT INTO mps (id, name, party) VALUES ("${id}", "${name}", "${party}")`;    
    conn.query(sql, function(err, result) {
        if (err) throw err;
        console.log('record inserted');
        res.render('addMPs');
    }); //console.log(result);
});

app.get('/listMPs', function(req, res){
    conn.query('SELECT * FROM mps', function (err, result) {
        if (err) throw err;
        console.log(result);
        res.render('listMPs', { title: 'List of NZ MPs', MPsData: result});
    });    
});

app.get('/service', function(req, res){
    res.render("service");
});

app.get('/faqs', function(req, res){
    res.render("faqs");
});

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3000);
console.log('Node app is running on port 3001 MQ')
