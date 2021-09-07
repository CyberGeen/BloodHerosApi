module.exports = function(req , res , next){
    if(req.user.role === null) {
        if(req.user._id != req.params.id) return res.status(400).json({"error":"access denied"});
        next();
    }
    //admin have the right to acess and modify something they dont own
    else {
        if(req.user.role != 'admin') return res.status(400).json({"error":"access denied"});
        next();
    }
}