'use strict';

let log = require('mue-core/modules/log')(module);
let UserResource = require('./user.resource');
let USER_SETTINGS = require('./user.constant');
let _ = require('lodash');
let utils = require('modules/utils');

module.exports = {
    signup: signup
};

function signup(data) {
    return Promise(function (resolve, reject) {
        if (isSignUpProviderValid(data.provider)) {
            if (data.provider === USER_SETTINGS.providers.web) {
                signUpByWebProvider(data.userData)
                    .then(resolve)
                    .catch(reject);
            } else {
                signUpByExternalProvider(data.userData, data.provider)
                    .then(resolve)
                    .catch(reject);
            }
        } else {
            log.error('Sign up provider invalid: ' + data.provider);
            reject('Invalid provider information');
        }
    });
}

function signUpByWebProvider(userData) {
    return Promise(function (resolve, reject) {
        let user = _.pick(userData, 'email', 'password');

        if (utils.isStringWithLength(user.password) && utils.isEmail(user.email)) {
            canCreateUser(user.email)
                .then(function () {
                    user.password = encryptPassword(user.password);
                    user.provider = USER_SETTINGS.providers.web;

                    UserResource.create(userData)
                        .then(function (user) {
                            // TODO: send email with confirmation id

                            resolve(user);
                        })
                        .catch(function (error) {
                            log.error(error);
                            reject('Cannot signup user');
                        });
                })
                .catch(function (error) {
                    log.error(error);

                    reject(error);
                });
        } else {
            log.error(user.email);
            log.error(user.password);

            reject('Invalid user data');
        }
    });
}

function signUpByExternalProvider(userData, provider) {
    return Promise(function (resolve, reject) {
        let user = _.pick(userData, 'email');

        if (utils.isEmail(user.email)) {
            canCreateUser(user.email)
                .then(function () {
                    user.provider = provider;

                    UserResource.create(userData)
                        .then(function (user) {
                            // TODO: send email that user was created using <PROVIDER>

                            resolve(user);
                        })
                        .catch(function (error) {
                            log.error(error);
                            reject('Cannot signup user');
                        });
                })
                .catch(function (error) {
                    log.error(error);

                    reject(error);
                });
        } else {
            log.error(user.email);

            reject('Invalid user data');
        }
    });
}

function isSignUpProviderValid(provider) {
    return provider && _.find(USER_SETTINGS.signUpProviders, provider);
}

/**
 @param {password} string User password
 */
function encryptPassword(password) {
    // TODO: add encryption for password
    return password + 'add encryption for password' + password;
}

function canCreateUser(email) {
    return Promise(function (resolve, reject) {
        getUserByEmail(email)
            .then(function (user) {
                if (user) {
                    reject('User already was created');
                } else {
                    resolve();
                }
            })
            .catch(function (error) {
                log.error(error);

                reject('Cannot find user');
            });
    });
}

function getUserByEmail(email) {
    return UserResource.findOne({
        email: email
    }).then(function (user) {
        return user;
    });
}

