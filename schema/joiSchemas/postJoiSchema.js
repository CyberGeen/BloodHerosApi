//requirements
const Joi = require('joi'); 

//schema
const postSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    blood_type: Joi.string(),
    tags: Joi.string().valid('urgent' , 'other') ,
    image: Joi.string() ,
    posted_by: Joi.string()
})

//export 
module.exports = postSchema ;