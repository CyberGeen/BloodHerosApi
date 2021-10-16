//requirement
const express = require('express')
const router = express.Router()
const Post = require('../schema/mongooseSchemas/postSchema')
const postJoiSchema = require('../schema/joiSchemas/postJoiSchema')
const commentSchema = require('../schema/joiSchemas/commentJoiSchema')
const auth = require('../middleware/auth')
const isPostOwner = require('../middleware/isPostOwner')
const isCommentOwner = require('../middleware/isCommentOwner')
const udHandler = require('../functions/udHandler')
const User = require('../schema/mongooseSchemas/userSchema')
const docAuth = require('../middleware/docAuth')
const querryHandler = require('../functions/querryHandler')
const isAdmin = require('../middleware/isAdmin')

//routes
//------------post related section----- ->create->update->delete->getOne->getAll
//-----------create a post-------------
router.post('/create', auth , async(req , res) => {
    try{
        let validate = postJoiSchema.validate(req.body)
        if(validate.error){
            return res.status(400).send(validate.error.details)
        }
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
        //reports
        if(req.query.report == 1){
            post.isReported = true
        }
        let newPost = udHandler(req.query.vote , post , req.user)
        if(newPost === null) {
            //sending the post
            res.send(post)
        } else {
            //saving changes
            newPost.ud_rate = newPost.handleUdRate()
            newPost = await newPost.save();
            res.send(newPost)
        }
        
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//---------------get all posts------------- (hold/advanced searching)
router.get('/', auth , async(req , res) => {
    try{
        //handling querries
        const obj = querryHandler(req.query)
        //sorting
        //sort by newest
        if(req.query.new==1){
            const allPosts = await Post.find(obj).sort({
                date: -1
            })
            res.status(200).send(allPosts)
        }
        //default sort , by udRatio
        else {
            const allPosts = await Post.find(obj).sort({
                ud_rate: -1
            })
            res.status(200).send(allPosts)
        }
        
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
//----------------------set a donator--------------------- ///change this to docs 
router.put('/:id/donator/:dId', [auth , docAuth] ,  async(req , res) => {
    try{
        let donator = await User.findById(req.params.dId)
        if(!donator) return res.status(400).json({"error":"user doesnt excist"})
        let post = await Post.findById(req.params.id)
        if(!post) return res.send(400).json({"error":"post doenst excist"})
        if(post.donator) return res.status(400).json({"error":"donator already set"})
        donator.last_donation= Date.now()
        donator.score += 100 ;
        donator = await donator.save() ;
        console.log(typeof(req.params.dId))
        post =await Post.findByIdAndUpdate(req.params.id , {donator:req.params.dId , state:true} , {returnOriginal: false})
        res.status(201).send(post)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//----------------------delete the donateur---------------
router.delete('/:id/donator/:dId', [auth , docAuth] ,  async(req , res) => {
    try{
        let donator = await User.findById(req.params.dId)
        if(!donator) return res.status(400).json({"error":"user doesnt excist"})
        let post = await Post.findById(req.params.id)
        if(!post) return res.send(400).json({"error":"post doenst excist"})
        if(!post.donator) return res.status(400).json({"error":"there is no donator"})
        donator.last_donation= null
        donator.score -= 100 ;
        donator = await donator.save() ;
        console.log(typeof(req.params.dId))
        post =await Post.findByIdAndUpdate(req.params.id , {donator:null} , {returnOriginal: false})
        res.status(201).send(post)
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
        res.send(newComment.comments)
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
        res.send({"deleted":true})
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//---------------post module---------------
router.put('/', [auth] , async(req , res) => {
    try{
        res.send('no :)')
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//exports 
module.exports = router ;