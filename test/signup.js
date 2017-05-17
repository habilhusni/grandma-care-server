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

describe('USER SIGNUP TESTING', () => {
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

  describe('\n SIGNUP NEW USER WITH A VALID DATA', () =>{
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

  describe('\n SIGNUP NEW USER WITHOUT USERNAME', () =>{
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

    it('should return error because req.body.username does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
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

  describe('\n SIGNUP NEW USER WITHOUT PASSWORD', () =>{
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

    it('should return error because req.body.password does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        phone: "+6200000000002",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(500);
        done();
      });
    });
  });

  describe('\n SIGNUP NEW USER WITHOUT PHONE NUMBER', () =>{
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

    it('should return error because req.body.phone does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });

    it('should return error because phone number format is wrong (number too long)', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: "+62012345678901",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });

    it('should return error because phone number format is wrong (number too short)', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: "+62012345",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });

    it('should return error because phone number format is wrong (number contain alphabet)', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: "+620123456ab901",
        email: "arfan@arfan.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });
  });

  describe('\n SIGNUP NEW USER WITHOUT EMAIL', () =>{
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

    it('should return error because req.body.email does not exist', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: "+6200000000002",
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });

    it('should return error because email format is wrong', (done)=>{
      chai.request(server)
      .post('/signup')
      .send({
        username: "arfan",
        password: "arfan",
        phone: "+6200000000002",
        email: "arfanmail.com"
      })
      .end((err,res)=>{
        res.should.have.status(400);
        done();
      });
    });
  });

});
