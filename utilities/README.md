# AutoBk Controller Utilities

## generate_hash.js  
Generates a hash from a given input string  

### Usage
```bash
node utilities/generate_hash.js '<input-string>'
```
- **`<input-string>`**: The string you want to hash, should be a non-empty value.

## generate_jwt_secret.js  
Generates a JWT secret for use in your .env file

### Usage
```bash
node utilities/generate_jwt_secret.js
```

## test_password_hash.js
Tests a password against a stored hash to check if they match.

### Usage
```bash
node utilities/test_password_hash.js '<password>' '<stored-hash>'
```
- **`<password>`**: The password to test. It should be a non-empty string.
- **`<stored-hash>`**: The stored hash to test against. Ensure to wrap the hash in single quotes or escape $ characters to prevent shell interpretation.

## generate_device_dir.js
Generates a directory name from a given device ID. The directory name is a 10-digit string, padded with leading zeros if necessary.

### Usage
```bash
node generate_device_dir.js '<device-id>'
```
- **`<device-id>`**: The device ID to generate the directory name from. 

