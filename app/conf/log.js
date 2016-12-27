'use strict'

const winston = require('winston')

const logLevel = process.env['ENV'] === 'prod' ? 'info' : 'debug'
const transports = []

const logger = new(winston.Logger)({
  transports,
  level: logLevel
})

module.exports = logger
