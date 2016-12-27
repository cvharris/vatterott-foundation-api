'use strict';

const co = require('co')
const path = require('path')
const plutoPath = require('pluto-path')
const appPath = path.join(__dirname, 'app')
const app = require('./package.json')

co(function* () {
  const commandLineArgs = JSON.parse(JSON.stringify(process.argv))
  
  plutoPath({
    path: appPath,
    extraBindings: (bind) => {
      bind('commandLineArgs').toInstance(commandLineArgs)
    }
  }).then(plutoModule => {
    // TODO: add winston to logging
    console.log(`Starting ${app.name}...`)
    plutoModule.eagerlyLoadAll()
  }).catch(err => {
    console.error(err.stack)
  })
})
