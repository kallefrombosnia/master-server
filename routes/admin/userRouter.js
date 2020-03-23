const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Server = mongoose.model('Servers');

const permit = require('../../auth/checkCreds');

// Public function get all users from db
router.get('/users', permit('admin'), (req, res, next) =>{

    // Call db for operation
    User.find({}, (err, users) =>{
        
        // Check if any error occured
        if(err){
            console.log(err)
        }
       
        // If query is null render error
        if(users === null){
            return res.render('profiles', {
                error: 'Error while query data.',
            })
        }

        // Render all of data to the user on frontend
        res.render('profiles', {
            users,
            count: users.length,
        })
    });

});

// Get specific profile id
router.get('/user/:id', permit('admin'), async (req, res, next) =>{

    const servers = await Server.find({owner_id: req.params.id});
  
    // Try to find this specific user
    User.findOne({_id: req.params.id}, (err, user) =>{

        // Check for possible error
        if(err){
            console.log(err)
        }
       
        // If user doesnt exists render error 
        if(user === null){
            return res.render('view_profile', {
                error: 'User not found.',
            });
        }

        // Count server number
        const serversNumber = servers ?  servers.length : 0;
        
        // If found render data to the user
        res.render('view_profile', {
            userInfo: user,
            serversNumber,
            servers
        });

    });

});

// Call edit form for specific user
router.get('/user/edit/:id', permit('admin'), (req,res,next) =>{
   
    // Find this users if he exists
    User.findById(req.params.id, (err, userInfo) =>{

        // If user doesnt exists render error 
        if(!userInfo){
            return res.render('edit_user', {
                error: 'User not found.'
            });
        }


        // If db error happened also render message
        if(err){
            return res.render('edit_user', {
                error: err
            });
        }

        // Render edit form with some values from db
        res.render('edit_user', {
            name: userInfo.name,
            info: userInfo.info,
            email: userInfo.email,
            auth_level: userInfo.auth_level,
            authLevels: [
                'user',
                'admin'
            ]  
        });

    });

});

// Post request user edit
router.post('/user/edit/:id', permit('admin'), async (req, res, next) => {

    // Get info from this user selected by id
    const userInfo = await User.findOne({_id: req.params.id});

    // Render error message if this id does not exists
    if(!userInfo){
        return res.render('edit_user', {
            error: 'User does not exists.',
        });
    }
  
    // Construct object for User Schema
    let user = {
        name: req.body.name,
        ip: req.body.ip,
        info: req.body.info,
        auth_level: req.body.authLevel
    };

    // Check if password is submitted
    if(req.body.password != ''){
        
        // If old password is submitted check is new password is not empty
        if(req.body.passwordNew != ''){
            
            // Check if old password and new password are not same 
            if(req.body.password === req.body.passwordNew) {
                return res.render('edit_user', {
                    error: 'You cant submit same data for passwords.'      
                });
            }

            // Check if old password matches
            const checkOldPassword = await bcrypt.compare(req.body.password, userInfo.password);

            // If password dont match render error message
            if(!checkOldPassword){
                return res.render('edit_user', {
                    error: 'Old passwords dont match.',
                });
            }
        
            // Check if new password is not equal to old
            const checkPassword = await bcrypt.compare(req.body.passwordNew, userInfo.password);

            // If password dont match render error message
            if(checkPassword){
                return res.render('edit_user', {
                    error: 'New password cant be same as old.',
                });
            }
            
            // Hash password before save
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.passwordNew, salt);

            // Construct new Shchema user with password field
            user = {
                name: req.body.name,
                ip: req.body.ip,
                info: req.body.info,
                password: hashedPassword,
                auth_level: req.body.authLevel
            };
            
        }else{

            // Render error is new password field is empty
            return res.render('edit_user', {
                error: 'New password cannot be empty.'      
            });
        } 

    }

    // Continue with update without password
    return User.updateOne({_id: req.params.id}, user, (err,raw) => {

        //  Check for error
        if(err){
            console.log(err)
            return;
        }   

        // Check if user who downgraded his rank still can access panel
        if(req.body.authLevel === 'user' ){
            if(!req.user.id === !userInfo._id){
                return res.redirect('/logout');
            }          
        }
     
        // If all good redirect to user profile
        res.redirect(`${req.params.id}`);
    })

});

module.exports = router;