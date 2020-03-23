
const Joi = require('@hapi/joi');

const registerSchema = Joi.object({
    name: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(30),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6),
    info: Joi.string()        
});


const loginSchema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6),      
});

module.exports = {
    registerSchema,
    loginSchema
}


