'use strict'

const co = require('co')
const good = require('good')
const Boom = require('boom')
const secret = require('../config.js')

// Log ops info very rarely when running locally. Time is in milliseconds.
const monitoringInterval = process.env['ENV'] === 'prod' ? 60 * 1000 : 60 * 60 * 1000

module.exports = function (log, User) {

  // bring your own validation function
  const validate = function* (decoded, request, callback) {
    // do your checks to see if the person is valid
    if (!decoded.id) {
      return callback(null, false)
    }
    else {
      const user = yield User.findOne({_id: decoded.id}).exec()
      if (!user) {
        return callback(null, false)
      } else if (user && !user.loggedIn) {
        return callback(Boom.unauthorized('Token expired'), false)
      }
      return callback(null, true)
    }
  };

  const Hapi = require('hapi');
  const server = new Hapi.Server();

  server.connection({
    port: 3002,
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    },
    routes: {
      cors: {
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'enctype'],
        credentials: true
      }
    }
  })

  co.wrap(function* () {
    yield server.register([
      require('inert'),
      require('hapi-auth-jwt2'),
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

    server.auth.strategy('jwt', 'jwt', true, {
      key: secret,
      validateFunc: co.wrap(validate),
      verifyOptions: {
        algorithms: [ 'HS256' ]
      }
    });

    yield server.start()
    log.info('Server started:', {
      uri: server.info.uri
    })
    // Log table of routes
    /*
    const table = server.table()
    table[0].table.forEach(route => {
      console.log(route.method, route.path, route.fingerprint);
    })
    */
  })()

  return server
}
