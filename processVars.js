let host = '';
let protocol = '';
if (process.env.NODE_ENV === 'development') {
  host = 'localhost:3004';
  protocol = 'http';
} else if (process.env.NODE_ENV === 'production') {
  host = 'eliteshots.gallery';
  protocol = 'https';
}

let version = require('./version');

let defaultAlbumTitle = 'Default'

module.exports = {
  host, protocol, version, defaultAlbumTitle
}
