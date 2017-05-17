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
      "username" : "admin",
      "password" : password.generate("admin"),
      "phone" : "+6200000000001",
      "email" : "admin@admin.com"
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

  describe('\n LOGIN REGISTERED ACCOUNT', () =>{
    it('should return token', (done)=>{
      chai.request(server)
      .post('/login')
      .send({
        username: "admin",
        password: "admin"
      })
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        done();
      });
    });
  });

  describe('\n LOGIN WRONG ACCOUNT', () =>{
    it('should return error if username and password is wrong', (done)=>{
      chai.request(server)
      .post('/login')
      .send({
        username: "admin2",
        password: "admin2"
      })
      .end((err,res)=>{
        res.should.have.status(401);
        done();
      });
    });

    it('should return error if username is wrong', (done)=>{
      chai.request(server)
      .post('/login')
      .send({
        username: "admin2",
        password: "admin"
      })
      .end((err,res)=>{
        res.should.have.status(401);
        done();
      });
    });

    it('should return error if password is wrong', (done)=>{
      chai.request(server)
      .post('/login')
      .send({
        username: "admin",
        password: "admin2"
      })
      .end((err,res)=>{
        res.should.have.status(401);
        done();
      });
    });
  });

  function generateTokenDummy(){
    return jwt.sign({username: "admin"}, process.env.SECRET);
  }

});
