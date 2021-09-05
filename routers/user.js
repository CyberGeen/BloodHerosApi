//requirements
const express = require('express')
const router = express.Router()
const User = require('../schema/mongooseSchemas/userSchema')
const userJoiSchema = require('../schema/joiSchemas/userJoiSchema')
const bcrypt = require('bcrypt')

//sign up
router.post('/signup' , async(req , res) => {
    try {
        let validate = await userJoiSchema.validate(req.body)
        if(validate.error) {
            console.log(1)
            return res.status(400).send(validate.error.details) }
        else {
            const hashPw = await bcrypt.hash(validate.value.password , 10);
            validate.value.password = hashPw
            const user = new User(validate.value);
            const validEmail =await User.findOne({email:req.body.email})
            if(validEmail) return res.status(400).json({"error":"email already used"})
            const newUser = await user.save() ;
            console.log(user)
            res.status(201).send(newUser._id);
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
        else return res.status(202).json(user._id)

    } catch (err){
        res.status(500).send(err.message)
    }
    
    
})



module.exports = router ;