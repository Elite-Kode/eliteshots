const path = require('path');
const fs = require('fs-extra');
const appVersion = require('./package.json').version;

const vueVersionFilePath = path.join(__dirname + '/src/version.js');
const nodeVersionFilePath = path.join(__dirname + '/version.js');

const vueSrc = `export default '${appVersion}'\n`;
const nodeSrc = `module.exports = '${appVersion}';\n`;

fs.writeFileSync(vueVersionFilePath, vueSrc);
fs.writeFileSync(nodeVersionFilePath, nodeSrc);
