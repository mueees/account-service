'use strict';

let error = require('mue-core/modules/error');
const API_PREFIX = '/api';

let UserManager = require('../modules/user').UserManager;

module.exports = function (app) {
    // create user
    app.get(API_PREFIX + '/status', function (request, response, next) {
        response.send('ok');
    });

    // create user
    app.put(API_PREFIX + '/users', function (request, response, next) {
        response.send({});
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