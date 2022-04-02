const JWT_SECRET = process.env.JWT_SECRET || 'shh';
const Users = require('../users/users-model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



const restrict = (req, res, next) => {
    const token = req.headers.authorization;

    if(!token){
        next({ status: 401, message: 'token required'})
    }else{
        jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
            if(error){
                next({ status: 401, message: 'token invalid'})
            }else{
                next();
            }
        })
    }
    next();
}

const validateUsernameExists = (req, res, next) => {
    Users.findBy({username: req.body.username})
    .then(resp => {
        if(resp[0]){
            req.user = resp[0];
            next();
        }else{
            next({ status: 404, message: 'invalid credentials'});
        }
    })
    .catch(error => {
        next(error);
    })
}

const validateReqBody = (req, res, next) => {
    if(!req.body.password || !req.body.username){
        next({status: 400, message: 'username and password required'})
    }else{
        next();
    }
}

const validatePassword = (req, res, next) => {
    if( bcrypt.compareSync(req.body.password, req.user.password)){
        next();
    }else{
        next({ status: 401, message: 'invalid credentials'})
    }
}

const checkForUsernameBeforeRegister = (req, res, next) => {
    Users.findBy({username: req.body.username})
    .then(user => {
        if(user.length){
            next({ status: 401, message: 'username already exists'});
        }else{
            next();
        }
    })
}

const createToken = (req, res, next) => {
    const token = tokenBuilder(req.user)
    req.token = token;
    next();
}

const tokenBuilder = (user) => {
    const payload = {
        subject: user.id,
        username: user.username
    }
    const options = {
        expiresIn: '1d'
    }

    return jwt.sign(payload, JWT_SECRET, options)
}

module.exports = {
    restrict,
    validateUsernameExists,
    validateReqBody,
    validatePassword,
    checkForUsernameBeforeRegister,
    createToken
}