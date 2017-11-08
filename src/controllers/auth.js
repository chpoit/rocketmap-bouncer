//I gave up on getting webpack to load the files properly so i'm doing it the lazy way
const signup = require("../../views/signup.html");
const login = require("../../views/login.html");
const ignore = !!eval(process.env.ignore || false);

function isLoggedIn(req, res, next) {
    if (req.user && req.user.banned) {
        if (req.isAuthenticated()) {
            req.session.destroy();
        }
        return res.err(403);
    }
    if (ignore || req.isAuthenticated()) {
        return res.redirect('/');
    }
    return next();
}

module.exports = (passport, app) => {

    //app.get('/login', (req, res) => res.render("../views/login.html"));    
    app.get('/login', isLoggedIn, (req, res) => res.send(login));
    app.post('/login', isLoggedIn, passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

    //app.get('/signup', (req, res) => res.render("../views/signup.html"));
    app.get('/signup', isLoggedIn, (req, res) => res.send(signup));
    app.post('/signup', isLoggedIn, passport.authenticate('local-signup', {
        successRedirect: '/login',
        failureRedirect: '/signup'
    }));

    app.all('/logout', (req, res) => {
        req.session.destroy(function(err) {
            res.redirect('/login');
        });
    })
}