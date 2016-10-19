'use strict';

let mongoose = require('mongoose');
const USER_SETTINGS = require('./user.constant');

module.exports = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        default: ''
    },

    // which provider was used for sign up
    provider: {
        type: String,
        enum: USER_SETTINGS.signUpProviders,
        required: true
    },

    signupDate: {
        type: Date
    },

    confirmationId: {
        type: String
    },

    confirmationDate: {
        type: Date
    }
});