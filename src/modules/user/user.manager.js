'use strict';

let guid = require('mue-core/modules/guid');
let log = require('mue-core/modules/log')(module);
let UserResource = require('./user.resource');
let USER_SETTINGS = require('./user.constant');
let _ = require('lodash');
let utils = require('mue-core/modules/utils');
let action = require('mue-core/modules/action');
let crypto = require('crypto');

module.exports = {
    signup: signup,
    confirm: confirm,
    isCredentialValid: isCredentialValid,
    generateNewPasswordConfirmationId: generateNewPasswordConfirmationId,
    restorePassword: restorePassword,
    getAccount: getAccount
};

function getAccount(id) {
    return new Promise(function (resolve, reject) {
        if (!id) {
            reject({
                message: 'Invalid user id'
            });
        } else {
            UserResource.findOne({
                _id: id
            }).then(function (user) {
                if (user) {
                    resolve(user);
                } else {
                    reject({
                        message: 'Invalid user id'
                    });
                }
            }).catch(function (err) {
                log.error(err.message);

                reject({
                    message: 'Server error'
                })
            });
        }
    });
}

function restorePassword(newPassword, passwordConfirmationId) {
    return new Promise(function (resolve, reject) {
        if (!passwordConfirmationId) {
            reject({
                message: 'Password confirmation id invalid'
            });
        } else {
            UserResource.findOne({
                passwordConfirmationId: passwordConfirmationId
            }).then(function (user) {
                if (user) {
                    user.passwordConfirmationId = '';
                    user.password = encryptPassword(newPassword);

                    user.save()
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            log.error(err.message);

                            reject({
                                message: 'Server error. Cannot save new password'
                            });
                        });
                } else {
                    reject({
                        message: 'Invalid confirmation id'
                    });
                }
            }).catch(function (err) {
                log.error(err);

                reject('Server error');
            });
        }
    });
}

function generateNewPasswordConfirmationId(email) {
    return new Promise(function (resolve, reject) {
        if (!utils.isEmail(email)) {
            reject({
                message: 'Invalid email'
            });
        } else {
            UserResource.findOne({
                email: email
            }).then(function (user) {
                if (user) {
                    user.passwordConfirmationId = guid.generate();

                    resolve(user.passwordConfirmationId);

                    user.save().catch(function () {
                        log.error('Cannot save new passwordConfirmationId for user: ' + email);
                    });
                } else {
                    reject({
                        message: 'Cannot find user with such email: ' + email
                    });
                }
            }).catch(function (err) {
                log.error(err);

                reject('Server error');
            });
        }
    });
}

function isCredentialValid(email, password) {
    return new Promise(function (resolve, reject) {
        if (!isUserDataValid({
                email: email,
                password: password
            })) {

            return reject('Invalid credentials');
        }

        UserResource.findOne({
            email: email
        }).then(function (user) {
            if (user) {
                if (!user.confirmationDate) {
                    return reject('Please check and confirm your email');
                }

                if (encryptPassword(password) !== user.password) {
                    return reject('Email or password invalid');
                }

                resolve(user);
            } else {
                reject('Invalid credentials');
            }
        }).catch(function (err) {
            log.error(err);

            reject('Cannot find user');
        });
    });
}

function confirm(confirmationId) {
    return new Promise(function (resolve, reject) {
        if (!confirmationId) {
            log.error('Cannot find confirmation id');

            return reject('Cannot find confirmation id');
        }

        UserResource.findOne({
            confirmationId: confirmationId
        }).then(function (user) {
            if (!user) {
                log.error('Invalid confirmation id');

                reject('Invalid confirmation id');
            } else {
                if (user.confirmationDate) {
                    log.error('Account already confirmed');

                    reject('Account already confirmed');
                } else {
                    user.confirmationDate = new Date();
                    resolve(_.pick(user, ['_id', 'email']));

                    user.save();
                }
            }
        }).catch(function (err) {
            log.error(err);

            reject('Cannot confirm user');
        });
    });
}

function signup(data) {
    return new Promise(function (resolve, reject) {
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
    return new Promise(function (resolve, reject) {
        let user = _.pick(userData, 'email', 'password');

        if (isUserDataValid(user)) {
            canCreateUser(user.email)
                .then(function () {
                    user.password = encryptPassword(user.password);
                    user.provider = USER_SETTINGS.providers.web;
                    user.signupDate = new Date();
                    user.confirmationId = guid.generate();

                    UserResource.create(user)
                        .then(function (user) {
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
            reject('Invalid credentials');
        }
    });
}

function signUpByExternalProvider(userData, provider) {
    return new Promise(function (resolve, reject) {
        let user = _.map(userData, 'email');

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

            reject('Invalid credentials');
        }
    });
}

/*
 * HELPERS
 * */

function isSignUpProviderValid(provider) {
    return provider && _.includes(USER_SETTINGS.signUpProviders, 'web');
}

/**
 @param {password} string User password
 */
function encryptPassword(password) {
    var sha1 = crypto.createHash('sha1');

    sha1.update(password + '---' + password);

    return sha1.digest('hex');
}

function canCreateUser(email) {
    return new Promise(function (resolve, reject) {
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
    });
}

function isUserDataValid(userData) {
    return utils.isStringWithLength(userData.password) && utils.isEmail(userData.email);
}