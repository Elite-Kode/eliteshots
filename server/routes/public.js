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
let likesModel = require('../models/likes')
let savesModel = require('../models/saves')
let viewsModel = require('../models/views')
let usersModel = require('../models/users')

let imageUrlRoute = processVars.imageUrlRoute

let router = express.Router()

let imagesPerFetch = 4
let ObjectId = mongoose.Types.ObjectId

let bannedAccess = 'BANNED'
let acceptedStatus = 'ACCEPTED'

router.get('/images/popular', async (req, res, next) => {
  try {
    let lastElement = req.query.last
    let aggregate = imageModel.aggregate()

    let query = {
      moderation_status: acceptedStatus
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
    aggregate.addFields({
      score: {
        $add: [{
          $log10: {
            $cond: {
              if: { $gt: ['$no_of_likes', 0] },
              then: '$no_of_likes',
              else: 1
            }
          }
        }, {
          $divide: [
            { $subtract: ['$uploaded_at', new Date(1551378600000)] },
            4500000
          ]
        }]
      }
    }).project({
      views: 0,
      likes: 0,
      saves: 0,
      user: 0
    })

    if (lastElement) {
      aggregate.match({
        score: { $lt: parseFloat(lastElement) }
      })
    }

    aggregate.sort({
      score: -1
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

router.get('/images/recents', async (req, res, next) => {
  try {
    let lastElement = req.query.last
    let aggregate = imageModel.aggregate()

    let query = {
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
      saves: 0,
      user: 0
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

router.get('/images/curated', async (req, res, next) => {
  try {
    let lastElement = req.query.last
    let aggregate = imageModel.aggregate()

    let query = {
      curated: true,
      moderation_status: acceptedStatus
    }

    if (lastElement) {
      query.curated_at = { $lt: new Date(lastElement) }
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
      saves: 0,
      user: 0
    })

    aggregate.sort({
      curated_at: -1
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

router.get('/images/:imageId', async (req, res, next) => {
  try {
    let aggregate = imageModel.aggregate()

    let query = {
      _id: ObjectId(req.params.imageId)
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
      },
      user_access: {
        '$arrayElemAt': ['$user.access', 0]
      },
      user_trusted: {
        '$arrayElemAt': ['$user.trusted', 0]
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
      saves: 0,
      user: 0
    })

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
    imageData = imageData[0]
    res.send(imageData)
  } catch (err) {
    next(err)
  }
})

router.put('/images/:imageId/view', async (req, res, next) => {
  try {
    let image = await imageModel.findById(req.params.imageId)
    if (image.user_id !== req.user._id) {
      if (req.user && req.user.access !== bannedAccess) {
        let viewDocument = new viewsModel({
          image_id: req.params.imageId,
          user_id: req.user._id,
          viewed_at: new Date()
        })
        await viewDocument.save()
      } else {
        await imageModel.findOneAndUpdate({
          _id: req.params.imageId
        }, {
          $inc: { anonymous_views: 1 }
        })
      }
    }
    res.status(200).send({})
  } catch (err) {
    next(err)
  }
})

router.put('/images/:imageId/like', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let liked = await likesModel.findOne({
          image_id: req.params.imageId,
          user_id: req.user._id
        }).lean()
        if (liked) {
          await likesModel.findOneAndRemove({
            image_id: req.params.imageId,
            user_id: req.user._id
          })
        } else {
          let likesDocument = new likesModel({
            image_id: req.params.imageId,
            user_id: req.user._id,
            liked_at: new Date()
          })
          await likesDocument.save()
        }
        res.status(200).send({})
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

router.put('/images/:imageId/save', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let saves = await savesModel.findOne({
          image_id: req.params.imageId,
          user_id: req.user._id
        }).lean()
        if (saves) {
          await savesModel.findOneAndRemove({
            image_id: req.params.imageId,
            user_id: req.user._id
          })
        } else {
          let savesDocument = new savesModel({
            image_id: req.params.imageId,
            user_id: req.user._id,
            saved_at: new Date()
          })
          await savesDocument.save()
        }
        res.status(200).send({})
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

router.get('/users/:userId', async (req, res, next) => {
  try {
    let select = 'commander trusted'
    let user = await usersModel.findById(req.params.userId).select(select).lean()
    res.send(user)
  } catch (err) {
    next(err)
  }
})

router.get('/users/:userId/images', async (req, res, next) => {
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
