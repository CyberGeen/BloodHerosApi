//requirement
const express = require('express')
const router = express.Router()
const Post = require('../schema/mongooseSchemas/postSchema')
const postJoiSchema = require('../schema/joiSchemas/postJoiSchema')
const commentSchema = require('../schema/joiSchemas/commentJoiSchema')
const auth = require('../middleware/auth')
const isPostOwner = require('../middleware/isPostOwner')
const isCommentOwner = require('../middleware/isCommentOwner')

//routes
//------------post related section----- ->create->update->delete->getOne->getAll
//-----------create a post-------------
router.post('/create', auth , async(req , res) => {
    try{
        let validate = postJoiSchema.validate(req.body)
        if(validate.error){
            return res.status(400).send(validate.error.details)
        }
        //verify stuff
        
        //creating post
        const post = new Post(validate.value)
        post.posted_by=req.user._id
        const newPost = await post.save()
        res.status(201).send(newPost)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//-----------update a post-------------
router.put('/:id', [auth , isPostOwner] , async(req , res) => {
    try{
        req.body.posted_by = req.user._id
        let validate = postJoiSchema.validate(req.body)
        if(validate.error){
            return res.status(400).send(validate.error.details)
        }
        //updating post 
        const newPost = await Post.findByIdAndUpdate(req.params.id , req.body , {returnOriginal:false})
        res.status(201).send(newPost)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//---------------get a post----------------
router.get('/:id', auth , async(req , res) => {
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(400).send('post doesnt exist')
        }
        //verification
        //sending the post
        res.send(post)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//---------------get all posts------------- (hold/advanced searching)
router.get('/', auth , async(req , res) => {
    try{
        const allPosts = Post.find()
        res.status(200).send(allPosts)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//---------------delete a post-------------
router.delete('/:id', [auth , isPostOwner] , async(req , res) => {
    try{
        //verification
        //deleting
        const checker = await Post.findByIdAndDelete(req.params.id)
        res.send(checker)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//---------------update a post-------------
router.put('/:id', [auth , isPostOwner] , async(req , res) => {
    try{
        let validate = postJoiSchema.validate(req.body)
        if(validate.error){
            return res.status(400).send(validate.error.details)
        }
        //updating post
        const post = await Post.findByIdAndUpdate(req.params.id , req.body , {returnOriginal: false})
        res.status(201).json(post)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})


//----------------comment section------------------- ->create->update->delete
//---------------add a comment-------------
router.post('/:id/comment', [auth ] , async(req , res) => {
    try{
        const validate = commentSchema.validate(req.body);
        if (validate.error) return res.status(400).send(validate.error.details)
        //add posted by section
        req.body.postedBy = req.user._id
        //pushing a comment
        const newComment = await Post.findByIdAndUpdate(req.params.id , {$push: {comments:req.body}} , {returnOriginal: false} )
        res.send(newComment)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//-----------------updating a comment------ //once ownership setteled
router.put('/:id/comment/:commentId', [auth , isCommentOwner] , async(req , res) => {
    try{
        //checking schema
        const validate = commentSchema.validate(req.body);
        if (validate.error) return res.status(400).send(validate.error.details)
        //preventing the id from changing "set is distructive"
        req.body._id = req.params.commentId
        //updating
        const newComment = await Post.findOneAndUpdate({"comments._id":req.params.commentId} , {$set: {"comments.$":req.body}} , {returnOriginal: false})
        //const updatedPost = await Post.findById(req.params.id)
        res.send(newComment)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//----------------deleting comment---------
router.delete('/:id/comment/:commentId', [auth , isCommentOwner] , async(req , res) => {
    try{
        //updating
        const newComment = await Post.findOneAndUpdate({"comments._id":req.params.commentId} , {$pull: {"comments":{_id:req.params.commentId}}} , {returnOriginal: false})
        //const updatedPost = await Post.findById(req.params.id)
        res.send(newComment)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//----------------upvote-------------------
//----------------downvote-----------------


//---------------post module---------------
router.post('/', async(req , res) => {
    try{

    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//exports 
module.exports = router ;