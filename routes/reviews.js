import express from 'express';
import reviews from "../controllers/reviews";
import passport from "passport";

let router = express.Router();
router.post('/:orderId/new', passport.authenticate('jwt'), reviews.add);
module.exports = router;