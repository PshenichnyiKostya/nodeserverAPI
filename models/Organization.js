const mongoose = require('mongoose');
const organizationSchema = mongoose.Schema({
    name: {type: String},
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: "order"}],
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "user", default: null},
    contacts: [{type: String}],
    drivers: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
});

module.exports = mongoose.model('organization', organizationSchema);
