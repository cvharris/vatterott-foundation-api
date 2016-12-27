"use strict";

module.exports = function (server, grantController) {
  const ctrl = grantController
  const root = 'grant'

  server.route({
    method: 'GET',
    path: '/applications',
    config: {
      handler: grantController.list
    }
  })
  server.route({
    method: 'GET',
    path: '/applications/{application_name}',
    config: {
      handler: grantController.findByName
    }
  })
  server.route({
    method: 'DELETE',
    path: '/applications/{application_name}',
    config: {
      handler: grantController.deleteApplication
    }
  })
  server.route({
    method: 'POST',
    path: '/submit-application',
    config: {
      handler: grantController.upload
    }
  })
}
