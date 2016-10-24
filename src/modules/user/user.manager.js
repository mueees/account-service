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
    confirm: confirm
};

function confirm(confirmationId){
    return new Promise(function (resolve, reject) {
        if(!confirmationId){
            log.error('Cannot find confirmation id');

            return reject('Cannot find confirmation id');
        }

        UserResource.findOne({
            confirmationId: confirmationId
        }).then(function (user) {
            if(!user){
                log.error('Invalid confirmation id');

                reject('Invalid confirmation id');
            }else{
                if(user.confirmationDate){
                    log.error('Account already confirmed');

                    reject('Account already confirmed');
                }else{
                    user.confirmationDate = new Date();
                    resolve();

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
            reject('Invalid user data');
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

            reject('Invalid user data');
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

function isUserDataValid(userData){
    return utils.isStringWithLength(userData.password) && utils.isEmail(userData.email);
}