var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'localhost',
    port: 3307, // add port
    user: 'root',
    password: '',
    database: 'webclass2db'
});
conn.connect(function(err) {
    if (err) throw err;
    console.log('Database connected');
});

module.exports = conn;