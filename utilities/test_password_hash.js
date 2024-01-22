const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$NWcrnMPY0IL8e5zBpYRNwuul1pY5CN1AZtmWaaq.dGlCCAHjocZra';
const passwordToTest = 'p@ssw0rd'; 

const isMatch = bcrypt.compareSync(passwordToTest, storedHash);
console.log('Password match:', isMatch);
