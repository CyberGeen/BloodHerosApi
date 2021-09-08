//requirement
const mongoose = require('mongoose')
require('mongoose-type-email');
const jwt = require('jsonwebtoken')
require('dotenv').config();

//----------------Schema--------
//email Schema 
const Email = new mongoose.Schema({
    adress: {
      // type: mongoose.SchemaType.Email ,
      type: mongoose.SchemaTypes.Email ,
       required: true ,
    } ,
    validated: {
        type: Boolean ,
        default: false
    } 
});

//emergency info
const ErInfo = new mongoose.Schema({
    emergencyCall: {
        type: String ,
        max: 8
    } ,
    emergencyInfo: {
        type: String
    }
});

//mainn user Schema
const userSchema = new mongoose.Schema({
    //name , email , gender , {city , region , country } , browser language , score , blood type , last donation , emergency info {phoneNumber , additional notes}
    name: {
        type: String ,
        required: [true , "can't be blank"] ,
    } , 
    //will be hashed , no point of verfying the min max / salt values
    password: {
        type: String ,
        required: true
    } ,
    email: mongoose.SchemaTypes.Email ,
    verified: {
        type: Boolean ,
        default: false 
    } ,
    gender: {
        type: String ,
        required: true ,
        enum: ['male' , 'female']
    } ,
    adress: {
        type: Number 
    } ,
    browser_language: {
        type: String ,
        enum: ['en' , 'ar' , 'fr']
    } ,
    score: {
        type: Number ,
        default: 0
    } ,
    blood_type: {
        type: String ,
        required: true ,
        enum: ['O+' , 'O-' , 'A+' , 'A-' , 'B+' , 'B-' , 'AB+' , 'AB-']
    } ,
    last_donation: {
        type: Date ,
        default: null
    } ,
    emergency_info: {
        type: ErInfo
    } ,
    posts: [{
        type:String
    }] ,
    role: {
        type: String ,
        enum: ['admin' , 'doc' , null] ,
        default: null
    }
})
userSchema.methods.genAuthToken = function() {
    return token = jwt.sign({_id: this._id , role: this.role} , process.env.JWT_KEY )
}

//export 
module.exports = mongoose.model('User', userSchema);