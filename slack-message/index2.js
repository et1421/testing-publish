const { exec } = require("child_process");
const { execSync } = require('child_process');
const fs = require('fs');

const previousVersionFilePath = 'slack-message/current-versions.json';

let rawdata = fs.readFileSync(previousVersionFilePath);
let previousVersion = JSON.parse(rawdata);
console.log(previousVersion[0].name);

try {
  const cmd = 'lerna ls --json';
  const result =  execSync(cmd).toString();
  // console.log('result', result);

  fs.writeFileSync(previousVersionFilePath, result);
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}

console.log('version-------------------------------------')
