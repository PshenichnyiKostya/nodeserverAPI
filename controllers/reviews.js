let Review = require('../models/Review');
let Order = require('../models/Order');

module.exports = {
    add: async (req, res) => {
        const {rating, body} = req.body;
        const order = req.params.orderId;
        const errors = [];
        if (!body) {
            errors.push("Body can't be empty")
        }
        if (!rating) {
            errors.push("Rating can't be empty")
        } else if (rating > 5 || rating < 0) {
            errors.push("Rating starts from 0 to 5 stars");
        }
        if (errors.length > 0) {
            return res.json({success: false, errors});
        }
        await Order.findById(order).then(async ord => {
            if (!ord.customer.equals(req.user._id)) {
                return res.json({success: false});
            }
            if (!ord || ord.status !== "done") {
                return res.status(500).json({success: false});
            }
            try {
                const reviewModel = new Review({
                    body,
                    rating,
                    order,
                    user: req.user._id,
                });

                const review = await reviewModel.save();
                await ord.update({review: review._id});
                return await res.json({success: true});
            } catch (e) {
                res.status(500).json({success: false});
            }
        });
    },

};