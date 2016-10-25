'use strict';

let config = require('config');
let expect = require('chai').expect;
let asyncCheck = require('mue-core/modules/test-helper').asyncCheck;
let testHelper = require('../modules/test-helper');
let Interaction = require('../modules/interaction');
let Db = require('modules/db');

const API_PREFIX = '/api';

let interaction = new Interaction({
    baseUrl: 'http://localhost:' + config.get('network:port')
});

let userWebData;

describe('Routes', function () {
    before(function (done) {
        Db.initConnection({
            port: config.get('db:port'),
            name: config.get('db:name'),
            host: config.get('db:host')
        }).then(function () {
            done();
        }, function () {
            done(new Error('Cannot establish connection'));
        });
    });

    beforeEach(function (done) {
        userWebData = {
            email: 'test@gmail.com',
            password: 'testPassword'
        };

        testHelper.db.clear().then(function () {
            done();
        }, function () {
            done(new Error('Cannot establish connection'));
        })
    });

    after(function (done) {
        Db.closeConnection().then(function () {
            done();
        }, function () {
            done(new Error('Cannot close Db connection'));
        });
    });

    // Sign up
    it('should sign up user from web provider', function (done) {
        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).then(function (response) {
            asyncCheck(done, function () {
                expect(response._id).to.be.ok;
                expect(response.email).to.be.equal(userWebData.email);
            });
        }, function () {
            done(new Error('Cannot execute request'));
        });
    });

    it('should return error if user already sign up', function (done) {
        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).then(function () {
            interaction.request({
                url: API_PREFIX + '/signup',
                method: 'POST',
                data: userWebData
            }).catch(function (response) {
                asyncCheck(done, function () {
                    expect(response.message).to.be.equal('User already was created');
                });
            });
        }, function () {
            done(new Error('Cannot execute request'));
        });
    });

    it('should not sign up user due to invalid password', function(done){
        userWebData.password = '';

        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).catch(function (response) {
            asyncCheck(done, function () {
                expect(response.message).to.be.equal('Invalid credentials');
            });
        });
    });

    it('should not sign up user due to invalid email', function(done){
        userWebData.email = 'test!ff.com';

        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).catch(function (response) {
            asyncCheck(done, function () {
                expect(response.message).to.be.equal('Invalid credentials');
            });
        });
    });

    // Confirm user
    it('should confirm user', function (done) {
        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).then(function (user) {
            interaction.request({
                url: API_PREFIX + '/confirmation?confirmationId=' + user.confirmationId,
                method: 'GET'
            }).then(function () {
                done();
            }).catch(function () {
                done(new Error('Cannot confirm user'));
            });
        });
    });

    it('should not confirm user due to missing confirmation id', function (done) {
        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).then(function (user) {
            interaction.request({
                url: API_PREFIX + '/confirmation',
                method: 'GET'
            }).then(function () {
                done(new Error('Should not confirm user'));
            }).catch(function (response) {
                asyncCheck(done, function () {
                    expect(response.message).to.be.equal('Cannot find confirmation id');
                });
            });
        });
    });

    it('should not confirm user because user was confirmed before', function (done) {
        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).then(function (user) {
            interaction.request({
                url: API_PREFIX + '/confirmation?confirmationId=' + user.confirmationId,
                method: 'GET'
            }).then(function () {
                interaction.request({
                    url: API_PREFIX + '/confirmation?confirmationId=' + user.confirmationId,
                    method: 'GET'
                }).then(function () {
                    done(new Error('Should not confirm user'));
                }).catch(function (response) {
                    asyncCheck(done, function () {
                        expect(response.message).to.be.equal('Account already confirmed');
                    });
                });
            })
        });
    });

    it('should not confirm user because of invalid confirmation id', function (done) {
        interaction.request({
            url: API_PREFIX + '/signup',
            method: 'POST',
            data: userWebData
        }).then(function (user) {
            interaction.request({
                url: API_PREFIX + '/confirmation?confirmationId=' + 'FAKE_ID',
                method: 'GET'
            }).then(function () {
                done(new Error('Should not confirm user'));
            }).catch(function (response) {
                asyncCheck(done, function () {
                    expect(response.message).to.be.equal('Invalid confirmation id');
                });
            });
        });
    });
});