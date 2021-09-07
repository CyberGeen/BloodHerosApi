//function
module.exports = function (req , res , next){ 
    if(req.user.role !== 'doc') return res.status(400).json({"error":"access denied"})
        next();
}