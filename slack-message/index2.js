const { exec } = require("child_process");
const { execSync } = require('child_process');
const fs = require('fs');

// let rawdata = fs.readFileSync('student.json');
// let student = JSON.parse(rawdata);
// console.log(student);

try {
  const cmd = 'lerna ls --json';
  const result =  execSync(cmd).toString();
  console.log('result', result);

  let data = JSON.stringify(result);
  fs.writeFileSync('./current-versions.json', result);

} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}

console.log('version-------------------------------------')
