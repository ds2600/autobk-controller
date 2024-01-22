/**
 * Test a password against a stored hash.
 * 
 * @param {string} password - The password to test.
 * @param {string} storedHash - The hash to test against.
 * @returns {<boolean>} Whether the password matches the hash.
 */
const bcrypt = require('bcryptjs');

const passwordToTest = process.argv[2]; 
const storedHash = process.argv[3];

const isMatch = bcrypt.compareSync(passwordToTest, storedHash);
console.log('Password match:', isMatch);
