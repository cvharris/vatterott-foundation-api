'use strict';

const co = require('co')
const Joi = require('joi')
const Boom = require('boom')
const bcrypt = require('bcrypt')

module.exports = function(server, authController, User) {
  const ctrl = authController

  function* verifyUniqueUser(request, reply) {
    const user = yield User.findOne({email: request.payload.email}).exec()

    if (user) {
      if (user.email === request.payload.email) {
        reply(Boom.badRequest('User with that e-mail already exists!'));
        return;
      }
    }
    return reply(request.payload);
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
    method: 'POST',
    path: '/login',
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
    method: 'GET',
    path: '/logout',
    config: {
      handler: ctrl.logout
    }
  })

  server.route({
    method: 'POST',
    path: '/register',
    config: {
      auth: false,
      pre: [
        { method: co.wrap(verifyUniqueUser) }
      ],
      handler: ctrl.register,
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required()
        })
      }
    }
  })
}
