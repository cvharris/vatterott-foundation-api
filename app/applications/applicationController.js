"use strict";

const co = require('co')
const fs = require('fs')
const path = require('path')
const root = path.dirname(require.main.filename)
const _ = require('lodash')

module.exports = function grantControllerFactory(Application, log) {

  return {
		list: co.wrap(list),
    findByName: co.wrap(findByName),
    deleteApplication: co.wrap(deleteApplication),
    upload: co.wrap(upload)
  }

  function* list(request, reply) {
    // let queryParams = {}
    //
    // const applications = yield Application.find()
    //
    // return reply(applications)

    const fileDir = `${root}/grantApplications`
    log.info('browsing:', {
      fileDir: fileDir
    })

    fs.readdir(fileDir, (err, files) => {
      if (err) {
        throw err
      }

      let data = []

      files.forEach((file) => {
        try {
          log.info('processing file', {
            file: file
          })

          let isDirectory = fs.statSync(path.join(fileDir, file)).isDirectory()
          if (isDirectory) {
            data.push({
              name: file,
              isDirectory: true,
              path: path.join(fileDir, file)
            })
          } else {
            let ext = path.extname(file)

            data.push({
              name: file,
              ext: ext,
              isDirectory: false,
              path: path.join(fileDir, file)
            })
          }
        } catch(e) {
          log.error(e)
        }
      })

      data = _.sortBy(data, f => f.name)

      reply(data)
    })
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
