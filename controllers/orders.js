let Order = require('../models/Order');
let User = require('../models/User');
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
};