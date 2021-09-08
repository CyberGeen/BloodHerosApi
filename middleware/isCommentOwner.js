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
        if(!post) return res.status(400).json({"error":"post doesnt excist"});
        const comments = post.comments
        //does the comment even exists
        let doesExist = false ;
        comments.forEach(e => {
            if (e._id == req.params.commentId && e.postedBy == req.user._id) {
                doesExist = true 
            }
        });
        //does the owner own the comment
        //verifying post ownership before updating
        if(!doesExist) return res.status(400).json({"error":"access denied "});
        req.body.postedBy = req.user._id
        next();
    }
}
