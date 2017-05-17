const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../app')
const jwt = require('jsonwebtoken')
const should = chai.should()
const mongoose = require('mongoose')
const User = require('../models/user')

chai.use(chaiHttp)

describe('USER CRUD OTHER THAN LOGIN TEST', ()=> {
  let currentData, secondData, thirdData ,token

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
        thirdData = docs.ops[2]
        User.findByIdAndUpdate(docs.ops[0]._id,
          {$push: {friends: docs.ops[2]._id } },
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

    it('return array if token included', (done)=>{
      chai.request(server)
      .get('/users')
      .set('token', token)
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
    });

    it('return error if token not included', (done)=>{
      chai.request(server)
      .get('/users')
      .end((err,res)=>{
        res.should.have.status(401);
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

  describe('\n UPDATE PHONE', () =>{

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
        res.should.have.status(401)
        done()
      })
    })

    it('should return error if phone does not exist', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: '',
          phone: '',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if req.body.phone does not exist', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'test2',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if phone contain whitespace', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+6288334400120 ',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if phone length less than 10 digits', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+62883',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if phone length more than 13 digits', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+628831233315152',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if phone digits contain alphabets', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+6288312234s',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if phone digits contain special characters except +', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+62883/12234',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
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
        res.should.have.status(401)
        done()
      })
    })

    it('should return error if username does not exist', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: '',
          phone: '+6288334400120',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if req.body.username does not exist', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          phone: '+6288334400120',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if username contain whitespace', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa ',
          phone: '+6288334400120',
          email: 'something5@gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

  });

  describe('\n UPDATE EMAIL', () =>{

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
        res.should.have.status(401)
        done()
      })
    })

    it('should return error if email does not exist', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfan',
          phone: '+6288334400120',
          email: ''
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if req.body.email does not exist', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfan',
          phone: '+6288334400120'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if email contain whitespace', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+6288334400120',
          email: 'something5@gmail.com '
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if email does not contain @', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+6288334400120',
          email: 'something5gmail.com'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

    it('should return error if email does not contain .', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}`)
        .set('token', token)
        .send({
          username: 'arfa',
          phone: '+6288334400120',
          email: 'something5@gmailcom'
        }).end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

  });

  describe('\n ADD FRIEND TEST', () => {

    it('should be success if token included', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}/add/${secondData.email}`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(200)
        res.request.header.token.should.equal(token)
        done()
      })
    })

    it('should be error if token not included', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}/add/${secondData.email}`)
      .end((err,res)=> {
        res.should.have.status(401)
        done()
      })
    })

    it('should be error if friend already on the list', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}/add/${thirdData.email}`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(400)
        done()
      })
    })

    it('should be error if add self email', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}/add/${currentData.email}`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(400)
        done()
      })
    })

    it('should be error if email not found', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}/add/test@mail.com`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(400)
        done()
      })
    })

    it('should be error if no email was given', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}/add/`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(404)
        done()
      })
    })

    it('should be error if email format is invalid', (done)=> {
      chai.request(server)
      .put(`/users/${currentData._id}/add/123`)
      .set('token', token)
      .end((err,res)=> {
        res.should.have.status(400)
        done()
      })
    })

  });

  describe('\n DELETE USER TEST', () => {

    it('Should be success if token included', (done)=> {
      chai.request(server)
        .delete(`/users/${currentData._id}`)
        .set('token', token)
        .end((err,res)=> {
          res.should.have.status(200)
          done()
        })
    })

    it('should be error if token not included', (done)=> {
      chai.request(server)
        .delete(`/users/${currentData._id}`)
        .end((err,res)=> {
          res.should.have.status(401)
          done()
        })
    })

    it('should be error if user ID not found', (done)=> {
      chai.request(server)
        .delete(`/users/591be543685c931a507c0999`)
        .set('token', token)
        .end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

  });

  describe('\n UPDATE USER LOCATION TEST', () => {

    it('Should be success if token included', (done)=> {
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

    it('should be error if token not included', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}/location/1/1`)
        .end((err,res)=> {
          res.should.have.status(401)
          done()
        })
    })

    it('should be error if user ID not found', (done)=> {
      chai.request(server)
        .put(`/users/591be543685c931a507c0999/location/1/1`)
        .set('token', token)
        .end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

  });

  describe('\n UPDATE USER SENSOR TEST', () => {

    it('Should be success if token included', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}/accelero/1/1/1`)
        .set('token', token)
        .end((err,res)=> {
          res.should.have.status(200)
          console.log(res.body)
          res.body.accellZ.should.equal(1)
          res.body.accellY.should.equal(1)
          res.body.accellX.should.equal(1)
          done()
        })
    })

    it('should be error if token not included', (done)=> {
      chai.request(server)
        .put(`/users/${currentData._id}/accelero/1/1/1`)
        .end((err,res)=> {
          res.should.have.status(401)
          done()
        })
    })

    it('should be error if user ID not found', (done)=> {
      chai.request(server)
        .put(`/users/591be543685c931a507c0999/location/1/1`)
        .set('token', token)
        .end((err,res)=> {
          res.should.have.status(400)
          done()
        })
    })

  });

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
