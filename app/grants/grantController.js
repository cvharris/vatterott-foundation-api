"use strict";

var Hapi = require('hapi');
var _ = require('lodash');

module.exports = function grantControllerFactory() {

  return {
		list: function list(request, reply) {
      reply('Hllo World!')
		},
    findByName: function findByName(request, reply) {
      reply('hello world')
    },
    deleteApplication: function deleteApplication(request, reply) {
      reply(`application "${request.params.application_name}" deleted!`)
    },
		upload: function upload(request, reply) {
      reply('application submitted!')
		}
	}
}
