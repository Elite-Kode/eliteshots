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

const express = require('express')
const multer = require('multer')
const upload = multer()

let router = express.Router()

router.post('/upload', upload.single('screenshot'), async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== 2) {
        // let model = await require('../models/images')
        let createdDate = new Date();
        if (req.body.albumTitle) {
          let albumModel = await require('../models/albums')
          let album = await albumModel.findOne({
            user_id: req.user._id,
            title_lower: req.body.albumTitle.toLowerCase()
          }).lean()
          if (!album) {
            let albumDocument = new albumModel({
              title: req.body.albumTitle,
              title_lower: req.body.albumTitle.toLowerCase(),
              description: '',
              description_lower: '',
              created_at: createdDate,
              last_modified_at: createdDate,
              user_id: req.user._id
            })
            album = await albumDocument.save()
          }
          let imageModel = await require('../models/images')
          let imageDocument = new imageModel({
            image_location: '',
            thumbnail_location: '',
            low_res_location: '',
            title: '',
            title_lower: '',
            description: '',
            description_lower: '',
            public: false,
            album_id: album._id,
            uploaded_at: createdDate,
            last_modified_at: createdDate,
            user_id: req.user._id
          })
        }
        res.status(201).send({})
      } else {
        res.status(403).send({})
      }
    } else {
      res.status(401).send({})
    }
  } catch (err) {
    next(err)
  }
})

router.get('/albums/self', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== 2) {
        let model = await require('../models/albums')
        let albums = await model.find({ user_id: req.user._id }).lean()
        res.send(albums)
      } else {
        res.status(403).send({})
      }
    } else {
      res.status(401).send({})
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
