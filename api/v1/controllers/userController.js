// api/v1/controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { generateUniqueToken, sendPasswordResetEmail, validateResetToken } = require('../../../utilities/emailUtils');
const { createLogger } = require('../../../config/logConfig.js')
const logger = createLogger('userController');

const userController = {

    /**
     * Authenticates a user with their email and password.
     * Logs the login attempt and the result of the attempt.
     * @param {string} email - The email of the user trying to log in.
     * @param {string} password - The password of the user trying to log in.
     * @returns {Promise<Object>} A promise that resolves to an object containing the JWT token and user level if authentication is successful.
     * @throws {Error} Throws an error if the login process fails, such as if the credentials are invalid, the account is locked, or a server error occurs.
     */
    async login(email, password) {
        logger.info('Login attempt: ' + email);
        
        try {
            const user = await db.User.findOne({ where: { email } });

            if (!user) {
                logger.warn('User does not exist: ' + email);
                throw new Error('Invalid credentials');
            }

            if (user.isLocked) {
                logger.warn('Account locked: ' + email);
                throw new Error('Account locked');
            }

            if (bcrypt.compareSync(password, user.passwordHash)) {
                user.loginAttempts = 0;
                user.lastLogin = new Date();
                await user.save();
                logger.info('Login successful: ' + email);

                const token = jwt.sign({ userId: user.kSelf, userLevel: user.userLevel }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
                return { token, userLevel: user.userLevel, userEmail: user.email};
            } else {
                user.loginAttempts++;
                logger.warn('Invalid password: ' + email);
                if (user.loginAttempts >= process.env.LOGIN_ATTEMPTS_THRESHOLD) {
                    user.isLocked = true;
                    logger.warn('Account has been locked: ' + email);
                }

                await user.save();

                throw new Error('Invalid credentials');
            } 
        } catch (error) {
                logger.error('Error logging in: ' + error);
                throw error;
        }
    },

    /**
     * Registers a new user with an email, password, and user level.
     * Hashes the user's password before storing it in the database.
     * @param {string} email - The email of the new user.
     * @param {string} password - The password of the new user.
     * @param {string} userLevel - The level or role of the new user.
     * @returns {Promise<Object>} A promise that resolves to an object containing a success message and the user ID of the newly created user.
     * @throws {Error} Throws an error if the registration process fails, such as if the email is not unique or a server error occurs.
     */
    async register(email, password, userLevel) {
        try {

            // hash password
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(password, salt);

            const newUser = await db.User.create({
                email,
                passwordHash,
                userLevel
            });
            logger.info('Administrator created a new user account: ' + email);
            return { message: 'User created successfully', userId: newUser.kSelf };
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                logger.error('Attempt to create user with duplicate email: ' + email);
            } else {
                logger.error('Error creating user: ' + error);
            }
            throw error; 
        }
    },

    /**
     * Update user settings.
     * @param {number} userIdToUpdate - ID of the user to update.
     * @param {Object} userUpdates - Updates to be applied.
     * @param {number} loggedInUserId - ID of the logged in user.
     * @param {string} loggedInUserRole - Role of the logged in user.
     * @returns {Promise<Object>} - The updated user information.
     */
    async updateSettings(userIdToUpdate, userUpdates, loggedInUserId, loggedInUserRole) {
        try {
            // Allow user to update their own settings or allow Administrator to update any user's settings
            if (loggedInUserId !== userIdToUpdate && loggedInUserRole !== 'Administrator') {
                logger.warning('User does not have permission to update user settings: ' + loggedInUserId);
                return { message: "Forbidden" };
            }

            // Find the user by ID
            const user = await db.User.findByPk(userIdToUpdate);
            if (!user) {
                logger.warning('User not found while updating: ' + userIdToUpdate);
                return { message: "User not found" };
            }

            // Update allowed fields, with special rules for certain fields
            Object.keys(userUpdates).forEach(key => {
                if (key === 'kSelf') {
                    // Skip updating kSelf
                } else if (key === 'userLevel' && loggedInUserRole !== 'Administrator') {
                    // Only allow Administrators to update userLevel
                } else if (key === 'passwordHash') {
                    // Skip updating passwordHash directly, handle through a separate endpoint
                } else if (key in user) {
                    user[key] = userUpdates[key];
                }
            });

            await user.save();
            logger.info('User [' + loggedInUserId + '] updated settings for: ' + user.kSelf);
            return { message: 'User settings updated successfully' };
        } catch (error) {
            logger.error('Error updating user settings: ' + error);
            throw error.message;
        }

    },

   /**
    * Change a user's password.
    * 
    * @param {string} currentPassword 
    * @param {string} newPassword 
    * @param {number} userId 
    * @returns {Promise<Object>} - A promise that resolves to an object containing a success message.
    * @throws {Error} - Throws an error if the password change process fails, such as if the current password is incorrect or a server error occurs.
    */
    async changePassword(currentPassword, newPassword, userId) {
        try {
            const user = await db.User.findByPk(userId);
            if (!user) {
                logger.warn('User not found while changing password: ' + userId);
                return { message: "User not found" };
            }
    
            // Verify current password
            if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
                logger.warn('User attempted to change password with incorrect current password: ' + userId);
                return { message: 'Incorrect current password' };
            }
    
            // Update with new hashed password
            user.passwordHash = bcrypt.hashSync(newPassword, 10);
            await user.save();
            
            logger.info('User [' + userId + '] changed their password');
            return { message: 'Password updated successfully' };
        } catch (error) {
            logger.error('Error changing password: ' + error);
            throw error;
        }
    },

    /**
     * Deletes a user
     * @param {number} userIdToDelete 
     * @param {number} loggedInUserId 
     * @returns {Promise<Object>} - A promise that resolves to an object containing a success message.
     * @throws {Error} - Throws an error if the deletion process fails, such as if the user is not found or a server error occurs.
     */
    async deleteUser(userIdToDelete, loggedInUserId) {
        try {
            // Check if the user trying to delete is not deleting their own account
            if (loggedInUserId === userIdToDelete) {
                logger.warn('User attempted to delete own account: ' + userIdToDelete);
                return { message: "Cannot delete own user account" };
            }

            const result = await db.User.destroy({
                where: { kSelf: userIdToDelete }
            });

            if (result === 0) {
                logger.warn('User not found while deleting: ' + userIdToDelete);
                return { message: 'User not found' };
            }

            logger.warn('User [' + loggedInUserId + '] account deleted user: ' + userIdToDelete);
            return { message: 'User deleted successfully' };
        } catch (error) {
            logger.error('Error deleting user: ' + error);
            throw error;
        }
    },

    /**
     * Get a user by ID
     * @param {number} userId
     * @returns {Promise<Object>} - A promise that resolves to an object containing the user information.
     * @throws {Error} - Throws an error if the user is not found or a server error occurs.
     */
    async getUser(userId) {
        try {
            const user = await db.User.findByPk(userId, {
                attributes: { exclude: ['passwordHash'] } 
            });

            if (!user) {
                logger.warn('User not found: ' + userId);
                return { message: 'User not found' };
            }

            return user;
        } catch (error) {
            logger.error('Error getting user: ' + error);
            throw error;
        }
    },

    /**
     * Get all users
     * @returns {Promise<Array>} - A promise that resolves to an array of user objects.
     * @throws {Error} - Throws an error if a server error occurs.
     */
    async getUsers() {
        try {
            const users = await db.User.findAll({
                attributes: { exclude: ['passwordHash'] } 
            });

            return users;
        } catch (error) {
            logger.error('Error getting all users: ' + error);
            throw error;
        }
    },

    /**
     * Request a password reset for a user.
     * @param {string} email 
     * @returns {Promise<Object>} - A promise that resolves to an object containing a success message.
     * @throws {Error} - Throws an error if the user is not found or a server error occurs.
     */
    async requestPasswordReset(email) {
        try {
            const user = await db.User.findOne({ where: { email } });
            if (!user) {
                logger.warn('User not found while requesting password reset: ' + email);
                return { message: 'User not found' };
            }

            const token = generateUniqueToken();
            user.resetToken = token;
            user.resetTokenExpires = new Date(Date.now() + process.env.RESET_TOKEN_EXPIRATION);
            await user.save();

            sendPasswordResetEmail(email, token);
            logger.info('Password reset requested for: ' + email);
            return { message: 'Password reset email sent' };
        } catch (error) {
            logger.error('Error requesting password reset: ' + error);
            throw error;
        }
    },

    /**
     * Reset a user's password using a token.
     * @param {string} token 
     * @param {string} newPassword 
     * @returns {Promise<Object>} - A promise that resolves to an object containing a success message.
     * @throws {Error} - Throws an error if the token is invalid, the user is not found, or a server error occurs.
     */
    async resetPassword(token, newPassword) {
        try {
            const isValidToken = validateResetToken(token);

            // Validate token
            if (!isValidToken) {
                logger.warn('Invalid or expired reset token: ' + token);
                return { message: 'Invalid or expired reset token' };
            }

            // Find the user by the reset token
            const user = await db.User.findOne({ where: { resetToken: token } });

            if (!user) {
                logger.warn('User not found while resetting password: ' + token);
                return { message: 'User not found' };
            }

            user.passwordHash = bcrypt.hashSync(newPassword, 10);
            user.resetToken = null;
            await user.save();

            logger.info('Password reset successfully for: ' + user.email);
            return { message: 'Password reset successfully' };
        } catch (error) {
            logger.error('Error resetting password: ' + error);
            throw error;
        }
    },

    /**
     * Unlock a user's account.
     * @param {number} userIdToUnlock 
     * @returns {Promise<Object>} - A promise that resolves to an object containing a success message.
     * @throws {Error} - Throws an error if the user is not found or a server error occurs.
     */
    async unlockAccount(userIdToUnlock) {
        try {
            const user = await db.User.findByPk(userIdToUnlock);
            if (!user) {
                logger.warn('User not found while unlocking account: ' + userIdToUnlock);
                return { message: 'User not found' };
            }

            user.loginAttempts = 0;
            user.isLocked = false;
            await user.save();

            logger.info('User account unlocked successfully: ' + user.email);
            return { message: 'User account unlocked successfully' };
        } catch (error) {
            logger.error('Error unlocking account: ' + error);
            throw error;
        }
    }
};

module.exports = userController;