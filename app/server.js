'use strict'

const co = require('co')
const good = require('good')

// Log ops info very rarely when running locally. Time is in milliseconds.
const monitoringInterval = process.env['ENV'] === 'prod' ? 60 * 1000 : 60 * 60 * 1000

module.exports = function (log) {

  const users = {
    bill: {
      username: 'bill',
      password: 'CFVatterott1014',   // 'secret'
      name: 'Administrator',
      id: '1'
    }
  };

  const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
      return callback(null, false);
    }

    const isValid = password === user.password
    callback(null, isValid, { id: user.id, name: user.name });
  };

  const Hapi = require('hapi');
  const server = new Hapi.Server();

  server.connection({
    port: 4200,
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    },
    routes: {
      cors: {
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        credentials: true
      }
    }
  })

  server.register(require('hapi-auth-basic'), (err) => {
    server.auth.strategy('simple', 'basic', { validateFunc: validate })
    server.auth.default('simple')
  })

  co.wrap(function* () {
    yield server.register([
      require('inert'),
      require('vision'), {
        register: good,
        options: {
          ops: {
            interval: monitoringInterval
          },
          reporters: {
            winston: [{
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{
                error: '*',
                log: '*',
                ops: '*'
              }]
            }]
          }
        }
      }
    ])

    yield server.start()
    log.info('Server started:', {
      uri: server.info.uri
    })
  })()

  return server
}
