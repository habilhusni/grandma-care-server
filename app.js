const express 			= require('express');
const cors 					= require('cors');
const bodyParser 		= require('body-parser');
const passport 			= require('passport');
const passportLocal = require('passport-local');
const Strategy 			= passportLocal.Strategy;
const jwt 					= require('jsonwebtoken');
const passwordHash 	= require('password-hash');
const mongoose 			= require('mongoose');
const logger 				= require('morgan');
require('dotenv').config()

const app 					= express();
const Users 				= require('./models/user');
const index 				= require('./routes/index');

mongoose.Promise = global.Promise
app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const dbconfig = {
	development:'mongodb://localhost/final-project',
	test:'mongodb://localhost/final-project-test',
	production: 'mongodb://localhost/final-project-prod'
}

mongoose.connect(dbconfig[app.settings.env], (err,success)=> {
	if(err){
		console.log(err)
	} else {
		console.log('Connected to database in '+app.settings.env)
	}
})
mongoose.connection.on('connected', ()=> {
	console.log('MongoDB is running')
})

app.use('/', index);

passport.use(new Strategy(
	function(username, password, cb) {
		Users.findOne({ username: username }, function(err, user) {
			if(err) res.send(err.message);
      let isVerified = passwordHash.verify(password, user.password);
			if(user.username == username && isVerified) {
				cb(null, user);
			}else {
				cb(null, 'invalid username or password')
			}
		});
	}
));

app.use(passport.initialize());

app.listen(process.env.PORT || 3000);

module.exports = app;
