const { exec } = require("child_process");
const { execSync } = require('child_process');

console.log('version-------------------------------------')

try {
  const cmd = 'lerna ls --json';
  const result =  execSync(cmd).toString();
  console.log('result', result);
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}

console.log('version-------------------------------------')
