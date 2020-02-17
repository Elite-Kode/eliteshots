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
const path = require('path')
const multer = require('multer')
const jimp = require('jimp')

const processVars = require('../../processVars')
const secrets = require('../../secrets')
const backblaze = require('../modules/backblaze')
const upload = multer()

let albumModel = require('../models/albums')
let imageModel = require('../models/images')
let likesModel = require('../models/likes')
let savesModel = require('../models/saves')
let viewsModel = require('../models/views')

let imageUrlRoute = processVars.imageUrlRoute

let router = express.Router()

let imagesPerFetch = 4
let ObjectId = mongoose.Types.ObjectId

let bannedAccess = 'BANNED'

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

        await backblaze.authorize()

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
          if (album.thumbnail_location) {
            album.thumbnail_location = `${imageUrlRoute}${album.thumbnail_location}`
          } else {
            album.thumbnail_location = `${processVars.protocol}://${processVars.host}/ed-logo.svg`
          }
        })

        query = {
          user_id: req.user._id,
          album_id: null
        }

        let imageCount = await imageModel.find(query).countDocuments().exec()

        let imageThumbnailLocation

        if (imageCount === 0) {
          imageThumbnailLocation = `${processVars.protocol}://${processVars.host}/ed-logo.svg`
        } else {
          imageThumbnailLocation = imageUrlRoute + (await imageModel.find(query).sort({
            uploaded_at: -1
          }).lean().limit(1).exec())[0].thumbnail_location
        }

        albums.push({
          title: processVars.defaultAlbumTitle,
          title_lower: processVars.defaultAlbumTitle.toLowerCase(),
          no_of_images: imageCount,
          thumbnail_location: imageThumbnailLocation
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

router.get('/album/:albumId/images', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let lastElement = req.query.last
        let aggregate = imageModel.aggregate()

        let albumId

        if (req.params.albumId === processVars.defaultAlbumTitle.toLowerCase()) {
          albumId = null
        } else {
          albumId = ObjectId(req.params.albumId)
        }

        let query = {
          album_id: albumId,
          user_id: req.user._id
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
          from: 'albums',
          localField: '_id',
          foreignField: 'album_id',
          as: 'album'
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

router.delete('/albums/:albumId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access !== bannedAccess) {
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await albumModel.findOneAndDelete({
            _id: req.params.albumId,
            user_id: req.user._id
          }, { session: mongoSession })
          await imageModel.updateMany({
            album_id: req.params.albumId,
            user_id: req.user._id
          }, {
            $unset: { album_id: 1 }
          })
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
          image.self_like = !!image.self_like
          image.self_save = !!image.self_save
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
          image.self_like = !!image.self_like
          image.self_save = !!image.self_save
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
          image.self_like = !!image.self_like
          image.self_save = !!image.self_save
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
          image.self_like = !!image.self_like
          image.self_save = !!image.self_save
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

module.exports = router
