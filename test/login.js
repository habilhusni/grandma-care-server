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

describe('USER LOGIN TESTING', () => {
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

  describe('SIGNUP /users with new users', () =>{
    it('should return new users', (done)=>{
      chai.request(server)
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
        res.body.phone.should.equal("+6280123456789");
        res.body.password.should.a("string");
        done();
      });
    });
  });

  describe('LOGIN /users with registered account', () =>{
    it('should return token', (done)=>{
      chai.request(server)
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

  describe('LOGIN /users with unregistered account', () =>{
    it('should return unauthorized', (done)=>{
      chai.request(server)
      .post('/login')
      .send({
        username: "admin",
        password: "admin"
      })
      .end((err,res)=>{
        res.should.have.status(401);
        res.body.should.be.a('string');
        res.body.should.equal("Unauthorized");
        done();
      });
    });
  });

  function generateTokenDummy(){
    return jwt.sign({username: "john", role: "admin"}, process.env.SECRET);
  }

})
