//requirements
const Joi = require('joi'); 

//user Schema
const userSchema = Joi.object({
    name: Joi.string().min(3).required() ,
    password: Joi.string().min(5).required() ,
    email: Joi.string().required().email() ,
    gender: Joi.string().required() ,
    city: Joi.number().min(1) ,
    blood_type: Joi.string(),
    last_donation: Joi.date().allow(""),
    emergency_info: {
        emergencyCall: Joi.string().allow("") ,
        emergencyInfo: Joi.string().allow("") 
    },
    browser_language: Joi.string()
});

//export 
module.exports = userSchema ;