const JWT_SECRET = 'jackpot'
const Users = require('../users/users-model');
const jwt = require('jsonwebtoken');


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


module.exports = {
    restrict
}