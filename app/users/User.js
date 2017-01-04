'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = function () {

  const schema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true }
  }, {
    collection: 'Users',
    timestamps: true
  })

  function transform(doc, ret) {
    delete ret._id
    delete ret.__v
    delete ret.password
    return ret
  }

  mongoose.model('User', schema)

  return mongoose.model('User')
}
