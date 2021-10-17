//requirements
const Joi = require('joi'); 

//schema
const postSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    blood_type: Joi.string(),
    tags: Joi.string().valid('urgent' , 'other') ,
    image: Joi.string().allow("") ,
    posted_by: Joi.string() ,
    city: Joi.number()
})

//export 
module.exports = postSchema ;