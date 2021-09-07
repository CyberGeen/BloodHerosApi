//requirement
const Post = require('../schema/mongooseSchemas/postSchema')

//function
module.exports = async function(req , res , next){
    if(req.user.role == 'admin') {
        next();
    }
    else{
        //find post
        let post = await Post.findById(req.params.id)
        //verifying post ownership before updating
        if(req.user._id != post.posted_by) return res.status(400).json({"error":"access denied"});
        next();
    }
}

