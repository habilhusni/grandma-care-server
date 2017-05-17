var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username : {type: String, required: true, unique: true},
  password : {type: String, required: true},
  phone : {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        if (v.length > 14 || v.length < 10 ){
          return false
        } else {
          return /([0-9])\w+/.test(v)
        }
      },
      message: '{VALUE} is not a valid phone!'
    }
  },
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
  },
  latitude : {type: Number, default: 0},
  longitude : {type: Number, default: 0},
  accellX : {type: Number, default: 0},
  accellY : {type: Number, default: 0},
  accellZ : {type: Number, default: 0},
  friends : [{type: Schema.Types.ObjectId, ref: 'User'}]
});

userSchema.pre('remove', function(next) {
  this.model('User').remove({ person: this._id }, next);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
