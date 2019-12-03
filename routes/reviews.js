let express = require('express');
const reviews = require('../controllers/reviews');
const passport = require('passport');
let router = express.Router();
router.post('/:orderId/new', passport.authenticate('jwt'), reviews.add);
module.exports = router;