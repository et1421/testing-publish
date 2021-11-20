const { exec } = require("child_process");
const { execSync } = require('child_process');

console.log('version-------------------------------------')

try {
  const cmd = 'lerna ls --json';
  const result =  execSync(cmd).toString();
  console.log('result', result);

  const cmd2 = 'lerna changed';
  const result2 =  execSync(cmd2).toString();
  console.log('result2', result2);
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}

console.log('version-------------------------------------')
