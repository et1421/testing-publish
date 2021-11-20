const { exec } = require("child_process");
const { execSync } = require('child_process');

console.log('version-------------------------------------')

try {
  const cmd = 'lerna ls --json';
  execSync(cmd).toString();
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}

console.log('version-------------------------------------')
