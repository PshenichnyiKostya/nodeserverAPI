import express from 'express';

let router = express.Router();
import passport from "passport";
import orders from '../controllers/orders';
router.post('/book', passport.authenticate('jwt'), orders.book);
router.post('/accept/:orderId', passport.authenticate('jwt'), orders.acceptOrder);
router.post('/update/:orderId', passport.authenticate('jwt'), orders.setOrderInProgressOrDone);
router.post('/cancel/:orderId', passport.authenticate('jwt'), orders.cancelOrder);
router.get('/', passport.authenticate('jwt'), orders.getOrders);
// router.get('/chat/:orderId', orders.chat);

module.exports = router;