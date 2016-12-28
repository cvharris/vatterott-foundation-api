"use strict";

const co = require('co')
const fs = require('fs')
const path = require('path')
const root = path.dirname(require.main.filename)
const _ = require('lodash')

module.exports = function grantControllerFactory(Application, log) {

  function loadFiles(fileDir, files) {
    let data = []

    files.forEach((file) => {
      log.info(fs.statSync(path.join(fileDir, file)))
      const fileStats = fs.statSync(path.join(fileDir, file))
      const isDirectory = fileStats.isDirectory()
      const ext = isDirectory ? path.extname(file) : null

      data.push({
        name: file,
        created: fileStats.birthtime,
        ext: ext,
        isDirectory: isDirectory,
        path: path.join(fileDir, file)
      })
    })

    return data
  }

  return {
		list: co.wrap(list),
    download: co.wrap(download),
    deleteApplication: co.wrap(deleteApplication),
    upload: co.wrap(upload)
  }

  function* list(request, reply) {
    const fileDir = `${root}/grantApplications`
    fs.readdir(fileDir, (err, files) => {
      if (err) {
        throw err
      }

      let data = loadFiles(fileDir, files)
      data = _.sortBy(data, f => f.created)

      reply(data)
    })
	}

  function* download(request, reply) {
    reply('downloading file')
  }

  function* deleteApplication(request, reply) {
    reply(`application "${request.params.application_name}" deleted!`)
  }

	function* upload(request, reply) {
    reply('application submitted!')
	}
}
