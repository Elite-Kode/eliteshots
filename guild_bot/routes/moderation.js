/*
 * KodeBlox Copyright 2021 Sayak Mukhopadhyay
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
const multer = require('multer')
const discord = require('discord.js')
const discordClient = require('../client')
const upload = multer()

let router = express.Router()

router.post('/new-upload', upload.single('file'), async (req, res) => {
  let configModel = require('../models/configs')
  let config = await configModel.findOne()
  let guild = await discordClient.guilds.fetch(config.guild_id)
  if (guild.available) {
    let modChannel = guild.channels.cache.get(config.mod_channel_id)
    if (modChannel.type === 'text') {
      let attachment = new discord.MessageAttachment(req.file.buffer, req.file.originalname)
      modChannel.send(attachment)
    }
  }
  res.sendStatus(200)
})

module.exports = router
