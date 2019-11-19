const mongoose = require('mongoose');
const crypto = require('crypto');
const userSchema = mongoose.Schema({
    name: {type: String, require: true},
    login: {type: String, require: true, unique: true},
    type: {type: String}, //User driver
    passwordHash: {type: String},
    salt: {type: String},
    resetPasswordToken: {type: String},
    resetPasswordExpires: {type: Date},
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: "order", default: null}],
    organizations: [{type: mongoose.Schema.Types.ObjectId, ref: 'organization', default: null}],
});

userSchema.virtual("password")
    .set(function (password) {
        this._plainPassword = password;
        if (password) {
            this.salt = crypto.randomBytes(128).toString("base64");
            this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, "sha1");
        } else {
            this.salt = undefined;
            this.passwordHash = undefined;
        }
    })

    .get(function () {
        return this._plainPassword;
    });

userSchema.statics.getAll = function () {
    return this.find({});
};
userSchema.methods.checkPassword = function (password) {
    if (!password) return false;
    if (!this.passwordHash) return false;
    return crypto.pbkdf2Sync(password, this.salt, 1, 128, "sha1").toString() === this.passwordHash;
};
userSchema.methods.checkResetToken = function (token) {
    if (!token) return false;
    if (!this.passwordHash) return false;
    return crypto.pbkdf2Sync(this.passwordHash, this.salt, 1, 128, "sha1") === this.resetPasswordToken;
};

module.exports = mongoose.model('user', userSchema);