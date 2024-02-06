/**
 * Generates a directory name from a given device ID. The generated directory name 
 * is a string of 10 numerical digits, padded with leading zeros if necessary.
 *
 * @param {string} deviceId - The device ID from the command line argument.
 * @returns {void} Outputs the generated directory name to the console.
 */
// Get the device ID from command line argument
const deviceId = process.argv[2];

// Check if the device ID is provided and is a valid number
if (!deviceId || deviceId.length > 10) {
    console.error("Please provide a valid device ID.");
    process.exit(1);
}

const dir = deviceId.toString().padStart(10, '0');

console.log(dir);