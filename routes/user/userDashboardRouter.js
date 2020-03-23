const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const sessionCheck = require('../../auth/checkSession');
const permit = require('../../auth/checkCreds');

let Server = require('../../web/models/server');
const User = mongoose.model('User');


router.get('/', sessionCheck, permit('user'), async  (req, res, next) =>{

    const servers = await Server.find({owner_id: req.user.id});

    User.findOne({_id: req.user.id}, (err, user) =>{

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
        res.render('user/dashboard', {
            userInfo: user,
            serversNumber,
            servers
        });

    });

       
       
});


router.get('/serverlist', sessionCheck, permit('user'), async  (req, res, next) =>{

    Server.find({_id: req.user.id}, (err, serverlist) =>{

        if(err) {

            console.log(`Error while fetching all servers: ${err}`);

        } else {
            
            return res.render('user/servers', {
                serverlist,
                count: serverlist.length,
                limit: false
            });
        }
    });     
    
});


router.get('/profile', sessionCheck, permit('user'), async (req, res, next) =>{


    // Try to find this specific user
    User.findOne({_id: req.user.id}, (err, user) =>{

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
        
        // If found render data to the user
        res.render('user/profile', {
            userInfo: user,
        });

    });

});
    
    module.exports = router;