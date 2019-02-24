const BugsnagSourceMapUploaderPlugin = require('webpack-bugsnag-plugins').BugsnagSourceMapUploaderPlugin
const secrets = require('./secrets')
const processVars = require('./processVars')

let plugins = []

if (secrets.bugsnag_sourcemap_send) {
  plugins = [
    new BugsnagSourceMapUploaderPlugin({
      apiKey: secrets.bugsnag_token_vue,
      appVersion: processVars.version,
      overwrite: true,
      publicPath: 'https://eliteshots.gallery/',
      deleteSourceMaps: true
    })
  ]
}

module.exports = {
  configureWebpack: {
    plugins: plugins
  }
}
