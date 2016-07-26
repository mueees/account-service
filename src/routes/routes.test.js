'use strict';

let Interaction = require('modules/interaction');

let interaction = new Interaction({
    baseUrl: 'http://localhost:' + config.get('network:port')
});

describe('Routes', function () {
    it('should sign up user using web provider', function (done) {
        interaction.request({
            url: API_PREFIX + '/tags',
            method: 'PUT',
            data: tagData
        }).then(function (response) {
            asyncCheck(done, function () {
                expect(response.body._id).to.be.ok;
            });
        }, function () {
            done(new Error('Cannot execute request'));
        });
    });
});