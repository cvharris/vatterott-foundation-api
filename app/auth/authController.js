'use strict'

const co = require('co')
const bcrypt = require('bcrypt-nodejs')
const Boom = require('boom')
const jwt = require('jsonwebtoken')
const secret = require('../../config.js')

module.exports = function(User) {

  function hashPassword(password, cb) {
    // Generate a salt at level 10 strength
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        return cb(err, hash);
      });
    });
  }

  function createToken(user) {
    let scopes
    // Check if the user object passed in
    // has admin set to true, and if so, set
    // scopes to admin
    if (user.admin) {
      scopes = 'admin'
    }
    // Sign the JWT
    return jwt.sign({
      id: user._id,
      email: user.email,
      scope: scopes
    }, secret, {
      algorithm: 'HS256',
      expiresIn: "1h"
    })
  }

  return {
    login: co.wrap(login),
    logout: co.wrap(logout),
    register: co.wrap(register)
  }

  function* login(request, reply) {
    reply('logged in!')
  }

  function* logout(request, reply) {
    reply('logged out!')
  }

  function* register(request, reply) {
    let user = new User()
    user.email = request.payload.email
    user.admin = false
    hashPassword(request.payload.password, (err, hash) => {
      if (err) {
        throw Boom.badRequest(err)
      }
      user.password = hash
      user.save((err, user) => {
        if (err) {
          throw Boom.badRequest(err)
        }
        const token = createToken(user)
        // If the user is saved successfully, issue a JWT
        res(user).header({
          "Authorization": token
        }).code(201)
      });
    });
    reply('user registered!')
  }
}
