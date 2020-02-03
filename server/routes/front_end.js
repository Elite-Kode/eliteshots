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

let imagesPerFetch = 4
let ObjectId = mongoose.Types.ObjectId

let bannedAccess = 'BANNED'
let normalAccess = 'NORMAL'
let modAccess = 'MOD'
let adminAccess = 'ADMIN'

let pendingStatus = 'PENDING'
let acceptedStatus = 'ACCEPTED'
let rejectedStatus = 'REJECTED'

let modActionBan = 'BAN'
let modActionUnban = 'UNBAN'
let modActionPromote = 'PROMOTE'
let modActionDemote = 'DEMOTE'
let modActionTrust = 'TRUST'
let modActionUntrust = 'UNTRUST'
let modActionAccept = 'ACCEPT'
let modActionReject = 'REJECT'
let modActionCurate = 'CURATE'

router.post('/upload', upload.single('screenshot'), async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let createdDate = new Date()
        let album
        if (!req.body.albumTitle || req.body.albumTitle.toLowerCase() === processVars.defaultAlbumTitle.toLowerCase()) {
          album = null
        } else {
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

        backblaze.authorize()

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

        let uploadedImages = (await Promise.all([
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
        ])).map(response => {
          return response.data
        })

        let moderationStatus = 'PENDING'

        if (req.user.trusted) {
          moderationStatus = 'ACCEPTED'
        }

        let imageDocument = new imageModel({
          image_location: originalFileName,
          low_res_location: lowQualityFileName,
          thumbnail_location: thumbnailFileName,
          image_fileId: uploadedImages[0].fileId,
          low_res_fileId: uploadedImages[1].fileId,
          thumbnail_fileId: uploadedImages[2].fileId,
          title: req.body.imageTitle,
          title_lower: req.body.imageTitle.toLowerCase(),
          description: req.body.imageDescription,
          description_lower: req.body.imageDescription.toLowerCase(),
          album_id: album ? album._id : undefined,
          moderation_status: moderationStatus,
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

router.get('/images/self', async (req, res, next) => {
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

router.get('/images/self/liked', async (req, res, next) => {
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

router.get('/images/self/saved', async (req, res, next) => {
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

router.get('/images/self/viewed', async (req, res, next) => {
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

router.get('/admin/images/pending', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let lastElement = req.query.last
        let aggregate = imageModel.aggregate()

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
        }).project({
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
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let lastElement = req.query.last
        let aggregate = imageModel.aggregate()

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
        }).project({
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
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let lastElement = req.query.last
        let aggregate = imageModel.aggregate()

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
        }).project({
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

router.get('/admin/images/uploaded/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let lastElement = req.query.last

        let query = { user_id: req.params.userId }

        if (lastElement) {
          query.uploaded_at = { $lt: new Date(lastElement) }
        }

        let images = await imageModel.find(query).sort({
          uploaded_at: -1
        }).limit(imagesPerFetch).lean()

        images.map(image => {
          image.image_location = `${imageUrlRoute}${image.image_location}`
          image.thumbnail_location = `${imageUrlRoute}${image.thumbnail_location}`
          image.low_res_location = `${imageUrlRoute}${image.low_res_location}`
        })
        res.send(images)
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

router.put('/images/:imageId/edit', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        await imageModel.findOneAndUpdate({
          _id: req.params.imageId,
          user_id: req.user._id
        }, {
          title: req.body.title,
          title_lower: req.body.title.toLowerCase(),
          description: req.body.description,
          description_lower: req.body.description.toLowerCase()
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

router.delete('/images/:imageId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let image = await imageModel.findByIdAndDelete(req.params.imageId).lean()

        await Promise.all([
          backblaze.deleteFileVersion({
            fileId: image.image_fileId,
            fileName: image.image_location
          }),
          backblaze.deleteFileVersion({
            fileId: image.thumbnail_fileId,
            fileName: image.thumbnail_location
          }),
          backblaze.deleteFileVersion({
            fileId: image.low_res_fileId,
            fileName: image.low_res_location
          })
        ])
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
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetImage = await imageModel.findOne({
          _id: req.params.imageId
        }).lean()
        if (req.user._id === targetImage.user_id) {
          res.status(403).send({ message: 'You cannot accept your own images' })
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await imageModel.findOneAndUpdate({
            _id: req.params.imageId,
            moderation_status: { $ne: acceptedStatus }
          }, {
            moderation_status: acceptedStatus
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
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
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetImage = await imageModel.findOne({
          _id: req.params.imageId
        }).lean()
        if (req.user._id === targetImage.user_id) {
          res.status(403).send({ message: 'You cannot reject your own images' })
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await imageModel.findOneAndUpdate({
            _id: req.params.imageId,
            moderation_status: { $ne: rejectedStatus }
          }, {
            moderation_status: rejectedStatus
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
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

router.put('/admin/images/:imageId/curate', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetImage = await imageModel.findOne({
          _id: req.params.imageId
        }).lean()
        if (req.user._id === targetImage.user_id) {
          res.status(403).send({ message: 'You cannot curate your own images' })
          return
        }
      let actionDate = new Date()
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await imageModel.findOneAndUpdate({
            _id: req.params.imageId,
            curated:  { $ne: true }
          }, {
            curated: true,
            curated_by: req.user._id,
            curated_at: actionDate
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
            action: modActionCurate,
            target_user: null,
            target_image: req.params.imageId,
            comments: req.body.comment,
            comments_lower: req.body.comment.toLowerCase(),
            action_at: actionDate,
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
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetUser = await usersModel.findOne({
          _id: req.params.userId
        }).lean()
        if (targetUser.access === bannedAccess) {
          res.status(304).send({ message: 'User already banned' })
          return
        }
        if (req.user._id === req.params.userId || targetUser.access === adminAccess || (targetUser.access === modAccess) && (req.user.access !== adminAccess)) {
          res.status(403).send({})
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModel.findOneAndUpdate({
            _id: req.params.userId
          }, {
            trusted: false,
            access: bannedAccess
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
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
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetUser = await usersModel.findOne({
          _id: req.params.userId
        }).lean()
        if (targetUser.access !== bannedAccess) {
          res.status(304).send({ message: 'User not banned' })
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModel.findOneAndUpdate({
            _id: req.params.userId
          }, {
            trusted: false,
            access: normalAccess
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
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

router.put('/admin/demote/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess) {
        let targetUser = await usersModel.findOne({
          _id: req.params.userId
        }).lean()
        if (targetUser.access !== modAccess) {
          res.status(304).send({ message: 'User cannot be demoted anymore' })
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModel.findOneAndUpdate({
            _id: req.params.userId
          }, {
            access: normalAccess
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
            action: modActionDemote,
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

router.put('/admin/promote/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === adminAccess) {
        let targetUser = await usersModel.findOne({
          _id: req.params.userId
        }).lean()
        if (targetUser.access !== normalAccess) {
          res.status(304).send({ message: 'User cannot be promoted anymore' })
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModel.findOneAndUpdate({
            _id: req.params.userId
          }, {
            access: modAccess
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
            action: modActionPromote,
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

router.put('/admin/trust/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetUser = await usersModel.findOne({
          _id: req.params.userId
        }).lean()
        if (targetUser.trusted) {
          res.status(304).send({ message: 'User is already trusted' })
          return
        }
        if (targetUser._id === req.params.userId || targetUser.access === bannedAccess || targetUser.access === adminAccess || (targetUser.access === modAccess) && (req.user.access !== adminAccess)) {
          res.status(403).send({})
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModel.findOneAndUpdate({
            _id: req.params.userId
          }, {
            trusted: true
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
            action: modActionTrust,
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

router.put('/admin/untrust/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetUser = await usersModel.findOne({
          _id: req.params.userId
        }).lean()
        if (!targetUser.trusted) {
          res.status(304).send({ message: 'User is already not trusted' })
          return
        }
        if (req.user._id === req.params.userId || targetUser.access === bannedAccess || targetUser.access === adminAccess || (targetUser.access === modAccess) && (req.user.access !== adminAccess)) {
          res.status(403).send({})
          return
        }
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await usersModel.findOneAndUpdate({
            _id: req.params.userId
          }, {
            trusted: false
          }, { session: mongoSession })
          let modActionDocument = new modActionsModel({
            action: modActionUntrust,
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

router.get('/admin/users', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let select = 'commander trusted access'
        if (req.user.access === adminAccess) {
          select = ''
        }
        let users = await usersModel.paginate({}, {
          select,
          lean: true,
          leanWithId: false,
          page: req.query.page,
          limit: 10
        })
        res.send(users)
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

router.get('/admin/users/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let select = 'commander trusted access'
        if (req.user.access === adminAccess) {
          select = ''
        }
        let user = await usersModel.findById(req.params.userId).select(select).lean()
        res.send(user)
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
