const User = require('../models/user');
const jwt = require('jsonwebtoken');                                // to generate signed token
const expressJwt = require('express-jwt');                          // for authorization check
const {errorHandler} = require('../helpers/dbErrorHandler');


exports.signup = (req, res) => {
    //console.log('req.body', req.body);
    const user = new User(req.body);
    user.save((err, user) => {
        if(err) {
            return res.status(400).json({
                err: errorHandler(err)
            });
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    });
};

exports.signin = (req, res) => {
    // 1. Find user based on email
    const {email, password} = req.body;
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: 'User with this email does not exist. Please Signup'
            });
        }
        // 2. If user found then match email and password
        // i) create authenticate method in user-model
        if(!user.authenticate(password)) {
            return res,status(401).json({
                error: 'Email and password dont match'
            });
        }
        // ii) generate a signed token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        res.cookie('t', token, { expire: new Date() + 9999 }); 
        // Return response with user and token to frontend client
        const { _id, name, email, role } = user;
        return res.json({token, user: { _id, email, name, role }});

    });
};

exports.signout = (req, res) => {
    res.clearCookie('t');
    res.json({message: 'Signout success'});
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth'
});