'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');
const routes = require('./src/routes');

const server = new Hapi.Server();
server.connection({ port: 4200 });

const users = {
  bill: {
    username: 'bill',
    password: '$2a$08$Hmpn8MEezP/IqQ1olzQNj.bG/2l5R6csmP87Tg1u74jNEbYCKP7Oe',   // 'secret'
    name: 'Administrator',
    id: '1'
  }
};

const validate = function (request, username, password, callback) {
  const user = users[username];
  if (!user) {
    return callback(null, false);
  }

  Bcrypt.compare(password, user.password, (err, isValid) => {
    callback(err, isValid, { id: user.id, name: user.name });
  });
};

server.register(Basic, (err) => {

  if (err) {
    throw err;
  }

  server.auth.strategy('simple', 'basic', { validateFunc: validate });
  // Add all the routes within the routes folder
  for (var route in routes) {
  	server.route(routes[route]);
  }

  server.start((err) => {

    if (err) {
      throw err;
    }

    console.log('server running at: ' + server.info.uri);
  });
});
