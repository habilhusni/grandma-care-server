'use strict'
const express 	= require('express');
const router 		= express.Router();
const User 			= require('../models/user');
const password 	= require('password-hash');
const jwt				= require('jsonwebtoken');
required('dotenv').config()

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
	let user = new User(
		{
      username	: req.body.username,
      password	: password.generate(req.body.password),
			phone			: req.body.phone,
			latitude	: 0,
			longitude : 0,
			accellX		: 0,
			accellY		: 0,
			accellZ		: 0
		});
	user.save((err, data) => {
  	if (err) res.send(err);
		res.send(data);
	});
}
user.updateUser = (req, res) => {
	User.findOneAndUpdate({
		_id: req.params.userId
	},{
		username: req.body.username,
	  password: password.generate(req.body.newPassword),
	  phone: req.body.phone,
	},(err, data) => {
		if(err) {
			res.send(err)
		} else {
			res.send(data)
		}
	})
}
user.delUser = (req, res) => {
	User.findOneAndRemove({
		_id: req.params.userId
	}, (err, data) => {
		if(err) res.send(err)
		res.send(data)
	})
}
user.addFriend = (req,res) => {
	User.findOneAndUpdate(
		{_id: req.params.userId},
		{$push: {friends: req.params.friendId}},
		{new: true, safe: true, upsert: true}
		,(err, data) => {
		if(err) {
			res.send(err)
		} else {
			res.send(data)
		}
	})
}
user.removeFriend = (req,res) => {
	User.findOneAndUpdate({
			_id: req.params.userId
		},{
			$pull: {'friends': req.params.friendId}
		},{
			new: true, safe: true, upsert: true
		},(err, data) => {
		if(err) {
			res.send(err)
		} else {
			res.send(data)
		}
	})
}
user.updateLocation = (req,res) => {
	User.findOneAndUpdate({
			_id: req.params.userId
		},{
			latitude  : Number(req.params.latitude),
			longitude : Number(req.params.longitude),
		},{
			new: true, safe: true, upsert: true
		},(err, data) => {
		if(err) {
			res.send(err)
		} else {
			res.send(data)
		}
	})
}
user.updateSensor = (req,res) => {
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
			res.send(err)
		} else {
			res.send(data)
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
