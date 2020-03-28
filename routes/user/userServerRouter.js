const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const sessionCheck = require('../../auth/checkSession');
const permit = require('../../auth/checkCreds');

let Server = require('../../web/models/server');
const User = mongoose.model('User');


router.get('/addserver', permit('user'), (req,res) =>{
    console.log('test')
    res.render('user/add_server');
})



module.exports = router;