const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const {queryServer, formatTime} = require('../../web/functions');

let Server = require('../../web/models/server');
let User = mongoose.model('User');

const permit = require('../../auth/checkCreds');

router.get('/servers', permit('admin'), (req, res, next) =>{

    Server.find({}, (err, serverlist) =>{

        if(err) {

            console.log(`Error while fetching all servers: ${err}`);

        } else {
            
            return res.render('servers', {
                serverlist,
                count: serverlist.length,
                limit: false
            });
        }
    });
});



router.get('/server/add', permit('admin'), (req, res, next) =>{

    res.render('server_add');
       
  
});


router.post('/server/add', permit('admin'), (req, res, next) => {

    let server = new Server({
        name: req.body.nameSrw,
        ip: req.body.ipSrw,
        info: req.body.infoSrw,
        owner_id: req.user.id
    });
    
    server.save((err) => {

        if(err){
            console.log(err)
            return;

        } else {

            master.emit('addServerToMaster', req.body.ipSrw);
            return res.redirect('/');

        }
    })
  
});

router.get('/server/:id', permit('admin'), (req, res, next) =>{

    Server.findById(req.params.id, async (err, serverInfo) =>{

        if(!serverInfo){
            return res.render('server_view', {
                error: 'Server not found.'
            });
        }

        if(err){

            return res.render('server_view', {
                error: err
            });

        }

        try{

            const address = serverInfo.ip.toString().split(':')
            const info = await queryServer(address[0], address[1]);

            let players = [];
         
            if(info.players === undefined){
                return res.render('server_view', {
                    error: 'Server is offline',
                    id: req.params.id
                });
            }

            info.players.forEach(value => {
                players.push({
                    name: value.name,
                    frags: value.score,
                    timePlaying: formatTime(value.time)
                })
            });

            res.render('server_view', {
                serverInfo,
                gameInfo: info,
                players,
                id: req.params.id
            });

        } catch(error){
            console.log(error)
        }
        
    });

});

router.post('/delete', permit('admin'), (req, res, next) =>{
     
    if(req.body.id != undefined){
        
        Server.findByIdAndDelete({_id: req.body.id}, async (err, serverInfo) =>{
            
           if(err){
               
                return res.render('server_view', {
                    error: 'Cannot delete server',
                });
           }
           
           return res.redirect('/servers')     

        });
    }
});

router.get('/server/edit/:id', permit('admin'), (req, res, next) =>{

    Server.findById(req.params.id, async (err, serverInfo) =>{

        if(!serverInfo){
            return res.render('server_view', {
                error: 'Server not found.'
            });
        }

        if(err){

            return res.render('server_edit', {
                error: err
            });

        }
        console.log(serverInfo)

        const userList = await User.find({}, (err, info) =>{});
        const serverOwnerInfo = await User.findOne({_id: serverInfo.owner_id});

        res.render('server_edit', {
            id: serverInfo._id,
            name: serverInfo.name,
            ip: serverInfo.ip,
            info: serverInfo.info,
            owner_id: serverInfo.owner_id,
            serverOwnerName: serverOwnerInfo.username,
            userList
        });

        
   
    });
        
});


router.post('/server/edit/:id', permit('admin'), async (req, res, next) => {
    console.log('body: ',req.body)
    let server = {
        name: req.body.nameSrw,
        ip: req.body.ipSrw,
        info: req.body.infoSrw,
        owner_id: req.body.ownerId
    };
   
    const serverInfo = await Server.findById({_id: req.params.id});

    if(serverInfo.owner_id !== req.body.ownerId){

        const userId = await User.findOne({username: req.body.ownerId})

        server = {
            name: req.body.nameSrw,
            ip: req.body.ipSrw,
            info: req.body.infoSrw,
            owner_id: userId._id
        };

    }
    
    
    Server.update({_id: req.params.id}, server, (err,raw) => {
        console.log(raw)
        if(err){

            console.log(err)
            return;

        }

        return res.redirect('/servers') 

    })
  
});

module.exports = router;
