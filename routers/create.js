//requirement
const express = require('express')
const router = express.Router()
const isAdmin = require('../middleware/isAdmin')
const auth = require('../middleware/auth')
const Joi = require('joi')
const User = require('../schema/mongooseSchemas/userSchema')

//---------------add admin----------------
router.post('/admin' , [auth , isAdmin] ,async (req , res) => {
    const validate = validEmail(req.body)
    if(validate.error){
        return res.status(400).send(validate.error.details)
    }
    try{
        const newAdmin =await User.findOneAndUpdate({email:req.body.email} , {role:'admin'} , {returnOriginal:false})
        if(newAdmin===null) res.status(400).json({"error":"invalide email"})
        res.status(201).send(newAdmin)
    } catch {
        res.status(500).json({"error":"db down"})
    }
})
//-----------------add doc-------------------
router.post('/doc' , [auth , isAdmin] ,async (req , res) => {
    const validate = validEmail(req.body)
    if(validate.error){
        return res.status(400).send(validate.error.details)
    }
    try{
        const newAdmin =await User.findOneAndUpdate({email:req.body.email} , {role:'doc'} , {returnOriginal:false})
        if(newAdmin===null) res.status(400).json({"error":"invalide email"})
        res.status(201).send(newAdmin)
    } catch {
        res.status(500).json({"error":"db down"})
    }
})
//---------------delete admin----------------
router.delete('/admin/:id' , [auth , isAdmin] ,async (req , res) => {
    try{
        const newAdmin =await User.findByIdAndUpdate(req.params.id , {role:null} )
        if(newAdmin===null) return res.status(400).json({"error":"invalide id"})
        return res.status(201).send(newAdmin)
    } catch (err){
        res.status(500).json(err)
    }
})
//---------------delete doc----------------
router.delete('/doc/:id' , [auth , isAdmin] ,async (req , res) => {
    try{
        const newAdmin =await User.findByIdAndUpdate(req.params.id , {role:null} )
        if(newAdmin===null) return res.status(400).json({"error":"invalide id"})
        return res.status(201).send(newAdmin)
    } catch (err){
        res.status(500).json(err)
    }
})


//email Joi object schema
const emailSchema = Joi.object({
    email: Joi.string().required().email()
})
//validate email function 
const validEmail = (body) => {
    return emailSchema.validate(body);
}

//exports
module.exports = router ;