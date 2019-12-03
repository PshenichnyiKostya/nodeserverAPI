const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
    customer: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    price: {type: Number, default: null},
    date: {type: Date, default: new Date()},
    curLocation: {type: String, default: null},
    neededLocations: [
        {type: String, default: null}
    ],
    review: {type: mongoose.Schema.Types.ObjectId, ref: 'review'},
    typePay: {type: String, default: null}, // cash or numcard
    status: {type: String, default: null}, // confirmed, canceled,in progress,awaiting
    tip: {type: Number, default: null},
    driver: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    organization: {type: mongoose.Schema.Types.ObjectId, ref: "organization"},
});

orderSchema.statics.getAllForUser = function (_id) {
    return this.find({_id});
};
module.exports = mongoose.model('order', orderSchema);