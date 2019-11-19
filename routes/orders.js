let express = require('express');
let router = express.Router();
const orders = require('../controllers/orders');
router.post('/boot',orders.book);
module.exports = router;