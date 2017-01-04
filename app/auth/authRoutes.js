'use strict';

const Joi = require('joi')

module.exports = function(server, authController) {
  const ctrl = authController

  server.route({
    method: 'POST',
    path: '/login',
    config: {
      auth: false,
      pre: [
        { method: (req, res) => {
          const password = req.payload.password;

          User.findOne({
            email: req.payload.email
          }, (err, user) => {
            if (!user) {
              return res(Boom.badRequest('No user with that e-mail'));
            }
            bcrypt.compare(password, user.password, (err, isValid) => {
              if (isValid) {
                return res(user);
              }
              res(Boom.badRequest('Incorrect password and e-mail!'));
            });
          });
        }}
      ],
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
      handler: ctrl.register
    }
  })
}
