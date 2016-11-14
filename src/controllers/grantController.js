"use strict";

var Hapi = require('hapi');
var _ = require('lodash');

module.exports = function grantController() {

  return {
		list: function list(request, reply) {
      reply('Hllo World!')
		},
		upload: function upload(request, reply) {
      reply('application submitted!')
		}
	}
}
