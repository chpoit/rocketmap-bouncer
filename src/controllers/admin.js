//I gave up on getting webpack to load the files properly so i'm doing it the lazy way
const signup = require('../../views/signup.html');
const login = require('../../views/login.html');
const ignore = !!eval(process.env.ignore || false);
const randomStr = require('../utils').randomString;
const models = require('../db').models;
const Promise = require('bluebird');

function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

function isAdmin(req, res, next) {
    req.user
}

module.exports = (passport, app, config) => {

    //app.get('/login', (req, res) => res.render('../views/login.html'));    
    app.get('/admin', isLoggedIn, (req, res) => res.send(login));
    app.post('/codes/:amount', isLoggedIn, (req, res, next) => {
        if (!req.user.isAdmin) {
            res.session.destroy();
            return res.redirect('/login');
        }
        const amount = req.params.amount;
        console.log(amount);
        if (amount < 1) {
            return res.redirect('/admin');
        }
        const codeList = [];
        for (let i = 0; i < amount; i++) {
            codeList.push(randomStr(10));
        }
        console.log(models);
        Promise.map(codeList,
                (code) => {
                    return models.code
                        .create({ code: code })
                        .then((codeVal, __) => {
                            return code;
                        });
                })
            .then(v => {
                res.send(v);
            })
            .catch((err) => {
                res.send('something broke');
            });
        //return res.send('a')
        //next()

    });

}