'use strict';

let mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        default: ''
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