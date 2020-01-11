import Order from '../models/Order';
import User from '../models/User';
import socket from 'socket.io';
import server from '../app';

let io = socket(server);
module.exports = {
    book: async (req, res) => {
        if (req.user && req.user.type === "User") {
            const {curLocation, neededLocations, typePay} = req.body;
            if (!curLocation || !neededLocations) {
                return res.json({success: false, message: "Locations does not exist"});
            }
            const order = new Order({
                curLocation,
                neededLocations,
                typePay,
                status: "awaiting",
                price: 123,
                customer: req.user,
            });
            await order.save();
            return res.json({success: true});
        } else {
            return res.json({success: false});
        }
    },
    getOrders: async (req, res) => {
        if (!req.user) return res.json({success: false});
        if (req.user.type === "Driver") {
            const orders = Order.find({status: "awaiting"});
            return res.json({success: true, orders: orders});
        } else if (req.user.type === "User") {
            const orders = Order.find({customer: req.user});
            return res.json({success: true, orders: orders});
        } else {
            return res.json({success: false});
        }
    },
    acceptOrder: async (req, res) => {
        if (!req.user || req.user.type !== "Driver") return res.json({success: false});
        const driver = await User.findById(req.user);
        const order = await Order.findByIdAndUpdate(req.params.orderId, {
            driver: driver,
            status: "confirmed",
        });
        await driver.update({$push: {orders: order._id},});
        if (!order) {
            return res.json({success: false});
        } else {
            // io.on('connection', function (socket) {
            //     console.log("Driver connected");
            // });
            return res.json({success: true, order: order});
        }
    },
    setOrderInProgressOrDone: async (req, res) => {
        if (!req.user || req.user.type !== "Driver") return res.json({success: false});
        const status = req.body.status;
        if (!status || (status !== "in progress" && status !== "done")) {
            return res.json({success: false});
        }
        await Order.findById(req.params.orderId).then(async order => {
                if (order.status === "done") {
                    return res.json({success: false});
                }
                if (!order.driver.equals(req.user._id)) {
                    return res.json({success: false})
                }
                await order.update({
                    status: status,
                });
                if (!order) {
                    return res.json({success: false});
                } else {
                    return res.json({success: true});
                }
            }
        );
    },

    //проверенно
    cancelOrder: async (req, res) => {
        if (!req.user || req.user.type !== "Driver") return res.json({success: false});
        await Order.findById(req.params.orderId).then(async order => {
                if (!order.driver.equals(req.user._id)) {
                    return res.json({success: false});
                }
                if (order.status === "done") {
                    return res.json({success: false});
                }
                await order.update({
                    status: "cancel",
                });
                if (!order) {
                    return res.json({success: false});
                } else {
                    return res.json({success: true});
                }
            }
        );
    },
    // chat: async (req, res) => {
    //     // if (!req.user || (req.user.type !== "Driver" && req.user.type !== "User")) return res.json({success: false});
    //     await Order.findById(req.params.orderId).then(order => {
    //         // if (!order.driver.equals(req.user._id) && !order.customer.equals(req.user._id)) {
    //         //     return res.json({success: false});
    //         // }
    //         // let userName = req.user.name;
    //         io.on('connection', function (socket) {
    //             console.log('user connected');
    //             socket.on('join', function () {
    //                 console.log(undefined + " : has joined the chat ");
    //                 socket.broadcast.emit('userjoinedthechat', undefined + " : has joined the chat ");
    //             });
    //
    //             socket.on('messagedetection', (messageContent) => {
    //                 console.log(undefined + " : " + messageContent);
    //                 let message = {"message": messageContent, "senderNickname": undefined}
    //                 io.emit('message', message)
    //             });
    //
    //             socket.on('disconnect', function () {
    //                 console.log(undefined + ' has left ');
    //                 socket.broadcast.emit("userdisconnect", ' user has left')
    //             })
    //         });
    //         if (order.status === "confirmed") {
    //             res.sendFile('/Users/kostya/WebstormProjects/nodeserver/index.html');
    //         } else {
    //             return res.json({success: false});
    //         }
    //     });
    // }


};