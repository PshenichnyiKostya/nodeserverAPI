let express = require('express');
let router = express.Router();
const organizations = require('../controllers/organizations');
const passport = require('passport');
router.post('/add', passport.authenticate("jwt"), organizations.add);
router.post('/adddriver/:id', passport.authenticate("jwt"), organizations.addDriver);
router.post('/deletedriver/:id', passport.authenticate("jwt"), organizations.deleteDriver);
router.post('/update/:id', passport.authenticate("jwt"), organizations.updateOrganization);
router.get('/drivers/:id',passport.authenticate("jwt"),organizations.getDrivers);

module.exports = router;