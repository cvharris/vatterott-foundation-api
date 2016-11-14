"use strict";

const grantController = require('../controllers/grantController');

module.exports = function() {
  console.log(grantController().list);
	return [
    {
      method: 'GET',
      path: '/admin',
      config: {
        auth: 'simple',
        handler: grantController().list
      }
    },
    {
      method: 'POST',
      path: '/submit-application',
      config: {
        handler: grantController().upload
      }
    }
	];
}();
