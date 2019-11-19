let express = require('express');
let router = express.Router();
const passport = require('passport');
let User = require('../models/User');

//readAll
router.get('/', function (req, res, next) {
    User.find({}).select('name _id login type passwordHash salt').then(function (users) {
        res.status(200).send(users);
    }).catch(err => {
        res.status(500).json({error: err});
    });
});
//read
router.get('/:id', passport.authenticate('jwt'), function (req, res, next) {
    User.findById({_id: req.params.id}).select('name login type passwordHash salt').then(function (user) {
        res.send(user);
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

//delete
router.delete('/:id', function (req, res, next) {
    User.findByIdAndRemove({_id: req.params.id}).then(function (user) {
        if (!user) {
            return res.status(404).send({success: false});
        }
        res.status(200).send(user);
    }).catch(err => {
        res.status(500).json({error: err});
    });
});
//update
router.put('/:id', passport.authenticate('jwt'), function (req, res, next) {
    const {newPass, confPass} = req.body;
    console.log(newPass);
    console.log(confPass);
    let errors = [];
    if (!newPass || !confPass) {
        errors.push("All params must be written ");
    }
    if (errors.length > 0) {
        res.send({success: false, errors})
    } else {
        console.log("GOOD");
        res.send({success: true});
    }
});
module.exports = router;
