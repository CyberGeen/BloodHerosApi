//requirement
const express = require('express')
const router = express.Router()
const Post = require('../schema/mongooseSchemas/postSchema')
const postJoiSchema = require('../schema/joiSchemas/postJoiSchema')
const commentSchema = require('../schema/joiSchemas/commentJoiSchema')

//routes
//------------post related section-----
//-----------create a post-------------
router.post('/create', async(req , res) => {
    try{
        let validate = postJoiSchema.validate(req.body)
        if(validate.error){
            return res.status(400).send(validate.error.details)
        }
        //verify stuff
        
        //creating post
        const post = new Post(validate.value)
        const newPost = await post.save()
        res.status(201).send(newPost)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//---------------get a post----------------
router.get('/:id', async(req , res) => {
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
router.get('/', async(req , res) => {
    try{
        const allPosts = Post.find()
        res.status(200).send(allPosts)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//---------------delete a post-------------
router.delete('/:id', async(req , res) => {
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
router.put('/:id/update', async(req , res) => {
    try{
        let validate = postJoiSchema.validate(req.body)
        if(validate.error){
            return res.status(400).send(validate.error.details)
        }
        //find post
        let post = await Post.findByIdAndUpdate(req.params.id , req.body)
        console.log(req.body)
        //verify stuff
        
        //updating post
        
        
        res.status(201).send(post)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//---------------add a comment-------------
router.post('/:id/comment', async(req , res) => {
    try{
        const validate = commentSchema.validate(req.body);
        if (validate.error) return res.status(400).send(validate.error.details)
        //does post exists ? 
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(400).json({error:"post doesnt excist"})
        //verification

        //pushing a comment
        const newComment = await Post.findByIdAndUpdate(req.params.id , {$push: {comments:req.body}})
        res.send(newComment)

    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//-----------------updating a comment------ //once ownership setteled
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