'use strict'
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const password = require('password-hash');
const jwt = require('jsonwebtoken');
const awsIot = require('aws-iot-device-sdk');
require('dotenv').config()

const device = awsIot.device({
   keyPath: './device-accelerometer.private.key',
  certPath: './device-accelerometer.cert.pem',
    caPath: './root-CA.crt',
      host: 'a38x4799nd8aym.iot.eu-central-1.amazonaws.com',
    region: 'eu-central-1'
});
const user = {}

user.getUser = (req, res) => {
	User
	.find({})
	.populate('friends')
	.exec((err, data) => {
		if(err) res.send(err);
		res.send(data);
	});
}
user.getOneUser = (req, res) => {
	User
	.findOne({_id: req.params.userId})
	.populate('friends')
	.exec((err, data) => {
		if (err) res.send(err);
		res.send(data);
	});
}
user.createUser = (req, res) => {
  if (/\s/.test(req.body.username) || /\s/.test(req.body.password) || /\s/.test(req.body.email) || /\s/.test(req.body.phone)){
    res.status(400).send({message: 'Bad Request'})
  } else {
    let user = new User(
  		{
        username : req.body.username,
        password : password.generate(req.body.password),
  			phone : req.body.phone,
        email : req.body.email,
  			latitude : 0,
  			longitude : 0,
  			accellX : 0,
  			accellY : 0,
  			accellZ : 0
  		});
  	user.save((err, data) => {
    	if (err) {
        res.status(400).send(err);
      } else {
        res.send(data);
      }
  	});
  }
}
user.updateUser = (req, res) => {
  if (/\s/.test(req.body.username) || /\s/.test(req.body.email) || /\s/.test(req.body.phone)) {
    res.status(400).send({message: 'Bad Request'})
  } else {
    User.findOne({
  		_id: req.params.userId
  	},(err, data) => {
      if (err) {
        res.send(err);
      } else {
        data.username = req.body.username,
        data.phone = req.body.phone,
        data.email = req.body.email
        data.save((err, response) => {
        	if (err) {
            res.status(400).send(err);
          } else {
            res.send(response);
          }
      	});
      }
  	});
  }
}
user.delUser = (req, res) => {
	User.findOneAndRemove({
		_id: req.params.userId
	}, (err, data) => {
		if(err) {
      res.status(400).send(err)
    } else if(!data) {
      res.status(400).send(err)
    } else {
      res.send(data)
    }
	})
}
user.addFriend = (req,res) => {
  User
	.findOne({_id: req.params.userId})
	.populate('friends')
	.exec((err, data) => {
		if (err) res.status(400).send(err);
		if (data.email.toString() === req.params.friendEmail.toString()){
      res.status(400).send({error: err, message: 'Bad Request, you cannot add yourself as a friend'})
    } else {
      const sameEmail = data.friends.filter(friend => friend.email === req.params.friendEmail.toString())
      if(sameEmail.length > 0) {
        res.status(400).send({message: 'Friend already on the list'})
      } else {
        User.findOne({
          email: req.params.friendEmail
        }, (err,friend) => {
          if(err) {
            res.status(400).send(err)
          } else if(!friend) {
            res.status(400).send(err)
          } else {
            User.findOneAndUpdate({
              email: req.params.friendEmail
            },{
              $push: {'friends': req.params.userId}
            },{
              new: true, safe: true, upsert: true
            },(err, friend) => {
              if(err) res.status(400).send(err)
              User.findOneAndUpdate({
                _id: req.params.userId
              },{
                $push: {'friends': friend._id}
              },{
                new: true, safe: true, upsert: true
              },(err, data) => {
                if (err) res.status(400).send(err)
                res.send(data)
              })
            })
          }
        })
      }
    }
	});
}
user.removeFriend = (req,res) => {
  if(req.params.userId === req.params.friendId){
    res.status(400).send({message: `Bad Request`})
  } else {
    User.findOne({
      _id: req.params.userId
    }, (err1,user) => {
      if(err1) {
        res.status(400).send(err1)
      } else if(!user) {
        res.status(400).send({message: 'No User found'})
      } else {
        User.findOne({
          _id: req.params.friendId
        }, (err2,friend) => {
          if(err2) {
            res.status(400).send(err2)
          } else if(!friend) {
            res.status(400).send({message: 'No Friend found'})
          } else {
            User.findOneAndUpdate({
          			_id: req.params.userId
          		},{
          			$pull: {'friends': req.params.friendId}
          		},{
          			new: true, safe: true, upsert: true
          		},(err, data) => {
          		if(err) {
          			res.status(400).send(err)
          		} else {
                User.findOneAndUpdate({
              			_id: req.params.friendId
              		},{
              			$pull: {'friends': req.params.userId}
              		},{
              			new: true, safe: true, upsert: true
              		},(err, data) => {
              		if(err) {
              			res.status(400).send(err)
              		} else {
              			res.send(data)
              		}
              	});
          		}
          	});
          }
        })
      }
    })
  }
}
user.updateLocation = (req,res) => {
  User.findOne({
			_id: req.params.userId
		},(err,data) => {
      if(err) {
        res.status(400).send(err)
      } else if(!data){
        res.status(400).send(err)
      } else {
        User.findOneAndUpdate({
      			_id: req.params.userId
      		},{
      			latitude : Number(req.params.latitude),
      			longitude : Number(req.params.longitude),
      		},{
      			new: true, safe: true, upsert: true
      		},(err, data) => {
      		if(err) {
      			res.status(400).send(err)
      		} else {
      			res.send(data)
      		}
      	})
      }
    })
}
user.updateSensor = (req,res) => {
  User.findOne({
    _id: req.params.userId
  },(err,data) => {
    if(err) {
      res.status(400).send(err)
    } else if(!data) {
      res.status(400).send({message: 'No User Found'})
    } else {
      User.findOneAndUpdate({
    			_id: req.params.userId
    		},{
    			accellX : Number(req.params.x),
    			accellY : Number(req.params.y),
    			accellZ : Number(req.params.z)
    		},{
    			new: true, safe: true, upsert: true
    		},(err, data) => {
    		if(err) {
    			res.status(400).send(err)
    		} else {
    			res.send(data)
    	    device.publish('topic_2', JSON.stringify({userId:data._id, x: data.accellX, y: data.accellY, z: data.accellZ}));
    		}
    	})
    }
  })
}
user.login = (req, res) => {
	var token = jwt.sign({username: req.user.username, password: req.user.password}, process.env.SECRET);
  res.send({
		token: token,
		id: req.user.id,
	});
}

module.exports = user
