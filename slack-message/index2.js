const { execSync } = require('child_process');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();


const previousVersionsFilePath = 'slack-message/current-versions.json';
const previousVersions = JSON.parse(fs.readFileSync(previousVersionsFilePath));


async function postToSlack(text) {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: '#testing-posting',
    text,
    username: 'Bit Design system published',
    icon_emoji: ':rocket:'
  }, { headers: { authorization: `Bearer ${process.env.SLACK_TOKEN}` } });

  console.log('Done', res.data);
}

const saveNewVersionToFile = (newVersions) => {
  const newVersionsAsObject = newVersions.reduce((obj, item) => ({...obj, [item.name]: item.version}), {});
  fs.writeFileSync(previousVersionsFilePath, JSON.stringify(newVersionsAsObject));
}

const getVersionsUpdate = (newVersions) => {
  let text = null;

  newVersions.forEach(i => {
    if (i.version !== previousVersions[i.name]) {
      console.log(`${i.name}: ${previousVersions[i.name]} ---> ${i.version}`);
      text += `${i.name}: ${previousVersions[i.name]} ---> ${i.version}`;
    }
  });

  return text;
}

try {
  const cmd = 'lerna ls --json';
  const newVersions = JSON.parse(execSync(cmd).toString());

  const versionUpdateText = getVersionsUpdate(newVersions);

  if (versionUpdateText) {
    postToSlack(versionUpdateText).catch(err => console.log(err));
  }

  saveNewVersionToFile(newVersions);
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}
