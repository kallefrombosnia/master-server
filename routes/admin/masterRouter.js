const express = require('express');
const router = express.Router();


const {HL_MasterServer}= require('../../master-server/app');
const {getAllServerFromDB} = require('../../web/functions');

const permit = require('../../auth/checkCreds');


global.master = new HL_MasterServer(27015);

getAllServerFromDB().then( servers =>{
 
    master.emit('addServerToMasterAll', servers);  
                                       
}); 

router.get('/master', permit('admin'), (req, res, next) =>{

    res.render('master', {
        started: master._started,
        running: master._running,
        error: master._error,
        errorMessage: master._lastError
    });      
});

router.post('/master', permit('admin'), (req, res, next) =>{
   
    
    if(req.body.start != undefined){
        console.log('start ms')
        master.startMasterServer();

    }else if(req.body.restart != undefined){
        console.log('rr ms')
        master.restartMasterServer();
        
    }else if(req.body.stop != undefined){
        console.log('stop ms ')
        master.stopMasterServer();

    }else{
        console.log('Not defined post request')
    }
    
    res.redirect('/master')     
});

module.exports = router;