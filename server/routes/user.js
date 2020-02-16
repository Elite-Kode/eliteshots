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
const mongoose = require('mongoose')
const processVars = require('../../processVars')

let imageModel = require('../models/images')
let usersModel = require('../models/users')

let imageUrlRoute = processVars.imageUrlRoute

let router = express.Router()

let imagesPerFetch = 4
let ObjectId = mongoose.Types.ObjectId

let acceptedStatus = 'ACCEPTED'

router.get('/:userId', async (req, res, next) => {
  try {
    let select = 'commander trusted'
    let user = await usersModel.findById(req.params.userId).select(select).lean()
    res.send(user)
  } catch (err) {
    next(err)
  }
})

router.get('/:userId/images', async (req, res, next) => {
  try {
    let lastElement = req.query.last
    let aggregate = imageModel.aggregate()

    let query = {
      user_id: ObjectId(req.params.userId),
      moderation_status: acceptedStatus
    }

    if (lastElement) {
      query.uploaded_at = { $lt: new Date(lastElement) }
    }

    aggregate.match(query).lookup({
      from: 'views',
      localField: '_id',
      foreignField: 'image_id',
      as: 'views'
    }).lookup({
      from: 'likes',
      localField: '_id',
      foreignField: 'image_id',
      as: 'likes'
    }).lookup({
      from: 'saves',
      localField: '_id',
      foreignField: 'image_id',
      as: 'saves'
    }).addFields({
      no_of_views: {
        $size: '$views'
      },
      no_of_likes: {
        $size: '$likes'
      },
      no_of_saves: {
        $size: '$saves'
      }
    })

    if (req.user) {
      aggregate.addFields({
        self_like: {
          $size: {
            $filter: {
              input: '$likes',
              as: 'el',
              cond: {
                $eq: ['$$el.user_id', req.user._id]
              }
            }
          }
        },
        self_save: {
          $size: {
            $filter: {
              input: '$saves',
              as: 'el',
              cond: {
                $eq: ['$$el.user_id', req.user._id]
              }
            }
          }
        }
      })
    }

    aggregate.project({
      views: 0,
      likes: 0,
      saves: 0
    })

    aggregate.sort({
      uploaded_at: -1
    }).limit(imagesPerFetch)

    let imageData = await aggregate.exec()

    imageData.map(image => {
      image.image_location = `${imageUrlRoute}${image.image_location}`
      image.thumbnail_location = `${imageUrlRoute}${image.thumbnail_location}`
      image.low_res_location = `${imageUrlRoute}${image.low_res_location}`
      image.anonymous_views = image.anonymous_views ? image.anonymous_views : 0
      if (req.user) {
        image.self_like = !!image.self_like
        image.self_save = !!image.self_save
      }
    })
    res.send(imageData)
  } catch (err) {
    next(err)
  }
})

module.exports = router
