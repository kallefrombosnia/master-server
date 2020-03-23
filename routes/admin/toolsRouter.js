const express = require('express');
const router = express.Router();

const {userInfo, queryServer, formatTime} = require('../../web/functions');


let Server = require('../../web/models/server');

const permit = require('../../auth/checkCreds');

router.get('/tools', (req, res, next) =>{
    res.render('tools');      
});



router.get('/tools/user', permit('admin'), (req, res, next) =>{
    
    res.render('check_user');
      
});

router.post('/tools/user', permit('admin'), (req, res, next) =>{
    
    if(req.body){
        return res.redirect(`user/${req.body.ip}`);
    }

    return res.redirect('tools/user/');
       
});

router.get('/tools/user/:ip', permit('admin'), (req, res, next) =>{
    
    userInfo(`http://ip-api.com/json/${req.params.ip}`).then(result => {
        res.render('user', {
            info: result
        });
    })
      
});

router.get('/tools/server', permit('admin'),(req, res, next) =>{
    return res.render('check_server');
});

router.post('/tools/server', async (req, res, next) =>{

        if(!req.body){
            return res.render('view_server_not_owned', {
                error: 'Error: not submited ip.'
            });
        }
        
       
        try{

            const address = req.body.ip.toString().split(':')
            const info = await queryServer(address[0], address[1]);

            let players = [];
         
            if(info.players === undefined){
                return res.render('view_server_not_owned', {
                    error: 'Server is offline',
                });
            }

            info.players.forEach(value => {
                players.push({
                    name: value.name,
                    frags: value.score,
                    timePlaying: formatTime(value.time)
                })
            });


        
            const srw = await Server.findOne({'ip': req.body.ip}, (err, server) =>{
                
                if (server) {
                   return server;
                } 
            })

            res.render('view_server_not_owned', {
                gameInfo: info,
                players,
                ip: req.body.ip,
                srw
            });

        } catch(error){
            console.log(error)
        }
        
});


router.get('/tools/ping', permit('admin'), (req, res, next) =>{
    return res.render('check_ping');
});


router.post('/tools/ping', permit('admin'), async (req, res, next) =>{

    if(!req.body){
        return res.render('pingInfo', {
            error: 'Error: not submited ip.'
        });
    }
    
   
    try{

        const address = req.body.ip.toString().split(':')

        // Call once for first response
        queryServer(address[0], address[1]).then(response =>{
            io.emit('pingInfo', {ping: response.ping});
        })

        setInterval(() => {
            queryServer(address[0], address[1]).then(response =>{
                io.emit('pingInfo', {ping: response.ping});
            })
        }, 5000);
          
        res.render('pingInfo',{
            ip: req.body.ip
        });

    } catch(error){
        console.log(error)
    }
    
});


module.exports = router;
