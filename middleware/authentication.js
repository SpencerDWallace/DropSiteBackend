const User = require('../models/User')
const jwt = require('jsonwebtoken')
const {UnauthenticatedError} = require('../errors')

const whiteListEndpoints = ["/api/v1/validate/employee/"]

const auth = (req, res, next) => {
    if(whiteListEndpoints.includes(req.originalUrl)) return next()
    let authHeader = req.headers.authorization
    //console.log(req)
    if(!authHeader || !authHeader.startsWith('Bearer ') )
    {
        //console.log(req)
        res.json({msg:'Invalid Credentials.', success:false})
    }
    else{
        const token = authHeader.split(' ')[1]
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET)
            // console.log(payload);
            req.user = {userID:payload.userID}
            next()
        } catch (error) {
            res.json({msg:'Invalid Credentials.', success:false})
        }
    }
}

module.exports = auth