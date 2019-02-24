let host = '';
let protocol = '';
if (process.env.NODE_ENV === 'development') {
  host = 'localhost:3002';
  protocol = 'http';
} else if (process.env.NODE_ENV === 'production') {
  host = 'eliteshots.gallery';
  protocol = 'https';
}

let version = require('./server/version');

module.exports = {
  host, protocol, version
}
