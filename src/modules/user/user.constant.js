const USER_SETTINGS = {
    providers: {
        web: 'web',
        facebook: 'facebook',
        google: 'google'
    }
};

USER_SETTINGS.signUpProviders = [
    USER_SETTINGS.providers.web,
    USER_SETTINGS.providers.facebook,
    USER_SETTINGS.providers.google
];

module.exports = USER_SETTINGS;