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
const processVars = require('../../processVars')

let albumModel = require('../models/albums')
let imageModel = require('../models/images')
let likesModel = require('../models/likes')
let savesModel = require('../models/saves')
let viewsModel = require('../models/views')

let imageUrlRoute = 'https://cdn.eliteshots.gallery/file/eliteshots/'

let router = express.Router()

let imagesPerFetch = 4

let bannedAccess = 'BANNED'

router.get('/albums', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let aggregate = albumModel.aggregate()
        let query = { user_id: req.user._id }

        aggregate.match(query).lookup({
          from: 'images',
          localField: '_id',
          foreignField: 'album_id',
          as: 'images'
        }).addFields({
          no_of_images: {
            $size: '$images'
          },
          first_image: {
            $arrayElemAt: ['$images', 0]
          }
        }).addFields({
          thumbnail_location: '$first_image.thumbnail_location'
        }).project({
          images: 0,
          first_image: 0
        })
        let albums = await aggregate.exec()

        albums.map(album => {
          album.thumbnail_location = `${imageUrlRoute}${album.thumbnail_location}`
        })

        query = {
          user_id: req.user._id,
          album_id: null
        }

        let imageCount = await imageModel.find(query).countDocuments().exec()

        let imageThumbnailLocation = (await imageModel.find(query).sort({
          uploaded_at: -1
        }).lean().limit(1).exec())[0].thumbnail_location

        albums.push({
          title: processVars.defaultAlbumTitle,
          title_lower: processVars.defaultAlbumTitle.toLowerCase(),
          no_of_images: imageCount,
          thumbnail_location: `${imageUrlRoute}${imageThumbnailLocation}`
        })
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

router.get('/images', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let lastElement = req.query.last
        let aggregate = imageModel.aggregate()

        let query = { user_id: req.user._id }

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
        }).project({
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

router.get('/images/liked', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let lastElement = req.query.last
        let aggregate = likesModel.aggregate()

        let query = { user_id: req.user._id }

        if (lastElement) {
          query.liked_at = { $lt: new Date(lastElement) }
        }

        aggregate.match(query).lookup({
          from: 'images',
          localField: 'image_id',
          foreignField: '_id',
          as: 'images'
        }).unwind('$images')
          .addFields({
            'images.liked_at': '$liked_at'
          })
          .replaceRoot('$images')
          .lookup({
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
        }).lookup({
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }).addFields({
          no_of_views: {
            $size: '$views'
          },
          no_of_likes: {
            $size: '$likes'
          },
          no_of_saves: {
            $size: '$saves'
          },
          cmdr_name: {
            '$arrayElemAt': ['$user.commander', 0]
          }
        })

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
        }).project({
          views: 0,
          likes: 0,
          saves: 0,
          user: 0
        })

        aggregate.sort({
          liked_at: -1
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

router.get('/images/saved', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let lastElement = req.query.last
        let aggregate = savesModel.aggregate()

        let query = { user_id: req.user._id }

        if (lastElement) {
          query.uploaded_at = { $lt: new Date(lastElement) }
        }

        aggregate.match(query).lookup({
          from: 'images',
          localField: 'image_id',
          foreignField: '_id',
          as: 'images'
        }).unwind('$images')
          .addFields({
            'images.saved_at': '$saved_at'
          })
          .replaceRoot('$images')
          .lookup({
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
        }).lookup({
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }).addFields({
          no_of_views: {
            $size: '$views'
          },
          no_of_likes: {
            $size: '$likes'
          },
          no_of_saves: {
            $size: '$saves'
          },
          cmdr_name: {
            '$arrayElemAt': ['$user.commander', 0]
          }
        })

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
        }).project({
          views: 0,
          likes: 0,
          saves: 0,
          user: 0
        })

        aggregate.sort({
          saved_at: -1
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

router.get('/images/viewed', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let lastElement = req.query.last
        let aggregate = viewsModel.aggregate()

        let query = { user_id: req.user._id }

        if (lastElement) {
          query.viewed_at = { $lt: new Date(lastElement) }
        }

        aggregate.match(query).lookup({
          from: 'images',
          localField: 'image_id',
          foreignField: '_id',
          as: 'images'
        }).unwind('$images')
          .addFields({
            'images.viewed_at': '$viewed_at'
          })
          .replaceRoot('$images')
          .lookup({
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
        }).lookup({
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }).addFields({
          no_of_views: {
            $size: '$views'
          },
          no_of_likes: {
            $size: '$likes'
          },
          no_of_saves: {
            $size: '$saves'
          },
          cmdr_name: {
            '$arrayElemAt': ['$user.commander', 0]
          }
        })

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
        }).project({
          views: 0,
          likes: 0,
          saves: 0,
          user: 0
        })

        aggregate.sort({
          viewed_at: -1
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
