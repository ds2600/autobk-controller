// api/v1/controllers/ldapController.js

require('dotenv').config();
const ldap = require('ldapjs');
const { createLogger } = require('../../../config/logConfig.js');
const logger = createLogger('ldapController');


const ldapController = {
    /**
     * Authenticates a user with their email and password using LDAP.
     * @param {string} email - The email of the user trying to log in.
     * @param {string} password - The password of the user trying to log in.
     * @returns {Promise<Object>} A promise that resolves to an object containing the user's information if authentication is successful.
     * @throws {Error} Throws an error if the login process fails, such as if the credentials are invalid or a server error occurs.
     */
    async authenticateWithLDAP(email, password) {
        const client = ldap.createClient({
            url: process.env.LDAP_URL
        });

        return new Promise((resolve, reject) => {
            logger.info('LDAP authentication attempt: ' + email);
            client.bind(process.env.LDAP_BIND_DN, process.env.LDAP_BIND_PASSWORD, (err) => {
                if (err) {
                    client.unbind();
                    logger.error('LDAP binding failed: ' + err);
                    reject(err);
                    return;
                } 
                // Search the LDAP directory to retrieve user information
                const searchOptions = {
                    filter: `(cn=${email})`,
                    scope: 'sub',
                };

                client.search(process.env.LDAP_SEARCH_BASE, searchOptions, (err, res) => {
                    let userInfo = null;

                    res.on('searchEntry', (entry) => {
                        userInfo = entry.object;
                    });

                    res.on('end', async (result) => {
                        if (result.status !== 0 || !userInfo) {
                            client.unbind();
                            logger.warn('User not found in LDAP: ' + email);
                            reject(new Error('LDAP search failed with status: ' + result.status));
                            return;
                        } 

                        client.bind(userInfo.dn, password, (err) => {
                            client.unbind();
                            if (err) {
                                logger.warn('LDAP authentication failed: ' + email);
                                reject(err);
                            } else {
                                logger.info('LDAP authentication successful: ' + email);
                                resolve(userInfo);
                            }
                        });
                    });
                    res.on('error', (err) => {
                        logger.error('LDAP search error: ' + err);
                        client.unbind();
                        reject('LDAP search error: ' + err.message);

                    });
                });
            });
        });
    }
};