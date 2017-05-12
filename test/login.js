const jwt       = require('jsonwebtoken');
const chai      = require('chai');
const chaiHttp  = require('chai-http');
const password 	= require('password-hash');

const User      = require('../models/user');
const server    = require('../app');
require('dotenv').config();

const should    = chai.should();
const expect    = chai.expect;

chai.use(chaiHttp);

describe('Login Testing', () => {
  let token = null;
  beforeEach(function(done){
    //token dummy for testing
    token = generateTokenDummy();

    let newUser = new User({
      "username"  : "john",
      "password"  : password.generate("12345"),
      "phone"     : "+621234567890"
    });
    newUser.save(function(err, user){
      done()
    });
  });

  afterEach(function(done){
    User.collection.remove({}, (err)=>{
      done();
    });
  });

  describe('SIGNUP /users', () =>{
    it('should return new users', (done)=>{
      chai.request('http://localhost:3000')
      .post('/signup')
      .send({
        username: "arfanizar",
        password: "12345",
        phone: "+6280123456789"
      })
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.username.should.equal("arfanizar");
        res.body.password.should.a("string");
        res.body.phone.should.equal("+6280123456789");
        done();
      });
    });
  });

  describe('LOGIN /users', () =>{
    it('should return token', (done)=>{
      chai.request('http://localhost:3000')
      .post('/login')
      .send({
        username: "john",
        password: "12345"
      })
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        done();
      });
    });
  });

  function generateTokenDummy(){
    return jwt.sign({username: "john", role: "admin"}, process.env.SECRETKEYS);
  }

})
