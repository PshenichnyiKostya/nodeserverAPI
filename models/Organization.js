const mongoose = require('mongoose');
const organizationSchema = mongoose.Schema({
    name: {type: String},
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: "order", default: null}],
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
    contacts: [{type: String, default: null}],
    drivers: [{type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null}],
});

module.exports = mongoose.model('organization', organizationSchema);
