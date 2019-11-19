const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
    customer: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    price: {type: Number},
    date: {type: Date, default: new Date()},
    curLocation: {type: String},
    neededLocations: [
        {type: String, default: null}
    ],
    review: {type: mongoose.Schema.Types.ObjectId, ref: 'review'},
    typePay: {type: String}, // cash or numcard
    status: {type: String}, // confirmed, canceled, in progress
    tip: {type: Number},
    driver: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    organization: {type: mongoose.Schema.Types.ObjectId, ref: "organization"},
});

orderSchema.statics.getAllForUser = function (_id) {
    return this.find({_id});
};
module.exports = mongoose.model('order', orderSchema);