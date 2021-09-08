//requirement
const mongoose = require('mongoose')

//Schema 
const postSchema = new mongoose.Schema({
    title: {
        type:String ,
        required: true
    } ,
    description: {
        type: String ,
        required: true
    } ,
    blood_type: {
        type: String ,
        required: true ,
        enum: ['O+' , 'O-' , 'A+' , 'A-' , 'B+' , 'B-' , 'AB+' , 'AB-']
    } ,
    tags:{
        type:String ,
        enum: ['urgent' , 'other'] ,
        default: 'other'
    } ,
    image: {
        type:String
    } ,
    posted_by: {
        type:String ,
        required:true
    } ,
    comments: [{
        content:{type:String , required:true , unique:true} ,
        postedBy: {type:String , required:true} ,
        date: {type:Date , default:Date.now} ,
    }] ,
    up_votes: {
        type:Array
    } ,
    down_votes: {
        type:Array
    } ,
    ud_rate : {
        type:Number
    } ,
    date: {
        type: Date ,
        default:Date.now
    }
})

//exports
module.exports = mongoose.model('Posts' , postSchema );