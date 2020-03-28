const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Set io socket in global object
global.io = require('socket.io').listen('8080');

const checkForAuthCookie = require('../auth/checkForAuthCookie');
const sessionCheck = require('../auth/checkSession');


mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

// Listen for connection open
db.once('open', () =>{
    console.log('MongoDB connection established.');
});

// Listen for mongodb errors
db.on('error', (error) =>{
    console.error(`MongoDB error: ${error}`);
});


// Init app
const app = express();

// Template folder
app.set('views', path.join(__dirname, 'views'));

// Serve static files 
app.use('/assets', express.static(path.join(__dirname, 'assets')))

// Use body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set rendering enginel current pugjs
app.set('view engine', 'pug');

// Express use cors
//app.use(cors());

// Express use cookie parser
app.use(cookieParser());

// Try to set user object on every request if possible
app.all("*", checkForAuthCookie);


/*
    AUTH ROUTES
*/

// Use authentication router handler
app.use(require('../routes/authRouter'));


/*
    ADMIN ROUTES
*/

// Use dashboard router handler
app.use(require('../routes/admin/dashboardRouter'), sessionCheck);

// Use server router handler
app.use(require('../routes/admin/serverRouter'), sessionCheck);

// Use master router handler
app.use(require('../routes/admin/masterRouter'), sessionCheck);

// Use tools router handler
app.use(require('../routes/admin/toolsRouter'), sessionCheck);

// Use users router handler
app.use(require('../routes/admin/userRouter'), sessionCheck);

/*
    USER ROUTES
*/

// Use user dashboard
app.use(require('../routes/user/userDashboardRouter'), sessionCheck);

// Use user server router
app.use(require('../routes/user/userServerRouter'), sessionCheck);

// Start app and listen on web port
app.listen(process.env.PORT, () =>{
    console.log('Web server started on port 3000...');
});