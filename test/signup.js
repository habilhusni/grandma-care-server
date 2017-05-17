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

describe('User signup testing', () => {
  let token = null;
  beforeEach(function(done){
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

  describe('signup new users with a valid data', () =>{
    it('should return new users', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: "+6200000000002",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.username.should.equal("arfan");
        res.body.phone.should.equal("+6200000000002");
        res.body.email.should.equal("arfan@arfan.com");
        res.body.password.should.a("string");
        done();
      });
    });
  });

  describe('signup new users without username', () =>{
    it('should return error because username does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: " ",
        password: "arfan",
        phone: "+6200000000002",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });
  });

  describe('signup new users without password', () =>{
    it('should return error because password does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: " ",
        phone: "+6200000000002",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });
  });

  describe('signup new users without phone number', () =>{
    it('should return error because phone number does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: " ",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });
  });

  describe('signup new users without email', () =>{
    it('should return error because email does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: "+6200000000002",
        email: " "
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });
  });

});
