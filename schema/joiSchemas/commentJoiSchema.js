//requirements
const Joi = require('joi'); 

const commentSchema = Joi.object({
    content: Joi.string().min(3).required() ,
    postedBy: Joi.string().min(6)
})
    

//export 
module.exports = commentSchema ;