'use strict'
var jwt = require('jsonwebtoken');
require('dotenv').config()
let helper = {}
helper.authenticate = (req, res, next) => {
	jwt.verify(req.headers.token, process.env.SECRET , function(err, decoded) {
		if(decoded) {
			next()
		}else {
			res.send(err);
		}
	})
}

module.exports = helper
