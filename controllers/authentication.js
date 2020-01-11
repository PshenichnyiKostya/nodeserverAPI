import passport from 'passport'

const jwtConfig = require('../config/dev/jwt');
const waterfall = require('async-waterfall');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const myMail = require('../config/dev/mymail');
const crypto = require('crypto');
import socket from 'socket.io';
import server from '../app';

let io = socket(server);
import User from '../models/User';

module.exports = {
    register: (req, res) => {
        const {name, login, type = "User", password, password2} = req.body;
        let errors = [];
        if (!name || !login || !password || !password2) {
            errors.push("All params must be written");
        } else if (password !== password2) {
            errors.push("Passwords must be equals");
        }
        if (errors.length > 0) {
            return res.json({success: false, errors})
        } else {
            User.findOne({login}).then(async user => {
                if (user) {
                    errors.push("This login is exist");
                    await res.json({success: false, errors});
                } else {
                    const newUser = new User({
                        name,
                        login,
                        type,
                        password,
                    });
                    const savedUser = await newUser.save();
                    const payload = {
                        id: savedUser._id,
                        name: savedUser.name,
                        type: savedUser.type,
                        login: savedUser.login,
                    };
                    const token = jwt.sign(payload, jwtConfig.secret, {
                        expiresIn: "7d"
                    });
                    return res.json({success: true, user: payload, token});
                }
            });
        }
    },
    login: async (req, res, next) => {
        // io.on('connection', function () {
        //     console.log("Driver connected");
        // });
        // io.connect('http://localhost3000');
        await passport.authenticate("local", function (err, user, message) {
            if (user === false) {
                return res.json({success: false, errors: ["User does not exist"]});
            } else {
                const payload = {
                    id: user._id,
                    name: user.name,
                    type: user.type,
                    login: user.login
                };
                const token = jwt.sign(payload, jwtConfig.secret, {
                    expiresIn: "7d"
                });
                return res.json({success: true, user: payload, token, message});
            }
        })(req);
    },
    forgot: (req, res, next) => {
        waterfall([
                function (done) {
                    crypto.randomBytes(20, function (err, buf) {
                        let token = buf.toString('hex');
                        done(err, token);
                    });
                },
                async function (token, done) {
                    if (!req.body.login) return res.json({success: false, message: "Enter e-mail!"});
                    await User.findOne({login: req.body.login}, function (err, user) {
                        if (!user) {
                            return res.json({success: false, message: "E-mail does not exist"});
                        }
                        user.resetPasswordToken = token;
                        user.resetPasswordExpires = Date.now() + 3600000 / 2;
                        user.save(function (err) {
                            done(err, token, user);
                        })
                    });
                },
                async function (token, user, done) {
                    let smtpTransport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: myMail.name,
                            pass: myMail.pass,
                        },
                    });
                    let mailOptions = {
                        to: user.login,
                        from: "NodeJsServer ",
                        subject: 'Node.js Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    await smtpTransport.sendMail(mailOptions, function (err) {
                        done(err, 'done');
                        if (!err) {
                            res.json({success: true, message: "E-mail has been sent to " + user.login});
                        }
                    });
                },
            ],
            function (err) {
                if (err) {
                    return res.json({success: false});
                }
            });
    },
    reset: (req, res, next) => {
        waterfall([
                async function (done) {
                    await User.findOne({
                        resetPasswordToken: req.params.token,
                        resetPasswordExpires: {$gt: Date.now()}
                    }, function (err, user) {
                        let errors = [];
                        const {password, password2} = req.body;
                        if (!user) {
                            errors.push("Password reset token is invalid or has expired")
                        }
                        if (!password || !password2) {
                            errors.push("All params must be written ");
                        }
                        if (password !== password2) {
                            errors.push("Passwords must be equals");
                        }
                        if (errors.length > 0) {
                            return res.json({success: false, errors});
                        } else {
                            user.password = password;
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;

                            user.save(function (err) {
                                done(err, user);
                            });
                        }
                    });
                },
                async function (user, done) {
                    let smtpTransport = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: myMail.name,
                            pass: myMail.pass,
                        },
                    });
                    let mailOptions = {
                        to: user.login,
                        from: "NodeJsServerSite ",
                        subject: 'Your password has been changed',
                        text: 'Hello,\n\n' +
                            'This is a confirmation that the password for your account ' + user.login + ' has just been changed.\n'
                    };
                    await smtpTransport.sendMail(mailOptions, function (err) {
                        done(err, 'done');
                        if (!err) {
                            return res.json({success: true, message: "Your password has been changed"});
                        }

                    });
                },
            ],
            function (err) {
                if (err) {
                    console.log(err);
                    return res.json({success: false});
                }
            });
    },
};