"use strict";

const co = require('co')

module.exports = function grantControllerFactory(Application, log) {

  return {
		list: co.wrap(list),
    findByName: co.wrap(findByName),
    deleteApplication: co.wrap(deleteApplication),
    upload: co.wrap(upload)
  }

  function* list(request, reply) {
    let queryParams = {}

    const applications = yield Application.find()

    return reply(applications)
	}

  function* findByName(request, reply) {
    reply('hello world')
  }

  function* deleteApplication(request, reply) {
    reply(`application "${request.params.application_name}" deleted!`)
  }

	function* upload(request, reply) {
    reply('application submitted!')
	}
}
