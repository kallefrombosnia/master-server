const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')


const {registerSchema, loginSchema} = require('../validation');
const User = require('../web/models/User');
const generateToken = require('../auth/generateToken');



const isLogged = require('../auth/isLogged');


// Render register form to user
router.get('/register', isLogged, (req, res, next) =>{
    res.render('register');
});

// Check for new register post request
router.post('/register', isLogged, async (req, res, next) => {
    
    // Check incoming register request data
    const {error} = registerSchema.validate(req.body);
   
    // Error in validation exists render first error message
    if(error){
        return res.render('register', {
            error: error.details[0].message,
        });
    }
   
    // Check if user exists in our database
    const userExists = await User.findOne({email: req.body.email});

    // If user exists return error message
    if(userExists){
        return res.render('register', {
            error: 'User with this email already exists.',
        });
    }

    // Hash password before save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user schema object
    let user = new User({
        name: req.body.name,
        username: req.body.username,
        info: req.body.info,
        email: req.body.email,
        password: hashedPassword
    });

    // Try to save our new user into the db
    try{

       const userInfo = await user.save();
       return res.redirect('/login');

    }catch(error){

        console.log(error)

    } 
    
});

// Render to user our login form
router.get('/login', isLogged, (req, res, next) =>{
    res.render('login');
});

// Check for new login post request
router.post('/login', isLogged, async (req, res, next) => {
    
    // Check incoming register request data
    const {error} = loginSchema.validate(req.body);
   
    // Error in validation exists render first error message
    if(error){
        return res.render('login', {
            error: error.details[0].message,
        });
    }
   
    // Check if email of user exists in our database
    const userInfo = await User.findOne({email: req.body.email});

    // Render error message if this email does not exists
    if(!userInfo){
        return res.render('login', {
            error: 'Email does not exists.',
        });
    }

    // Check submited password with one in our db with assigned email
    const checkPassword = await bcrypt.compare(req.body.password, userInfo.password);

    // If password dont match render error message
    if(!checkPassword){
        return res.render('login', {
            error: 'Wrong password.',
        });
    }
    
    // Generate jwt and redirect user to dashboard
    await generateToken(res,userInfo._id, userInfo.auth_level); 

    console.log('login auth: ', userInfo.auth_level)

    return userInfo.auth_level !== 'user' ? res.redirect('/dashboard') : res.redirect('/');

});


router.get('/logout', (req, res, next) =>{
    res.clearCookie('token').redirect('/');
});


module.exports = router;