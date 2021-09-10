//requirement
const express = require('express')
const router = express.Router()
const isAdmin = require('../middleware/isAdmin')
const auth = require('../middleware/auth')
const Post = require('../schema/mongooseSchemas/postSchema')

//--------------------report handeling-------------------
//-----------get reported posts----------------
router.get('/', [auth , isAdmin] , async(req , res) => {
    try{
        const allPosts = await Post.find({isReported:true})
        res.send(allPosts)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})
//-----------decline a reported post ----------------
router.put('/:id', [auth , isAdmin] , async(req , res) => {
    try{
        const allPosts = await Post.findByIdAndUpdate(req.params.id , {isReported:false} , {returnOriginal:false})
        res.send(allPosts)
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})



//exporting
module.exports = router