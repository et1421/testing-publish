const { execSync } = require('child_process');
const fs = require('fs');

const previousVersionsFilePath = 'slack-message/current-versions.json';

const previousVersion = JSON.parse(fs.readFileSync(previousVersionsFilePath));

try {
  const cmd = 'lerna ls --json';
  const newVersions = JSON.parse(execSync(cmd).toString());

  newVersions.forEach(i => {

    console.log('i.version', i.version);
    console.log('previousVersion[i.name]', previousVersion[i.name]);
    if (i.version !== previousVersion[i.name]) {
      console.log('New version published', `${i.name}: ${previousVersion[i.name]} ---> ${i.version}`);
    }
  });

  const newVersionsAsObject = newVersions.reduce((obj, item) => ({...obj, [item.name]: item.version}), {});

  fs.writeFileSync(previousVersionsFilePath, JSON.stringify(newVersionsAsObject));
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}
console.log('version-------------------------------------')
