'use strict'

const co = require('co')
const bcrypt = require('bcrypt')
const Boom = require('boom')
const jwt = require('jsonwebtoken')
const secret = require('../../config.js')

module.exports = function(User) {

  function* hashPassword(password) {
    // Generate a salt at level 10 strength
    return yield bcrypt.hash(password, 10)
  }

  function createToken(user) {
    let scopes
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
    // If the user's password is correct, we can issue a token.
    // If it was incorrect, the error will bubble up from the pre method
    const token = createToken(request.pre.user)
    // If the user is saved successfully, issue a JWT
    return reply(request.pre.user).header("Authorization", token).code(201)
  }

  function* logout(request, reply) {
    reply('logged out!')
  }

  function* register(request, reply) {
    let user = new User()
    user.email = request.payload.email
    user.admin = false
    let hash = yield hashPassword(request.payload.password)

    if (!hash) {
      throw Boom.badRequest('password failed to hash!')
    }
    user.password = hash
    yield user.save()

    const token = createToken(user)
    // If the user is saved successfully, issue a JWT
    return reply(user).header("Authorization", token).code(201)
  }
}
