const express = require('express');
// import cookieParser from "cookie-parser";
// import logger from "morgan";
// import mongoose from "mongoose";
// import cors from "cors";
// import indexRouter from "./routes/index";
// import usersRouter from "./routes/users";
// import passport from "passport";
const linkDB = require("./config/mongoDB");
const linkSentry = require("./config/sentry");
const configurePassport = require('./config/passport');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const usersRouter = require('./routes/users');
const authenticationRouter = require('./routes/authentication');
const ordersRouter = require('./routes/orders');
const reviewsRouter = require('./routes/reviews');
const organizationsRouter = require('./routes/organizations');
const Sentry = require('@sentry/node');
const passport = require('passport');
const bodyParser = require('body-parser');

Sentry.init({dsn: linkSentry.link});

configurePassport(passport);
mongoose
    .connect(linkDB.link, {useNewUrlParser: true})
    .then(() => {
        console.log("MongoDB connected")
    })
    .catch(err => {
        console.log("MongoDB error: " + err.message);
    });
const app = express();


app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));
// app.use(cookieParser());
app.use('/users', usersRouter);
app.use('/', authenticationRouter);
app.use('/orders', ordersRouter);
app.use('/reviews', reviewsRouter);
app.use('/organizations', organizationsRouter);


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on", process.env.PORT || 3000);
});
module.exports = app;
