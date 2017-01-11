'use strict';

const co = require('co')
const Joi = require('joi')
const Boom = require('boom')
const bcrypt = require('bcrypt')

module.exports = function(server, userController, User) {
  const ctrl = userController
  const root = 'user'

  function* verifyUniqueUser(request, reply) {
    const auth = decodeBasicAuth(request)
    console.log(auth);
    const user = yield User.findOne({email: auth.email}).exec()

    if (user) {
      if (user.email === auth.email) {
        reply(Boom.badRequest('User with that e-mail already exists!'));
        return;
      }
    }
    return reply(request.payload);
  }

  function decodeBasicAuth(request) {
    const basicString = request.headers.authorization.split(' ')
    const decoded = new Buffer(basicString[1], 'base64').toString().split(':')

    return {
      email: decoded[0],
      password: decoded[1]
    }
  }

  function* logInUser(request, reply) {
    const password = request.payload.password;

    const user = yield User.findOne({email: request.payload.email}).exec()

    if (!user) {
      return reply(Boom.badRequest('No user with that e-mail'))
    }
    const isValid = yield bcrypt.compare(password, user.password)

    if (isValid) {
      return reply(user)
    }
    return reply(Boom.badRequest('Incorrect password and e-mail!'))
  }

  server.route({
    method: 'GET',
    path: `/${root}`,
    config: {
      handler: ctrl.getCurrentUser
    }
  })

  server.route({
    method: 'POST',
    path: `/${root}/login`,
    config: {
      auth: false,
      pre: [{
        method: co.wrap(logInUser),
        assign: 'user'
      }],
      handler: ctrl.login,
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required()
        })
      }
    }
  })

  server.route({
    method: 'POST',
    path: `/${root}/logout`,
    config: {
      handler: ctrl.logout
    }
  })

  server.route({
    method: 'GET',
    path: `/${root}/new`,
    config: {
      auth: false,
      pre: [
        { method: co.wrap(verifyUniqueUser) }
      ],
      handler: ctrl.register,
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required()
        }).options({ allowUnknown: true })
      }
    }
  })
}
