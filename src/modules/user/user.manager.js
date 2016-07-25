'use strict';

let UserResource = require('./user.resource');

module.exports = {
    create: function (userData) {
        return UserResource.create(userData);
    }
};