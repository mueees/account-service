'use strict';

let log = require('mue-core/modules/log')(module);
let error = require('mue-core/modules/error');
const API_PREFIX = '/api';

let UserManager = require('../modules/user').UserManager;
let USER_SETTINGS = require('../modules/user').USER_SETTINGS;

module.exports = function (app) {
    // status
    app.get(API_PREFIX + '/status', function (request, response) {
        response.send('ok');
    });

    /**
     *  Email exist but confirmationDate and confirmationId not
     *      means that user was signup by external providers.
     *          Save password.
     *          Send email with confirmation id.
     *
     *  Email, confirmationId exist but confirmationDate not
     *      means that user was signup by external providers and once
     *      tried to signup through WEB provider
     *          Don't save password, password already have to be saved.
     *          Generate new confirmationId.
     *          Send email with confirmation id.
     *
     *  Email, confirmationId and confirmationDate exist
     *      means that user already was sign up.
     *          Send the error message
     * */

    // sign up from the web provider
    app.put(API_PREFIX + '/signup', function (request, response, next) {
        UserManager.signup({
            provider: USER_SETTINGS.providers.web,
            userData: request.body
        }).then(function (user) {
            response.send('Please check your email.');
        }, function (error) {
            log.error(error);

            next(error.getHttpError(400, error));
        });
    });

    /**
     * Oauth request that API, when user signin through external
     * providers
     * */

    // sign up using external provider
    app.put(API_PREFIX + '/signup/provider/:provider', function (request, response, next) {
        UserManager.signup({
            provider: request.params.provider,
            userData: request.body
        }).then(function (user) {
            response.send(user);
        }, function (error) {
            log.error(error);

            next(error.getHttpError(400, error));
        });
    });

    // confirm user
    app.put(API_PREFIX + '/users/confirmation?:confirmation_id', function (request, response, next) {
        response.send({});
    });

    // get user, using user_id from header
    app.get(API_PREFIX + '/users', function (request, response, next) {
        response.send({});
    });

    // get user by id
    app.get(API_PREFIX + '/users/:id', function (request, response, next) {
        response.send({});
    });
};