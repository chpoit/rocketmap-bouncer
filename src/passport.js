////////////////////////////////////////////////////////////
/// Based on https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84, but with sequelize
////////////////////////////////////////////////////////////

const LocalStrategy = require('passport-local').Strategy;
const Sequelize = require('sequelize');
const bCrypt = require('bcrypt-nodejs');

const generateHash = require("./utils").generateHash;
const models = require("./db").models;

const isValidPassword = function(userpass, password) {
    return bCrypt.compareSync(password, userpass);
};
module.exports.initPassport = (passport, sequelize, config) => {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        models.user.findOne({
            where: { id }
        }).then(user => {
            if (user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }

        }).catch(err => {
            done(err, null);
        })

    });


    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, email, password, done) => {
            var hash = generateHash(password);
            models.user.findOne({
                where: { email: email }
            }).then(user => {
                if (user) {
                    return done("Courriel déjà utilisé", false);
                }

                const data = req.body;
                if (data.password !== data.passwordConfirm) {
                    return done("Mot de passe ne corresponds pas.", false);
                }
                if (config["no-special-code"]) {
                    models.user.create({
                            email,
                            password: hash,
                        })
                        .then((newUser, created) => {
                            return done(null, newUser);
                        });
                } else {
                    //Yo dawg, I heard you liked callbacks
                    models.code.findOne({
                            where: { code: data.code }
                        })
                        .then((code) => {
                            if (!code || !code.get() || code.get().userId) {
                                return done("Code invalide", false);
                            }
                            const codeValue = code.get();
                            models.user.create({
                                    email,
                                    password: hash,
                                })
                                .then((newUser, created) => {
                                    codeValue.userId = newUser.id;
                                    models.code.update(codeValue, {
                                            where: { code: codeValue.code }
                                        })
                                        .then((_, __) => {
                                            return done(null, newUser);
                                        });
                                });

                        });
                }
            }).catch(err => {
                done(err, null);
            })
        }
    ));


    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback

        },
        function(req, email, password, done) { // callback with email and password from our form
            const isValidPassword = function(userpass, password) {
                return bCrypt.compareSync(password, userpass);
            };
            models.user.findOne({
                    where: { email: email }
                }).then(user => {
                    if (!user) {
                        return done("Utilisateur invalide", false);
                    }
                    const userVal = user.get();
                    // const ip = req.prox
                    models.loginPlace.upsert({
                            userId: userVal.id,
                            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                        })
                        .then(() => {
                            if (!isValidPassword(user.password, password)) {
                                return done("Mot de passe invalide", false);
                            }
                            return done(null, userVal);
                        });
                })
                .catch(err => console.error(err));
        }));

};