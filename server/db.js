/*
 * KodeBlox Copyright 2019 Sayak Mukhopadhyay
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

const mongoose = require('mongoose')
mongoose.Promise = global.Promise

let elite_shots_url = require('../secrets').elite_shots_db_url

class DB {
  constructor () {
    this.listeners()
    this.connect()
  }

  listeners() {
    mongoose.connection.on('connected', () => {
      console.log(`Connected to ${elite_shots_url}`)
    })

    mongoose.connection.on('error', err => {
      console.log(`Mongoose error ${err}`)
    })

    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.log(`Connection to ${elite_shots_url} closed via app termination`)
      })
      process.exit(0)
    })
  }

  async connect () {
    await mongoose.connect(elite_shots_url)

    this.retryOnDisconnect()
  }

  retryOnDisconnect () {
    let tracker = 0
    mongoose.connection.on('disconnected', () => {
      console.log(`Mongoose connection to ${elite_shots_url} disconnected`)
      if (tracker < 5) {
        console.log('Mongoose disconnected. Reconnecting in 5 seconds')
        tracker++

        setTimeout(() => {
          tracker--
        }, 60000)

        setTimeout(() => {
          this.connect()
        }, 5000)
      }
    })
  }
}

module.exports = new DB()
