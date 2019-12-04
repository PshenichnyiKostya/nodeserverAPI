let Organization = require('../models/Organization');
let User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/dev/jwt');
module.exports = {
    add: async (req, res) => {
        if (req.user && req.user.type === 'Admin') {
            const {name, owner, contacts, drivers} = req.body;
            const errors = [];
            if (!name) {
                errors.push("Name cant't be empty");
            }
            if (!owner) {
                errors.push("Owner cant't be empty");
            }
            if (errors.length > 0) {
                return res.json({success: false, errors});
            }
            try {
                await Organization.findOne({name}).then(async organizationCheck => {
                    if (organizationCheck) {
                        return res.json({success: false, message: "Name of organization is exist"});
                    }
                });
                const newOwner = await User.findOneAndUpdate({login: owner}, {
                    type: "Owner"
                });
                if (!newOwner) {
                    return await res.json({success: false, message: "This user does not exist "});
                }
                const organizationModel = new Organization({
                    name,
                    owner: newOwner,
                    contacts,
                    drivers
                });
                const organization = await organizationModel.save();
                await newOwner.update({
                    $push: {organizations: organization._id},
                });
                res.send({success: true});
            } catch (e) {
                return res.status(500).json({success: false});
            }
        } else {
            return res.json({success: false, message: "You are not an admin"});
        }
    },
    addDriver: async (req, res) => {
        const organization = await Organization.findById(req.params.id);
        if (req.user && req.user.type === 'Owner' && organization.owner.equals(req.user._id)) {
            const {name, login, type = "Driver", password, password2} = req.body;
            let errors = [];
            if (!name || !login || !password || !password2) {
                errors.push("All params must be written");
            } else if (password !== password2) {
                errors.push("Passwords must be equals");
            }
            if (errors.length > 0) {
                return res.json({success: false, errors})
            } else {
                User.findOne({login}).then(async user => {
                    if (user) {
                        errors.push("This login is exist");
                        await res.json({success: false, errors});
                    } else {
                        try {
                            const newUser = new User({
                                name,
                                login,
                                type,
                                password,
                            });
                            const savedUser = await newUser.save();
                            try {
                                const payload = {
                                    id: savedUser._id,
                                    name: savedUser.name,
                                    type: savedUser.type,
                                    login: savedUser.login,
                                };
                                const token = jwt.sign(payload, jwtConfig.secret, {
                                    expiresIn: "7d"
                                });
                                await Organization.findByIdAndUpdate(req.params.id, {
                                    $push: {drivers: savedUser._id},
                                });
                                await User.findByIdAndUpdate(savedUser._id, {
                                    $push: {organizations: req.params.id},
                                });
                                return await res.json({success: true, token: token});
                            } catch (e) {
                                await savedUser.remove();
                                return res.status(500).json({success: false});
                            }
                        } catch (e) {
                            return res.status(500).json({success: false});
                        }
                    }
                });
            }
        } else {
            return res.json({success: false, message: "U r not a owner or it's not your organization"});
        }
    },
    deleteDriver: async (req, res) => {
        if (!req.user || !req.params.id) return res.json({success: false});
        try {
            const driver = await User.findById(req.params.id);
            if (!driver || driver.type !== "Driver") return await res.json({success: false});
            const organization = await Organization.findById(driver.organizations[0]);
            if (!organization || !organization.owner || !organization.owner.equals(req.user._id)) return await res.json({success: false});
            await organization.update({$pull: {drivers: driver._id},});
            await driver.remove();
            if (driver) {
                await res.json({success: true});
            } else {
                await res.json({success: false})
            }
        } catch (e) {
            res.status(500).json({success: false});
        }
    },
    updateOrganization: async (req, res) => {
        if (!req.user || !req.params.id) return res.json({success: false});
        const {name, contacts} = req.body;
        const organizationCheck = await Organization.findOne({name: name});
        if (organizationCheck) {
            return await res.json({success: false, message: "This name exists"});
        }
        await Organization.findById(req.params.id).then(async org => {
            if (!org || !org.owner.equals(req.user._id)) {
                return res.json({success: false});
            } else {
                await org.update({name: name, contacts});
                return res.json({success: true});
            }
        });

    },
    //доделать
    getDrivers: async (req, res) => {
        if (!req.user || !req.params.id) return res.json({success: false});
        await Organization.findById(req.params.id).populate({
            path: "drivers",
            select: "name login orders",
            populate: {
                path: "orders",
                select: "price date status tip review",
                populate: {
                    path: "review",
                    select: "rating body"
                }
            }
        }).then(org => {
            // console.log(org.owner);
            // console.log(req.user._id);
            if (!org || !org.owner.equals(req.user._id)) {
                return res.json({success: false});
            }
            console.log(org.drivers.orders);
        });
    },
};
