'use strict';

let UserResource = require('../user').UserResource;

function clear() {
    return Promise.all([
        UserResource.remove(),
    ]);
}

exports.db = {
    clear: clear
};