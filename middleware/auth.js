//requirement
const jwt = require('jsonwebtoken')
require('dotenv').config();

//function
module.exports = function (req , res , next){
    //checking if there is a token
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({"error":"access denied , no token provided"});
    //check if the JWT is valid
    try{
        const decodedJWT = jwt.verify(token , process.env.JWT_KEY);
        //send the decoded version as a param to the rest of the prog
        req.user = decodedJWT;
        next();
    }
    catch(err){
        res.status(400).json({"error":"invalid token"})
    }
}