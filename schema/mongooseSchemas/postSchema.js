//requirement
const mongoose = require('mongoose')
const _ = require('lodash')

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
    },
    down_votes: {
        type:Array
    } ,
    ud_rate : {
        type:Number ,
        default:0
    } ,
    date: {
        type: Date ,
        default:Date.now
    } ,
    donator: {
        type:String
    } ,
    city: {
        type: Number
    } ,
    state: {
        type: Boolean ,
        default:false
    } , 
    isReported: {
        type:Boolean ,
        default:false
    } ,
    until_donation:{
        type: Date
    }
})

//methods
postSchema.methods.handleUdRate = function() {
     return  _.size(this.up_votes) - _.size( this.down_votes)
}

//exports
module.exports = mongoose.model('Posts' , postSchema );