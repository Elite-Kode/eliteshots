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
const mongoose = require('mongoose')
const multer = require('multer')
const jimp = require('jimp')

const backblaze = require('../modules/backblaze')
const secrets = require('../../secrets')
const processVars = require('../../processVars')
const upload = multer()

let albumModel = require('../models/albums')
let imageModel = require('../models/images')
let likesModel = require('../models/likes')
let savesModel = require('../models/saves')
let viewsModel = require('../models/views')
let usersModel = require('../models/users')
let modActionsModel = require('../models/mod_actions')

let imageUrlRoute = 'https://cdn.eliteshots.gallery/file/eliteshots/'

let router = express.Router()

let imagesPerfetch = 4
let ObjectId = mongoose.Types.ObjectId

let bannedAccess = 'BANNED'
let normalAccess = 'NORMAL'
let adminAccess = 'ADMIN'
let superAdminAccess = 'SUPERADMIN'

let pendingStatus = 'PENDING'
let acceptedStatus = 'ACCEPTED'
let rejectedStatus = 'REJECTED'

let modActionBan = 'BAN'
let modActionUnban = 'UNBAN'
let modActionAccept = 'ACCEPT'
let modActionReject = 'REJECT'

router.post('/upload', upload.single('screenshot'), async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let createdDate = new Date()
        let album
        if (!req.body.albumTitle || req.body.albumTitle.toLowerCase() === processVars.defaultAlbumTitle.toLowerCase()) {
          album = null
        } else {
          let albumModelResolved = await albumModel
          album = await albumModelResolved.findOne({
            user_id: req.user._id,
            title_lower: req.body.albumTitle.toLowerCase()
          }).lean()
          if (!album) {
            let albumDocument = new albumModelResolved({
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
            mime: req.file.mimetype,
            onUploadProgress: event => {
              console.log(event)
            }
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

        let imageModelResolved = await imageModel
        let imageDocument = new imageModelResolved({
          image_location: originalFileName,
          thumbnail_location: thumbnailFileName,
          low_res_location: lowQualityFileName,
          title: req.body.imageTitle,
          title_lower: req.body.imageTitle.toLowerCase(),
          description: req.body.imageDescription,
          description_lower: req.body.imageDescription.toLowerCase(),
          public: req.body.isPublic === 'true',
          album_id: album ? album._id : undefined,
          moderation_status: 'PENDING',
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
      if (req.user.access !== bannedAccess) {
        let model = await albumModel
        let aggregate = model.aggregate()
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

        model = await imageModel
        query = {
          user_id: req.user._id,
          album_id: null
        }

        let imageCount = await model.find(query).countDocuments().exec()

        let imageThumbnailLocation = (await model.find(query).sort({
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

router.get('/images/self', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let model = await imageModel
        let lastElement = req.query.last
        let aggregate = model.aggregate()

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
        }).limit(imagesPerfetch)

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

router.get('/images/self/liked', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let model = await likesModel
        let lastElement = req.query.last
        let aggregate = model.aggregate()

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
          saves: 0
        })

        aggregate.sort({
          liked_at: -1
        }).limit(imagesPerfetch)

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

router.get('/images/self/saved', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let model = await savesModel
        let lastElement = req.query.last
        let aggregate = model.aggregate()

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
          saves: 0
        })

        aggregate.sort({
          saved_at: -1
        }).limit(imagesPerfetch)

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

router.get('/images/popular', async (req, res, next) => {
  try {
    let model = await imageModel
    let lastElement = req.query.last
    let aggregate = model.aggregate()

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
      saves: 0
    })

    if (lastElement) {
      aggregate.match({
        score: { $lt: parseFloat(lastElement) }
      })
    }

    aggregate.sort({
      score: -1
    }).limit(imagesPerfetch)

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
    let model = await imageModel
    let lastElement = req.query.last
    let aggregate = model.aggregate()

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
      saves: 0
    })

    aggregate.sort({
      uploaded_at: -1
    }).limit(imagesPerfetch)

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
    let model = await imageModel
    let lastElement = req.query.last
    let aggregate = model.aggregate()

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
      saves: 0
    })

    aggregate.sort({
      curated_at: -1
    }).limit(imagesPerfetch)

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
    let model = await imageModel
    let aggregate = model.aggregate()

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

router.get('/admin/images/pending', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess || req.user.access === superAdminAccess) {
        let model = await imageModel
        let lastElement = req.query.last
        let aggregate = model.aggregate()

        let query = { moderation_status: pendingStatus }

        if (lastElement) {
          query.uploaded_at = { $lt: new Date(lastElement) }
        }

        aggregate.match(query).lookup({
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }).addFields({
          cmdr_name: {
            '$arrayElemAt': ['$user.commander', 0]
          }
        })

        aggregate.sort({
          uploaded_at: -1
        }).limit(imagesPerfetch)

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

router.get('/admin/images/accepted', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess || req.user.access === superAdminAccess) {
        let model = await imageModel
        let lastElement = req.query.last
        let aggregate = model.aggregate()

        let query = { moderation_status: acceptedStatus }

        if (lastElement) {
          query.uploaded_at = { $lt: new Date(lastElement) }
        }

        aggregate.match(query).lookup({
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }).addFields({
          cmdr_name: {
            '$arrayElemAt': ['$user.commander', 0]
          }
        })

        aggregate.sort({
          uploaded_at: -1
        }).limit(imagesPerfetch)

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

router.get('/admin/images/rejected', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess || req.user.access === superAdminAccess) {
        let model = await imageModel
        let lastElement = req.query.last
        let aggregate = model.aggregate()

        let query = { moderation_status: rejectedStatus }

        if (lastElement) {
          query.uploaded_at = { $lt: new Date(lastElement) }
        }

        aggregate.match(query).lookup({
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }).addFields({
          cmdr_name: {
            '$arrayElemAt': ['$user.commander', 0]
          }
        })

        aggregate.sort({
          uploaded_at: -1
        }).limit(imagesPerfetch)

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

router.put('/images/:imageId/view', async (req, res, next) => {
  try {
    if (req.user && req.user.access !== bannedAccess) {
      let model = await viewsModel
      let viewDocument = new model({
        image_id: req.params.imageId,
        user_id: req.user._id,
        viewed_at: new Date()
      })
      await viewDocument.save()
    } else {
      let model = await imageModel
      await model.findOneAndUpdate({
        _id: req.params.imageId
      }, {
        $inc: { anonymous_views: 1 }
      })
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
        let model = await likesModel
        let liked = await model.findOne({
          image_id: req.params.imageId,
          user_id: req.user._id
        }).lean()
        if (liked) {
          await model.findOneAndRemove({
            image_id: req.params.imageId,
            user_id: req.user._id
          })
        } else {
          let likesDocument = new model({
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
        let model = await savesModel
        let saves = await model.findOne({
          image_id: req.params.imageId,
          user_id: req.user._id
        }).lean()
        if (saves) {
          await model.findOneAndRemove({
            image_id: req.params.imageId,
            user_id: req.user._id
          })
        } else {
          let savesDocument = new model({
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

router.put('/admin/images/:imageId/accept', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess || req.user.access === superAdminAccess) {
        let imageModelResolved = await imageModel
        let modActionsModelResolved = await modActionsModel
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await imageModelResolved.findOneAndUpdate({
            _id: req.params.imageId,
            moderation_status: { $ne: acceptedStatus }
          }, {
            moderation_status: acceptedStatus
          }, { session: mongoSession })
          let modActionDocument = new modActionsModelResolved({
            action: modActionAccept,
            target_user: null,
            target_image: req.params.imageId,
            comments: req.body.comment,
            comments_lower: req.body.comment.toLowerCase(),
            action_at: new Date(),
            mod_user_id: req.user._id
          })
          return modActionDocument.save()
        })
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

router.put('/admin/images/:imageId/reject', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess || req.user.access === superAdminAccess) {
        let imageModelResolved = await imageModel
        let modActionsModelResolved = await modActionsModel
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await imageModelResolved.findOneAndUpdate({
            _id: req.params.imageId,
            moderation_status: { $ne: rejectedStatus }
          }, {
            moderation_status: rejectedStatus
          }, { session: mongoSession })
          let modActionDocument = new modActionsModelResolved({
            action: modActionReject,
            target_user: null,
            target_image: req.params.imageId,
            comments: req.body.comment,
            comments_lower: req.body.comment.toLowerCase(),
            action_at: new Date(),
            mod_user_id: req.user._id
          })
          return modActionDocument.save()
        })
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

router.put('/admin/ban/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess || req.user.access === superAdminAccess) {
        let usersModelResolved = await usersModel
        let modActionsModelResolved = await modActionsModel
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModelResolved.findOneAndUpdate({
            _id: req.params.userId
          }, {
            trusted: false,
            access: bannedAccess
          }, { session: mongoSession })
          let modActionDocument = new modActionsModelResolved({
            action: modActionBan,
            target_user: req.params.userId,
            target_image: null,
            comments: req.body.comment,
            comments_lower: req.body.comment.toLowerCase(),
            action_at: new Date(),
            mod_user_id: req.user._id
          })
          return modActionDocument.save()
        })
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

router.put('/admin/unban/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess || req.user.access === superAdminAccess) {
        let usersModelResolved = await usersModel
        let modActionsModelResolved = await modActionsModel
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModelResolved.findOneAndUpdate({
            _id: req.params.userId
          }, {
            trusted: false,
            access: normalAccess
          }, { session: mongoSession })
          let modActionDocument = new modActionsModelResolved({
            action: modActionUnban,
            target_user: req.params.userId,
            target_image: null,
            comments: req.body.comment,
            comments_lower: req.body.comment.toLowerCase(),
            action_at: new Date(),
            mod_user_id: req.user._id
          })
          return modActionDocument.save()
        })
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

module.exports = router
