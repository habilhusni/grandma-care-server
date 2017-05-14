const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const passportLocal = require('passport-local');
const Strategy = passportLocal.Strategy;
const jwt	= require('jsonwebtoken');
const passwordHash = require('password-hash');
const mongoose = require('mongoose');
const logger = require('morgan');
const awsIot = require('aws-iot-device-sdk');
const nodemailer = require('nodemailer');
require('dotenv').config()

const app = express();
const Users = require('./models/user');
const index = require('./routes/index');
const device = awsIot.device({
   keyPath: './device-accelerometer.private.key',
  certPath: './device-accelerometer.cert.pem',
    caPath: './root-CA.crt',
      host: 'a38x4799nd8aym.iot.eu-central-1.amazonaws.com',
    region: 'eu-central-1'
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

let mailOptions = {
    from    : '"Grandma Care" <grandma@care.com>', // sender address
    to      : 'arfanizar.fth@gmail.com', // list of receivers
    subject : 'URGENT', // Subject line
    text    : 'We have detected that there is something wrong with your grandma phone, perhaps something happened with your grandma?', // plain text body
    html    : '<b>We have detected that there is something wrong with your grandma phone, perhaps something happened with your grandma?</b>' // html body
};

device
  .on('connect', function() {
    console.log('AWS IOT connected');
    device.subscribe('topic_1');
    });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
    let obj = JSON.parse(payload.toString())
    console.log(obj.userId);
    console.log(obj.x);
    console.log(obj.y);
    console.log(obj.z);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    });
  });

mongoose.Promise = global.Promise
app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const dbconfig = {
	development:'mongodb://localhost/final-project-dev',
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
			if(err || user == null) {
        cb(null, err)
      } else {
        let isVerified = passwordHash.verify(password, user.password);
  			if(user.username == username && isVerified) {
  				cb(null, user);
  			}else {
  				cb(null, 'invalid username or password')
  			}
      }
		});
	}
));

app.use(passport.initialize());

app.listen(process.env.PORT || 3000);

module.exports = app;
