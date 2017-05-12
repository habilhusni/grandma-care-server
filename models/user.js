var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  phone: {type: String, required: true, unique: true},
  latitude: Number,
  longitude: Number,
  accellX: Number,
  accellY: Number,
  accellZ: Number,
  friends: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

var User = mongoose.model('User', userSchema);

module.exports = User;
