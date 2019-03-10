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
const path = require('path')
const multer = require('multer')
const jimp = require('jimp')

const backblaze = require('../modules/backblaze')
const secrets = require('../../secrets')
const upload = multer()

let router = express.Router()

router.post('/upload', upload.single('screenshot'), async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== 2) {
        let createdDate = new Date()
        let album
        if (req.body.albumTitle) {
          let albumModel = await require('../models/albums')
          album = await albumModel.findOne({
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
        }

        let originalImage = await jimp.read(req.file.buffer)

        let imageResize = await Promise.all([
          originalImage.scaleToFit(1920, 1080).quality(50).getBufferAsync(jimp.MIME_JPEG),
          originalImage.scaleToFit(480, 320).quality(50).getBufferAsync(jimp.MIME_JPEG)
        ])

        let lowQualityImage = imageResize[0]
        let thumbnailImage = imageResize[1]

        let urlParams = (await Promise.all([
          backblaze.getUploadUrl(secrets.b2_bucket_id),
          backblaze.getUploadUrl(secrets.b2_bucket_id),
          backblaze.getUploadUrl(secrets.b2_bucket_id)
        ])).map(response => {
          return response.data
        })

        let fileExtension = path.extname(req.file.originalname)
        let fileName = path.basename(req.file.originalname, fileExtension)

        let originalFileName = `${req.user._id}/${createdDate.getTime()}-${req.file.originalname}`
        let lowQualityFileName = `${req.user._id}/${createdDate.getTime()}-${fileName}_lq.jpeg`
        let thumbnailFileName = `${req.user._id}/${createdDate.getTime()}-${fileName}_thumb.jpeg`

        await Promise.all([
          backblaze.uploadFile({
            uploadUrl: urlParams[0].uploadUrl,
            uploadAuthToken: urlParams[0].authorizationToken,
            fileName: originalFileName,
            data: req.file.buffer,
            mime: req.file.mimetype
          }),
          backblaze.uploadFile({
            uploadUrl: urlParams[1].uploadUrl,
            uploadAuthToken: urlParams[1].authorizationToken,
            fileName: lowQualityFileName,
            data: lowQualityImage,
            mime: jimp.MIME_JPEG
          }),
          backblaze.uploadFile({
            uploadUrl: urlParams[2].uploadUrl,
            uploadAuthToken: urlParams[2].authorizationToken,
            fileName: thumbnailFileName,
            data: thumbnailImage,
            mime: jimp.MIME_JPEG
          })
        ])

        let imageModel = await require('../models/images')
        let imageDocument = new imageModel({
          image_location: originalFileName,
          thumbnail_location: thumbnailFileName,
          low_res_location: lowQualityFileName,
          title: req.body.imageTitle,
          title_lower: req.body.imageTitle.toLowerCase(),
          description: req.body.imageDescription,
          description_lower: req.body.imageDescription.toLowerCase(),
          public: req.body.isPublic === 'true',
          album_id: album ? album._id : undefined,
          uploaded_at: createdDate,
          last_modified_at: createdDate,
          user_id: req.user._id
        })
        await imageDocument.save()
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
