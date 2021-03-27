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
let modActionsModel = require('../models/mod_actions')

let imageUrlRoute = processVars.imageUrlRoute

let router = express.Router()

let imagesPerFetch = 4

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

router.get('/images/pending', async (req, res, next) => {
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

router.get('/images/accepted', async (req, res, next) => {
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

router.get('/images/rejected', async (req, res, next) => {
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

router.put('/images/:imageId/accept', async (req, res, next) => {
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
        if (targetImage.moderation_status === acceptedStatus) {
          res.status(304).send({ message: 'Image already accepted' })
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
        mongoSession.endSession()
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

router.put('/images/:imageId/reject', async (req, res, next) => {
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
        if (targetImage.moderation_status === rejectedStatus) {
          res.status(304).send({ message: 'Image already rejected' })
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
        mongoSession.endSession()
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

router.put('/images/:imageId/curate', async (req, res, next) => {
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
        if (targetImage.curated) {
          res.status(304).send({ message: 'Image already curated' })
          return
        }
        let actionDate = new Date()
        let mongoSession = await mongoose.startSession()
        await mongoSession.withTransaction(async () => {
          await imageModel.findOneAndUpdate({
            _id: req.params.imageId,
            curated: { $ne: true }
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
        mongoSession.endSession()
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

router.get('/users/:userId/images', async (req, res, next) => {
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

router.get('/users', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let select = ''
        if (req.user.access === modAccess) {
          select = 'commander trusted access'
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

router.get('/users/:userId', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let select = ''
        if (req.user.access === modAccess) {
          select = 'commander trusted access'
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

router.put('/users/:userId/ban', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let targetUser = await usersModel.findOne({
          _id: req.params.userId
        }).lean()
        if (targetUser.access === bannedAccess) {
          res.status(304).send({ message: 'User already banned' })
          return
        } else if (req.user._id === req.params.userId) {
          res.status(403).send('You cannot ban yourself')
          return
        } else if (targetUser.access === adminAccess) {
          res.status(403).send('Admin cannot be banned')
          return
        } else if (targetUser.access === modAccess && req.user.access !== adminAccess) {
          res.status(403).send('Only admins can ban a mod')
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
        mongoSession.endSession()
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

router.put('/users/:userId/unban', async (req, res, next) => {
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
        if (targetUser.access === modAccess && req.user.access !== adminAccess) {
          res.status(403).send('Only admins can unban a mod')
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
        mongoSession.endSession()
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

router.put('/users/:userId/demote', async (req, res, next) => {
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
        mongoSession.endSession()
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

router.put('/users/:userId/promote', async (req, res, next) => {
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
        mongoSession.endSession()
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

router.put('/users/:userId/trust', async (req, res, next) => {
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
        if (targetUser._id === req.params.userId) {
          res.status(403).send('You cannot trust yourself')
          return
        }
        if (targetUser.access === bannedAccess) {
          res.status(403).send('You cannot trust a banned user')
          return
        }
        if (targetUser.access === adminAccess) {
          res.status(403).send('You cannot trust an admin')
          return
        }
        if (targetUser.access === modAccess && req.user.access !== adminAccess) {
          res.status(403).send('Only admins can trust a mod')
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
        mongoSession.endSession()
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

router.put('/users/:userId/untrust', async (req, res, next) => {
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
        if (req.user._id === req.params.userId) {
          res.status(403).send('You cannot untrust yourself')
          return
        }
        if (targetUser.access === bannedAccess) {
          res.status(403).send('You cannot untrust a banned user')
          return
        }
        if (targetUser.access === adminAccess) {
          res.status(403).send('You cannot untrust an admin')
          return
        }
        if (targetUser.access === modAccess && req.user.access !== adminAccess) {
          res.status(403).send('Only admins can untrust a mod')
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
        mongoSession.endSession()
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

router.get('/modActions', async (req, res, next) => {
  try {
    if (req.user) {
      if (req.user.access === modAccess || req.user.access === adminAccess) {
        let lastElement = req.query.last
        let aggregate = modActionsModel.aggregate()

        let query = {}

        if (lastElement) {
          query.action_at = { $lt: new Date(lastElement) }
        }

        aggregate.match(query).lookup({
          from: 'images',
          localField: 'target_image',
          foreignField: '_id',
          as: 'images'
        }).lookup({
          from: 'users',
          localField: 'target_user',
          foreignField: '_id',
          as: 'users'
        }).lookup({
          from: 'users',
          localField: 'mod_user_id',
          foreignField: '_id',
          as: 'mods'
        }).unwind({
          path: '$images',
          preserveNullAndEmptyArrays: true
        }).unwind({
          path: '$users',
          preserveNullAndEmptyArrays: true
        }).unwind({
          path: '$mods',
          preserveNullAndEmptyArrays: true
        })

        aggregate.sort({
          action_at: -1
        }).limit(imagesPerFetch)

        let modActionData = await aggregate.exec()

        modActionData.map(modAction => {
          if (modAction.images) {
            modAction.images.image_location = `${imageUrlRoute}${modAction.images.image_location}`
            modAction.images.thumbnail_location = `${imageUrlRoute}${modAction.images.thumbnail_location}`
            modAction.images.low_res_location = `${imageUrlRoute}${modAction.images.low_res_location}`
          }
        })
        res.send(modActionData)
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
