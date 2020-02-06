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
const session = require('express-session')
const mongoStore = require('connect-mongo')(session)
const request = require('request-promise-native')
const passport = require('passport')
const FrontierStrategy = require('passport-frontier').Strategy
const secrets = require('./secrets')
const processVars = require('./processVars')

const bugsnagClient = require('./server/modules/bugsnag')
const bugsnagClientMiddleware = bugsnagClient.getPlugin('express')

const authCheck = require('./server/routes/auth/auth_check')
const authFrontier = require('./server/routes/auth/frontier')
const authLogout = require('./server/routes/auth/logout')
const authUser = require('./server/routes/auth/auth_user')
const admin = require('./server/routes/admin')
const self = require('./server/routes/self')
const frontEnd = require('./server/routes/front_end')

require('./server/db')
require('./server/modules/backblaze')

const app = express()

app.use(bugsnagClientMiddleware.requestHandler)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'dist')))
app.use(session({
  name: 'EliteShots',
  secret: secrets.session_secret,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  store: new mongoStore({ mongooseConnection: require('mongoose').connection })
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth/check', authCheck)
app.use('/auth/frontier', authFrontier)
app.use('/auth/logout', authLogout)
app.use('/auth/user', authUser)
app.use('/frontend/admin', admin)
app.use('/frontend/self', self)
app.use('/frontend', frontEnd)

// Pass all 404 errors called by browser to angular
app.all('*', (req, res) => {
  console.log(`Server 404 request: ${req.originalUrl}`)
  res.status(200).sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// error handlers
app.use(bugsnagClientMiddleware.errorHandler)

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

passport.serializeUser(function (user, done) {
  done(null, user.frontier_id)
})
passport.deserializeUser(async (id, done) => {
  try {
    let model = require('./server/models/users')
    let user = await model.findOne({ frontier_id: id })
    done(null, user)
  } catch (err) {
    bugsnagClient.notify(err)
    done(err)
  }
})

let onAuthentication = async (accessToken, refreshToken, profile, done, type) => {
  let requestOptions = {
    url: 'https://companion.orerve.net/profile',
    resolveWithFullResponse: true
  }
  try {
    let response = await request.get(requestOptions).auth(null, null, true, accessToken)
    if (response.statusCode === 200) {
      let responseObject = JSON.parse(response.body)
      let commanderName = responseObject.commander.name

      let model = require('./server/models/users')
      let user = await model.findOne({ frontier_id: profile.customer_id })
      if (user) {
        let updatedUser = {
          frontier_id: profile.customer_id,
          commander: commanderName
        }
        await model.findOneAndUpdate(
          { frontier_id: profile.customer_id },
          updatedUser,
          {
            upsert: false,
            runValidators: true
          })
        done(null, user)
      } else {
        let user = {
          frontier_id: profile.customer_id,
          commander: commanderName,
          trusted: false,
          access: 'NORMAL',
          joined_at: new Date()
        }
        await model.findOneAndUpdate(
          { frontier_id: profile.customer_id },
          user,
          {
            upsert: true,
            runValidators: true
          })
        done(null, user)
      }
    } else {
      throw new Error('CAPI data not found')
    }
  } catch (err) {
    bugsnagClient.notify(err)
    done(err)
  }
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

let onAuthenticationIdentify = (accessToken, refreshToken, profile, done) => {
  onAuthentication(accessToken, refreshToken, profile, done, 'identify')
}

passport.use('frontier', new FrontierStrategy({
  clientID: secrets.client_id,
  clientSecret: secrets.client_secret,
  callbackURL: `${processVars.protocol}://${processVars.host}/auth/frontier/callback`,
  scope: ['auth', 'capi'],
  state: true
}, onAuthenticationIdentify))

module.exports = app
