'use strict';

let _ = require('lodash');

let log = require('mue-core/modules/log')(module);
let error = require('mue-core/modules/error');
const API_PREFIX = '/api';

let UserManager = require('../modules/user').UserManager;
let USER_SETTINGS = require('../modules/user').USER_SETTINGS;

module.exports = function (app) {
    // sign up from the web provider
    app.post(API_PREFIX + '/signup', function (request, response, next) {
        UserManager.signup({
            provider: USER_SETTINGS.providers.web,
            userData: request.body
        }).then(function (user) {
            response.send(_.pick(user, ['email', '_id', 'confirmationId']));
        }).catch(function (err) {
            log.error(err);

            next(error.getHttpError(400, err));
        });
    });

    // confirm user
    app.get(API_PREFIX + '/confirmation?:confirmationId', function (request, response, next) {
        UserManager.confirm(request.query.confirmationId).then(function () {
            response.send();
        }).catch(function (err) {
            next(error.getHttpError(400, err));
        });
    });

    /**
     * Oauth request that API, when user signin through external
     * providers
     * */
    // sign up using external provider
    /*app.post(API_PREFIX + '/signup/provider/:provider', function (request, response, next) {
        UserManager.signup({
            provider: request.params.provider,
            userData: request.body
        }).then(function (user) {
            response.send(user);
        }, function (error) {
            log.error(error);

            next(error.getHttpError(400, error));
        });
    });*/

    // get user, using user_id from header
    /*app.get(API_PREFIX + '/users', function (request, response, next) {
        response.send({});
    });*/

    // get user by id
    /*app.get(API_PREFIX + '/users/:id', function (request, response, next) {
        response.send({});
    });*/
};