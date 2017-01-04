'use strict';

const Joi = require('joi')
const Boom = require('boom')
const bcrypt = require('bcrypt')

module.exports = function(server, authController, User) {
  const ctrl = authController

  function verifyUniqueUser(request, reply) {
    // Find an entry from the database that
    // matches either the email or username
    User.findOne({
      email: request.payload.email
    }, (err, user) => {
      // Check whether the username or email
      // is already taken and error out if so
      if (user) {
        if (user.email === request.payload.email) {
          reply(Boom.badRequest('User with that e-mail already exists!'));
          return;
        }
      }
      // If everything checks out, send the payload through
      // to the route handler
      reply(request.payload);
    });
  }

  server.route({
    method: 'POST',
    path: '/login',
    config: {
      auth: false,
      pre: [{
        method: (request, reply) => {
          const password = request.payload.password;

          User.findOne({
            email: request.payload.email
          }, (err, user) => {
            if (!user) {
              return reply(Boom.badRequest('No user with that e-mail'));
            }
            bcrypt.compare(password, user.password, (err, isValid) => {
              if (isValid) {
                return reply(user);
              }
              reply(Boom.badRequest('Incorrect password and e-mail!'));
            })
          })
        },
        assign: 'user'
      }],
      handler: ctrl.login
    }
  })

  server.route({
    method: 'POST',
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
        { method: verifyUniqueUser }
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
