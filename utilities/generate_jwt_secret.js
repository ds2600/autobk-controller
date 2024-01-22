/**
 * Generates a random string of 64 characters to be used as a JWT secret.
 * 
 * @returns {<string>} The random string.
 */
const crypto = require('crypto');
console.log(crypto.randomBytes(64).toString('hex'));