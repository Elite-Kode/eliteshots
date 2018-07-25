/*
 * KodeBlox Copyright 2018 Sayak Mukhopadhyay
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

"use strict";

module.exports = new Promise((resolve, reject) => {
    let db = require('../db');
    let connection = db.elite_shots;
    let mongoose = db.mongoose;
    let Schema = mongoose.Schema;

    let albums = new Schema({
        title: String,
        title_lower: { type: String, lowercase: true, index: true },
        description: String,
        description_lower: { type: String, lowercase: true, index: true },
        created_at: Date,
        last_modified_at: Date
    }, { runSettersOnQuery: true });

    let model = connection.model('albums', albums);

    resolve(model);
})
