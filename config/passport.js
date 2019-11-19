// import LocalStrategy from "passport-local";
// import passportJwt from "passport-jwt";
// import jwtConfig from "./jwt";
// import jwt from "jsonwebtoken";
const LocalStrategy = require('passport-local').Strategy;
const passportJwt = require('passport-jwt');
const jwt = require('jsonwebtoken');
let User = require('../models/User');


const jwtConfig = require('./jwt');

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
module.exports = passport => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: "login",
                passwordField: "password",
                session: false
            },
            function (login, password, done) {
                User.findOne({login}, (err, user) => {
                    if (err) {
                        return done(err);
                    }
                    if (!user.checkPassword(password) || !user) {
                        return done(null, false, {
                            message: "Such user does not exist"
                        });
                    }
                    return done(null, user);
                });
            }
        )
    );
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
        secretOrKey: jwtConfig.secret
    };

    passport.use(
        new JwtStrategy(jwtOptions, function (payload, done) {
            User.findById(payload.id, (err, user) => {
                if (err) {
                    return done(err);
                }
                if (user) {
                    done(null, {
                        _id: user._id,
                        name: user.name,
                        login: user.login,
                        type: user.type,
                    });
                } else {
                    done(null, false);
                }
            });
        })
    );
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
};