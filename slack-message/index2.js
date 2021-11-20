const { exec } = require("child_process");
const { execSync } = require('child_process');


console.log('version-------------------------------------')
execSync("lerna ls");

console.log('version-------------------------------------')
