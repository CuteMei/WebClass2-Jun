// generateHash.js
// Run this ONCE to get your hash, then delete it!
const bcrypt = require('bcrypt');

const password = 'test123'; // Your chosen test password
const hash = bcrypt.hashSync(password, 10);
console.log('Password:', password);
console.log('Hash:', hash);
