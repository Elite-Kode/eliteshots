const path = require('path');
const fs = require('fs');

const appVersion = require('./package.json').version;

const frontendVersionFilePath = path.join(__dirname + '/frontend/src/version.js');
const frontendNodeVersionFilePath = path.join(__dirname + '/frontend/version.js');
const guildBotVersionFilePath = path.join(__dirname + '/guild_bot/version.js');

const vueSrc = `export default '${appVersion}'\n`;
const nodeSrc = `module.exports = '${appVersion}';\n`;

fs.writeFileSync(frontendVersionFilePath, vueSrc);
fs.writeFileSync(frontendNodeVersionFilePath, nodeSrc);
fs.writeFileSync(guildBotVersionFilePath, nodeSrc);
