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

console.log('Password to test:', passwordToTest);
console.log('Stored hash:', storedHash);

bcrypt.compare(passwordToTest, storedHash)
  .then(isMatch => {
    console.log('Password match:', isMatch);
  })
  .catch(err => {
    console.error('Error during comparison:', err.message);
  });
