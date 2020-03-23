const express = require('express');
const router = express.Router();


let Server = require('../../web/models/server');
const {userInfo} = require('../../web/functions');

const checkSession = require('../../auth/checkSession');

const permit = require('../../auth/checkCreds');

io.on('connection', (socket) =>{

    io.emit('userCount', socket.client.conn.server.clientsCount);

    console.log('Socket.io user connected');
    socket.on('disconnect', (msg) =>{
        io.emit('userCount', socket.client.conn.server.clientsCount);
        console.log('a user disconnected');
    });
});

router.get('/dashboard', checkSession, permit('admin'), (req, res, next) =>{
console.group('called dashboard func')
    Server.find({}, (err, serverlist) =>{

        if(err){

            console.log(`Error while fetching all servers: ${err}`);

        }else{
            
            let i = 1
            setInterval(test =>{
                i++

                userInfo('http://ip-api.com/json/213.143.79.79').then(result => {
                    io.emit('newClient',   {
                        result
                    });
                })
               

                io.emit('newClient',   `test ${i}`);
            },50000);

            res.render('dashboard', {
                serverlist,
                count: serverlist.length,
                limit: true
            });
        }
    });
});

module.exports = router;