const express = require('express');
// import cookieParser from "cookie-parser";
// import logger from "morgan";
// import mongoose from "mongoose";
// import cors from "cors";
// import indexRouter from "./routes/index";
// import usersRouter from "./routes/users";
// import passport from "passport";
const configurePassport = require('./config/passport');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const usersRouter = require('./routes/users');
const authenticationRouter = require('./routes/authentication');
const ordersRouter = require('./routes/orders');
const Sentry = require('@sentry/node');
const passport = require('passport');
const bodyParser = require('body-parser');

Sentry.init({dsn: 'https://cff192b9792d485a98c31dcd5ea50ebf@sentry.io/1801308'});

configurePassport(passport);
mongoose
    .connect('mongodb+srv://kostya:123@mycluster-c9ywb.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true})
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


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on", process.env.PORT || 3000);
});
module.exports = app;
