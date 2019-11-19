const mongoose = require('mongoose');
const reviewSchema = mongoose.Schema({
    rating: {type: Number},
    body: {type: String},
    timestamp: {type: Date, default: new Date()},
    order: {type: mongoose.Schema.Types.ObjectId, ref: "order", default: null},
});

module.exports = mongoose.model('review', reviewSchema);