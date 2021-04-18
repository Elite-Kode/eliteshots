/*
 * KodeBlox Copyright 2020 Sayak Mukhopadhyay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http: //www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const consolidate = require('consolidate')
const mongoose = require('mongoose')
const secrets = require('./secrets')
const processVars = require('./processVars')

require('./server/db')

let imageModel = require('./server/models/images')

const bugsnagClient = require('./server/bugsnag').bugsnagClient

const app = express()

let bugsnagClientMiddleware = {}

if (secrets.bugsnag_use) {
  bugsnagClientMiddleware = bugsnagClient.getPlugin('express')
  app.use(bugsnagClientMiddleware.requestHandler)
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('html', consolidate.mustache)
app.set('view engine', 'html')
app.set('views', __dirname + '/dist')
app.get('/', (req, res) => {
  res.render('index.html')
})
app.use(express.static(path.join(__dirname, 'dist')))

app.all('*', async (req, res) => {
  let url = new URL(req.url, `${processVars.protocol}://${processVars.host}`)
  let urlsPathParts = url.pathname.split('/').slice(1)
  if (urlsPathParts[0] === 'image' && mongoose.Types.ObjectId(urlsPathParts[1])) {
    let imageId = urlsPathParts[1]
    let imageObject = (await imageWithUser(imageId))[0]
    let imageUrl = `${processVars.imageUrlRoute}${imageObject.thumbnail_location}`
    let title =  imageObject.title ? imageObject.title : "&#x3164;"
    let description =  imageObject.description ? imageObject.description : "&#x3164;"
    res.render('index.html', {
      title: title,
      description: description,
      url: url,
      imageUrl: imageUrl,
      username: imageObject.cmdr_name,
      metaCards: true
    })
  } else {
    res.render('index.html')
  }
})

// error handlers
if (secrets.bugsnag_use) {
  app.use(bugsnagClientMiddleware.errorHandler)
}

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(logger('dev'))
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.send({
      message: err.message,
      error: JSON.parse(JSON.stringify(err, getCircularReplacer()))
    })
    console.log(err)
  })
}

// production error handler
// no stacktraces leaked to user
if (app.get('env') === 'production') {
  app.use(logger('combined'))
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.send({
      message: err.message,
      error: {}
    })
  })
}

let imageWithUser = (imageId) => {
  let aggregate = imageModel.aggregate()
  let query = {
    _id: mongoose.Types.ObjectId(imageId)
  }
  return aggregate.match(query).lookup({
    from: 'users',
    localField: 'user_id',
    foreignField: '_id',
    as: 'user'
  }).addFields({
    cmdr_name: {
      '$arrayElemAt': ['$user.commander', 0]
    }
  }).project({
    user: 0
  }).exec()
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

module.exports = app
