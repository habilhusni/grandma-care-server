var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username : {type: String, required: true, unique: true},
  password : {type: String, required: true},
  phone : {type: String, required: true, unique: true},
  email: {
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: function(v) {
            return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(v);
          },
          message: '{VALUE} is not a valid email!'
        }
      }
  latitude : {type: Number, default: 0},
  longitude : {type: Number, default: 0},
  accellX : {type: Number, default: 0},
  accellY : {type: Number, default: 0},
  accellZ : {type: Number, default: 0},
  friends : [{type: Schema.Types.ObjectId, ref: 'User'}]
});

var User = mongoose.model('User', userSchema);

module.exports = User;
