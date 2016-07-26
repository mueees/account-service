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

    create_date: {
        type: Date,
        default: new Date()
    },

    confirmation_status: {
        type: Boolean,
        default: false
    },

    confirmation_id: {
        type: String
    },

    confirmation_date: {
        type: Date
    }
});