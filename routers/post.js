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
        let newPost = await post.save()
        // adding info of the post owner before sending it for the new version of the API
        User.findById(newPost.posted_by).select('name blood_type')
                    .then( (poster) => {
                        newPost = JSON.stringify(newPost)
                        newPost = JSON.parse(newPost)

                        poster = JSON.stringify(poster)
                        poster = JSON.parse(poster)
                        console.log(poster)
                        newPost.posted_by = {_id: poster._id , name: poster.name ,blood_type: poster.blood_type }
                        res.status(201).send(newPost)
                    }  ).catch(err => console.log(err))
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
        let post = await Post.findById(req.params.id)
        if(!post){
            return res.status(400).send('post doesnt exist')
        }
        let newPost = udHandler(req.query.vote , post , req.user)
        //reports
        if(req.query.report == 1){
            post.isReported = true
            let newPost = await post.save()
            return res.status(201).send(newPost)
        }
        if(newPost === null) {
            //sending the post
            post = JSON.stringify(post)
            post = JSON.parse(post)
            return User.findById(post.posted_by).select('name blood_type').then( (data) => {
                data = JSON.stringify(data)
                data = JSON.parse(data)
                post.posted_by = data
                res.send(post)
            } ).catch( err => console.log(err) )
            
        } else {
            //saving changes
            newPost.ud_rate = newPost.handleUdRate()
            newPost = await newPost.save();
            return res.status(201).send(newPost)
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
            let allPosts = await Post.find(obj).sort({
                ud_rate: -1
            })
            let newPosts = []
            allPosts.forEach( (post) => {

                post = JSON.stringify(post)
                post = JSON.parse(post)
                let newPost = post
                User.findById(post.posted_by).select('name blood_type')
                    .then( (poster) => {
                        poster = JSON.stringify(poster)
                        poster = JSON.parse(poster)
                        newPost.posted_by = {_id: poster._id , name: poster.name ,blood_type: poster.blood_type }
                        newPosts.push(newPost)
                        if(newPosts.length === allPosts.length ){
                            res.status(200).send(newPosts)
                        }
                    }  ).catch(err => console.log(err))
                //return post
            } )
        }
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//---------------delete a post-------------
router.delete('/:id', [auth , isPostOwner] , async(req , res) => {
    try{
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
        let newComment = await Post.findByIdAndUpdate(req.params.id , {$push: {comments:req.body}} , {returnOriginal: false} )
        newComment = newComment.comments
        //console.log(newComment)
        let temp = []
        newComment.forEach(comment => {
            //console.log(comment)
            User.findById(comment.postedBy).select('name blood_type').then( data => {
                                // from BSON (nosql form when sending data) to string to object
                                data = JSON.stringify(data)
                                data = JSON.parse(data)
                                comment = JSON.stringify(comment)
                                comment = JSON.parse(comment)
                                comment.postedBy =  data
                                temp.push(comment)
                                if(temp.length === newComment.length){
                                    res.send(temp)
                                }  
                                //newComments.push(newComments)
                            } ).catch(err => console.log(err) )
                    
                        
                        })
                        
                        console.log(newComment.length)
                              
        
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
//---------------get comments--------------
router.get('/:id/comment', [auth ] , async(req , res) => {
    try {
        Post.findById(req.params.id)
            .then((post) => {

                newComment = post.comments
                //console.log(newComment)
                let temp = []
                newComment.forEach(comment => {
                    //console.log(comment)
                    User.findById(comment.postedBy).select('name blood_type').then( data => {
                                        // from BSON (nosql form when sending data) to string to object
                                        data = JSON.stringify(data)
                                        data = JSON.parse(data)
                                        comment = JSON.stringify(comment)
                                        comment = JSON.parse(comment)
                                        comment.postedBy =  data
                                        temp.push(comment)
                                        if(temp.length === newComment.length){
                                            res.send(temp)
                                        }  
                                        //newComments.push(newComments)
                                    } ).catch(err => console.log(err) )
                                })
            }).catch(err => res.status(500).json({message: err}) )
    } catch (err) {
        res.status(500).json({message: err.message})
    }
} )
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



/* 
allPosts.forEach( (post) => {
                // post.comments = post.comments.map( (comment) => {
                //     const user = await User.findById(comment._id).select('name blood_type')
                //     comment.postedBy = user
                //     return user
                // } )
                let newComments = []
                if(post.comments.length > 0 ) {
                    post.comments.forEach(comment => {
                        User.findById(comment._id).select('name blood_type')
                            .then( res => {
                                comment.postedBy = res.data
                                newComments.push(newComments)
                            } ).catch(err => console.log(err) )
                    })
                }
                if(newComments.length === post.comments.length ){
                    post.comments = newComments
                }
                
                //return post
            } )

*/