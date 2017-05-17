const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')
const jwt = require('jsonwebtoken')
const should = chai.should()
const mongoose = require('mongoose')
const User = require('../models/user')

chai.use(chaiHttp)

describe('USER CRUD OTHER THAN LOGIN TEST', ()=> {
  let currentData, secondData, token

  function generateTokenDummy(){
    return jwt.sign({username: "john", role: "admin"}, process.env.SECRET);
  }

  beforeEach((done)=> {
    let users = [
      new User({
        username: 'test1',
        password: '12345',
        phone: '+6288334400107',
        email: 'something@gmail.com',
        latitude	: 0,
  			longitude : 0
      }),
      new User({
        username: 'test1friend',
        password: '12345',
        phone: '+6288334400108',
        email: 'something1@gmail.com',
        latitude	: 0,
  			longitude : 0
      }),
      new User({
        username: 'test2friend',
        password: '12345',
        phone: '+6288334400109',
        email: 'something2@gmail.com',
        latitude	: 0,
  			longitude : 0
      })
    ]

    token = generateTokenDummy()

    User.collection.insert(users, (err,docs)=> {
      if(err){
        console.log(err)
      } else {
        currentData = docs.ops[0]
        secondData = docs.ops[1]
        User.findByIdAndUpdate(docs.ops[0]._id,
          {$push: {friends: {$each: [docs.ops[1]._id,docs.ops[2]._id]} } },
          {new: true, safe: true, upsert: true},
          (err,user)=> {
            done()
        })
      }
    })
  })

  afterEach((done)=> {
    User.collection.remove({})
    currentData = undefined
    done()
  })

  it('Register 1 user into database', (done)=> {
    chai.request(server)
      .post('/signup')
      .send({
        username: 'test2',
        password: '54321',
        phone: '+6288443300227',
        email: 'something3@gmail.com'
      }).end((err,res)=> {
        res.should.have.status(200)
        res.body.should.have.property('username')
        res.body.should.have.property('password')
        res.body.should.have.property('phone')
        res.body.username.should.equal('test2')
        res.body.password.should.be.a('string')
        res.body.phone.should.be.a('string')
        done()
      })
  })

  describe('\n READ USERS FROM DATABASE', () =>{

    it('must have token', (done)=>{
      chai.request(server)
      .get('/users')
      .set('token', token)
      .end((err,res)=>{
        res.should.have.status(200);
        res.request.header.should.have.property('token');
        done();
      });
    });

    it('must be an array', (done)=>{
      chai.request(server)
      .get('/users')
      .set('token', token)
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('array')
        res.body.should.have.lengthOf(3)
        done();
      });
    });

  });

  describe('\n FIND 1 USER FROM DATABASE', () =>{

    it('must have token', (done)=> {
      chai.request(server)
        .get(`/users/${currentData._id}`)
        .set('token', token)
        .end((err,res)=> {
          res.should.have.status(200)
          res.request.header.token.should.equal(token)
          done()
        })
    })

    it('should be an object', (done)=> {
      chai.request(server)
        .get(`/users/${currentData._id}`)
        .set('token', token)
        .end((err,res)=> {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('username')
          res.body.should.have.property('password')
          res.body.should.have.property('phone')
          res.body.should.have.property('friends')
          done()
        })
    })

  });

  describe('\n UPDATE USERNAME', () =>{

    it('should be success if token included', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}`)
      .set('token', token)
      .send({
        username: 'test3',
        phone: '+6288334400120',
        email: 'something5@gmail.com'
      })
      .end((err,res)=> {
        res.should.have.status(200)
        res.request.header.token.should.equal(token)
        done()
      })
    })

    it('should be error if token not included', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}`)
      .send({
        username: 'test3',
        phone: '+6288334400120',
        email: 'something5@gmail.com'
      })
      .end((err,res)=> {
        res.should.have.status(400)
        done()
      })
    })

    it('should return error if username does not exist', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .send({
          username: '',
          phone: '+6288334400120',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

  });



  it('Update username and phone on test1', (done)=> {
    chai.request(server)
      .put(`/users/${currentData._id}`)
      .set('token', token)
      .send({
        username: 'test3',
        phone: '+6288334400120',
        email: 'something5@gmail.com'
      }).end((err,res)=> {
        res.should.have.status(200)
        done()
      })
  })

  it('Delete user from database', (done)=> {
    chai.request(server)
      .delete(`/users/${currentData._id}`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(200)
        done()
      })
  })

  it('Update user location', (done)=> {
    chai.request(server)
      .put(`/users/${currentData._id}/location/1/1`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(200)
        res.body.latitude.should.equal(1)
        res.body.longitude.should.equal(1)
        done()
      })
  })

  it('Add friend from created new user in database', (done)=> {
    chai.request(server)
      .post('/signup')
      .set('token', token)
      .send({
        username: 'test2',
        password: '54321',
        phone: '+6288443300227',
        email: 'something6@gmail.com'
      }).end((err,res)=> {
        chai.request(server)
          .put(`/users/${currentData._id}/add/${res.body.email}`)
          .set('token', token)
          .end((err,res)=> {
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.friends.should.be.a('array')
            res.body.friends.should.have.lengthOf(3)
            done()
          })
      })
  })

  it('Remove friend in database', (done)=> {
    chai.request(server)
      .delete(`/users/${currentData._id}/remove/${secondData._id}`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(200)
        res.body.friends.should.have.lengthOf(0)
        done()
      })
  })

})
