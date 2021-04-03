let host = ''
let protocol = ''
let imageUrlRoute = ''
if (process.env.NODE_ENV === 'development') {
  host = 'localhost:3020'
  protocol = 'http'
  imageUrlRoute = 'https://cdn.eliteshots.gallery/file/eliteshots-dev/'
} else if (process.env.NODE_ENV === 'production') {
  host = 'eliteshots.gallery'
  protocol = 'https'
  imageUrlRoute = 'https://cdn.eliteshots.gallery/file/eliteshots/'
}

let version = require('./version')

let defaultAlbumTitle = 'Default'

module.exports = {
  host, protocol, imageUrlRoute, version, defaultAlbumTitle
}
