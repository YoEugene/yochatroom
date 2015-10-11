var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbURL),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    rooms = [];

app.set('views', path.join(__dirname, 'views')); // ./views
// console.log(__dirname); ==> /Users/yoeugene/Desktop/ChatCat_Begin

app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public'))); // ./public

// Include cookie/session
app.use(cookieParser());
// app.use(session({secret : 'catscanfly'}));

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    // dev specific settings
    app.use(session({
        secret: config.sessionSecret
    }));
} else {
    // production specific settings
    app.use(session({
        secret: config.sessionSecret,
        store: new ConnectMongo({
            // url: config.dbURL,
            // connect to the dbURL we already instantiated via mongoose on line 8
            mongoose_connection: mongoose.connections[0],
            stringify: true
        })
    }));
}

// Testing mongoose ////////////////////////////
// var userSchema = mongoose.Schema({
//     username: String,
//     password: String,
//     fullname: String
// });
// 
// var Person = mongoose.model('users', userSchema);
// 
// var Eugene = new Person({
//  username: 'Eugene',
//  password: 'vm3u.4fmp6',
//  fullname: 'Eugene Hsu'
// });
// 
// Eugene.save(function(err) {
//  console.log('Done!');
// })
/////////////////////////////////////////////////

app.use(passport.initialize());
app.use(passport.session());
// Auth via passport
require('./auth/passportAuth.js')(passport, FacebookStrategy, config, mongoose);

require('./routes/routes.js')(express, app, passport, config, rooms);

// Setting routes without routes.js modularity ///////////////////////////////////
// app.route('/').get(function(req, res, next) {
//  // res.send('<h1>Hello World!</h1>');
//  res.render('index', {
//      title: 'Welcome to YoChat'
//  });
// });
/////////////////////////////////////////////////


// app.listen(3000, function() {
//     console.log('YoChat Working on Port 3000');
//     console.log('Mode: ' + env);
// });

// if environment port is not setting, set to default port 3000
app.set('port', process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io, rooms);
server.listen(app.get('port'), function() {
    console.log('YoChat on Port: ' + app.get('port'));
});
