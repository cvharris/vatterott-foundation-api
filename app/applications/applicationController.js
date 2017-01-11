"use strict";

const co = require('co')
const fs = require('fs')
const path = require('path')
const root = path.dirname(require.main.filename)
const Sugar = require('sugar')
const _ = require('lodash')
const fileDir = `${root}/grantApplications`

module.exports = function grantControllerFactory(Application, log) {

  function loadFiles(files) {
    let data = []

    files.forEach((file) => {
      const fileStats = fs.statSync(path.join(fileDir, file))
      const isDirectory = fileStats.isDirectory()
      const ext = isDirectory ? null : path.extname(file)

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

  function writeFile(name, file) {
    file.hapi.filename = `${Sugar.String.titleize(name)} - ${file.hapi.filename}`
    // TODO: Detect if another file with the same name exists
    let newStream = fs.createWriteStream(`${fileDir}/${file.hapi.filename}`)

    file.on('error', (err) => {
      log.error(err)
    })

    file.pipe(newStream)

    return new Promise(resolve => {
      file.on('end', function(err) {
        log.info('ended!')
        resolve({
          filename: file.hapi.filename,
          headers: file.hapi.headers
        })
      })
    })
  }

  return {
		list: co.wrap(list),
    download: co.wrap(download),
    deleteApplication: co.wrap(deleteApplication),
    upload: co.wrap(upload)
  }

  function* list(request, reply) {
    fs.readdir(fileDir, (err, files) => {
      if (err) {
        throw err
      }

      let data = loadFiles(files)
      data = _.sortBy(data, f => f.created)

      reply(data).header("Authorization", request.auth.token)
    })
	}

	function* upload(request, reply) {
    let uploadedFiles = Object.keys(request.payload)

    if (uploadedFiles.length === 0) {
      reply('no files uploaded!')
    } else {
      let result = []
      for (let i = 0; i < uploadedFiles.length; i++) {
        let writingResult = yield writeFile(uploadedFiles[i], request.payload[uploadedFiles[i]])
        log.info(writingResult)
        result.push(writingResult)
      }
      log.info('result', {
        result: result
      })

      return reply(`${result.length} files successfully uploaded!`)
    }
	}

  function* download(request, reply) {
    reply('downloading file')
  }

  function* deleteApplication(request, reply) {
    reply(`application "${request.params.application_name}" deleted!`)
  }
}
