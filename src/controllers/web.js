const ignore = !!eval(process.env.ignore || false);

function isLoggedIn(req, res, next) {
    if (req.user && req.user.banned) {
        if (req.isAuthenticated()) {
            req.session.destroy();
        }
        return res.err(403);
    }
    if (ignore || req.isAuthenticated()) {
        return next();
    }
    return res.redirect('/login');
}

module.exports = (baseRedirectUrl, app, apiProxy) => {
    app.all('*', isLoggedIn, (req, res) => {
        apiProxy.web(req, res);
    });
}