import * as Sentry from "@sentry/node";

import express from 'express';
import logger from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import authenticationRouter from "./routes/authentication";
import ordersRouter from "./routes/orders";
import reviewsRouter from "./routes/reviews";
import organizationsRouter from "./routes/organizations";
import passport from "passport";
import linkDB from "./config/dev/mongoDB";

import linkSentry from "./config/dev/sentry";
import configurePassport from "./config/dev/passport";

import bodyParser from 'body-parser';

Sentry.init({dsn: linkSentry.link});

configurePassport(passport);
mongoose
    .connect(linkDB.link, {useNewUrlParser: true})
    .then(() => {
        console.log("MongoDB connected");
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
app.use('/', authenticationRouter);
app.use('/orders', ordersRouter);
app.use('/reviews', reviewsRouter);
app.use('/organizations', organizationsRouter);


app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on", process.env.PORT || 3000);
});
module.exports = app;
