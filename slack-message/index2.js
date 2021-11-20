const { execSync } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const previousVersionsFilePath = 'slack-message/current-versions.json';
const previousVersions = JSON.parse(fs.readFileSync(previousVersionsFilePath));


async function postToSlack(text) {
  const url = 'https://slack.com/api/chat.postMessage';
  const res = await axios.post(url, {
    channel: '#testing-posting',
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'A new version of the design system was just published :rocket:.\nPlease, *update* your packages locally.' },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: text },
      },
    ],
    username: 'Bit Design system',
    icon_emoji: ':rocket:'
  }, { headers: { authorization: `Bearer ${process.env.SLACK_TOKEN}` } });

  console.log('Done', res.data);
}

const saveNewVersionToFile = (newVersions) => {
  const newVersionsAsObject = newVersions.reduce((obj, item) => ({...obj, [item.name]: item.version}), {});
  fs.writeFileSync(previousVersionsFilePath, JSON.stringify(newVersionsAsObject));
}

const getVersionsUpdate = (newVersions) => {
  let text = '';

  newVersions.forEach(i => {
    if (i.version !== previousVersions[i.name]) {
      text += `*${i.name}:* ${encodeURIComponent(previousVersions[i.name])} ---> ${i.version}\n`;
    }
  });

  console.log('text', text);

  return text;
}

try {
  const cmd = 'lerna ls --json';
  const newVersions = JSON.parse(execSync(cmd).toString());

  const versionUpdateText = getVersionsUpdate(newVersions);

  if (versionUpdateText !== '') {
    postToSlack(versionUpdateText).catch(err => console.log(err));
  }

  saveNewVersionToFile(newVersions);
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}
