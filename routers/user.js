//requirements
const express = require('express')
const router = express.Router()
const User = require('../schema/mongooseSchemas/userSchema')
const userJoiSchema = require('../schema/joiSchemas/userJoiSchema')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const auth = require('../middleware/auth')
const { valid } = require('joi')



//using web token console.log(process.env.JWT_KEY)
//const token = jwt.sign({what we want to be sent} , the key) then res.send(token)

//sign up 
router.post('/signup' , async(req , res) => {
    try {
        let validate = userJoiSchema.validate(req.body)
        if(validate.error) {
            return res.status(400).send(validate.error.details) }
        const isValid = await User.findOne({email:req.body.email})
        if (isValid){
            return res.status(400).json({"error":"email already used"}) 
        }
        else {
            const hashPw = await bcrypt.hash(validate.value.password , 10);
            validate.value.password = hashPw
            const user = new User(validate.value);
            const newUser = await user.save() ;
            //sending the token
            const token = user.genAuthToken();
            return res.status(201)
            .header('x-auth-token' , token)
            .header('access-control-expose-headers' , 'x-auth-token')
            .send(_.pick(newUser , ['_id']))
        } }
    catch (err) {
        res.status(500).json({message: err.message})
    }
})

//login
router.post('/login' , async(req , res) => {
    try {
        const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).send('wrong email or password')
    }
        const validPw = await bcrypt.compare(req.body.password , user.password );
        if(!validPw) return res.status(400).send('wrong email or password')
        //sending the token
        const token = user.genAuthToken();
        return res.status(202)
        .header('x-auth-token' , token)
        .header('access-control-expose-headers' , 'x-auth-token')
        .json(user._id)
    } 
    catch (err){
        res.status(500).send(err.message)
    }
})
//get user profile
router.get('/me' , auth ,async (req , res)=> {
    const user = await User.findById(req.user._id).select('-password')
    res.status(200).send(user)
} ) 

//give basic info of the user 
router.get('/general/:id' , auth , async(req , res) => {
    try {
        const user = await User.findById(req.params.id).select('name blood_type')
        res.status(200).send(user)
    } catch (err) {
        res.status(500).send(err.message)
    }
} )

// update user info 
router.put('/update' , auth , async(req , res) => {
    try {
        
        let oldUser = await User.findById(req.user._id)
        
        // check of the user sent the coorect password to update his info
        
        const validPw = await bcrypt.compare(req.body.password , oldUser.password );
        if(!validPw) return res.status(400).send('wrong password')
        
        // in case they try to change props while they arent allowed to 
        req.body.role = oldUser.role
        req.body.verified = oldUser.verified
        req.body.last_donation = oldUser.last_donation
        req.body.posts = oldUser.posts
        req.body.score = oldUser.score

        // any other values not accepted will automatically be rejected

        //delete the password in req.body so it doesnt get pushed into the DB
        delete req.body.password

        if(req.body.newPassword){
            const hashPw = await bcrypt.hash(req.body.newPassword , 10);
            req.body.password = hashPw
        }
        if(req.body.email){
            //they gotta verify their new email
            req.body.verified = false
        }
        //res.send(req.body)
        const user = await User.findByIdAndUpdate(req.user._id , req.body , {returnOriginal:false} ) 
        res.send(user)

    } catch (err) {
        res.status(500).send(err.message)
    }
} )

module.exports = router ;