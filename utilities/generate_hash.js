/**
 * Generates a hash from a password.
 * 
 * @param {string} password - The password to hash.
 * @returns {<string>} The hashed password.
 */

const bcrypt = require('bcryptjs');

bcrypt
  .hash(process.argv[2], 10)
  .then(hash => {
    console.log(hash);
  })
  .catch(err => console.error(err.message));