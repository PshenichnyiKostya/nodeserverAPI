import * as Sentry from "@sentry/node";

import express from 'express';
import logger from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import authenticationRouter from "./routes/authentication";
import ordersRouter from "./routes/orders";
import reviewsRouter from "./routes/reviews";
import organizationsRouter from "./routes/organizations";
import usersRouter from './routes/users';
import passport from "passport";
import linkDB from "./config/dev/mongoDB";

import linkSentry from "./config/dev/sentry";
import configurePassport from "./config/dev/passport";

import bodyParser from 'body-parser';
import socket from 'socket.io';
import Order from "./models/Order";

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
let server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on", process.env.PORT || 3000);
});
let io = socket(server);
app.use(cors());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
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
app.use('/users', usersRouter);
// app.get('/qwerty', function (req, res) {
//     io.on('connection', function (socket) {
//         console.log("Connected");
//         socket.emit('news', {hello: 'world'});
//         socket.on('my other event', function (data) {
//             console.log(data);
//             console.log("my data");
//         });
//     });
//     res.sendFile(__dirname + '/index.html');
// });
app.get('/orders/chat/:orderId', async function (req, res) {
    if (!req.user || (req.user.type !== "Driver" && req.user.type !== "User")) return res.json({success: false});
    await Order.findById(req.params.orderId).then(order => {
        if (!order.driver.equals(req.user._id) && !order.customer.equals(req.user._id)) {
            return res.json({success: false});
        }
        let userName = req.user.name;
        io.on('connection', function (socket) {
            console.log('user connected');
            socket.on('messagedetection', (messageContent) => {
                console.log(userName + " : " + messageContent);
                let message = {"message": messageContent, "senderNickname": userName}
                io.emit('message', message)
            });
        });
        if (order.status === "confirmed") {
            res.sendFile('/Users/kostya/WebstormProjects/nodeserver/index.html');
        } else {
            return res.json({success: false});
        }
    });
});
module.exports = server;
