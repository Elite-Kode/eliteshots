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

const mongoose = require('mongoose')

let mongoosePaginate = require('mongoose-paginate')
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

let Schema = mongoose.Schema
let ObjectId = mongoose.Schema.Types.ObjectId

let images = new Schema({
  image_location: String,
  thumbnail_location: String,
  low_res_location: String,
  title: String,
  title_lower: { type: String, lowercase: true, index: true },
  description: String,
  description_lower: { type: String, lowercase: true, index: true },
  public: { type: Boolean, index: true },
  anonymous_views: Number,
  album_id: { type: ObjectId, index: true },
  curated: { type: Boolean, index: true },
  curated_by: { type: ObjectId, index: true },
  uploaded_at: { type: Date, index: true },
  last_modified_at: Date,
  user_id: { type: ObjectId, index: true }
}, { runSettersOnQuery: true })

images.plugin(mongoosePaginate)
images.plugin(mongooseAggregatePaginate)

module.exports = new mongoose.model('images', images)
