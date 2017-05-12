var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username  : {type: String, required: true, unique: true},
  password  : {type: String, required: true},
  phone     : {type: String, required: true, unique: true},
  latitude  : {type: Number, default: 0},
  longitude : {type: Number, default: 0},
  accellX   : {type: Number, default: 0},
  accellY   : {type: Number, default: 0},
  accellZ   : {type: Number, default: 0},
  friends   : [{type: Schema.Types.ObjectId, ref: 'User'}]
});

var User = mongoose.model('User', userSchema);

module.exports = User;
