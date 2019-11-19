let express = require('express');
let router = express.Router();
const authentication = require('../controllers/authentication');

router.post('/login', authentication.login);
router.post('/registration', authentication.register);
router.post('/forgot', authentication.forgot);
router.post('/reset/:token', authentication.reset);
module.exports = router;
//
// class BaseModel {
//     validate = () => {};
// }
//
// class User extends BaseModel {
//     addData = () => {};
// }
//
// const user = new User();
// user.addData();
// user.validate();
//
// function BaseModel (a) {
//     this.a = a;
// }
//
// BaseModel.prototype.validate = () => {};
//
// function User (...args) {
//     BaseModel.apply(this, args);
// }
//
// User.prototype = Object.create(BaseModel.prototype);
//
// User.prototype.addData = () => {};