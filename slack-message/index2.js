const { execSync } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const previousVersionsFilePath = 'slack-message/current-versions.json';
const previousVersions = JSON.parse(fs.readFileSync(previousVersionsFilePath));

const Color = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m"
}

function colorString(color, string) {
  return `${color}${string}${Color.Reset}`;
}

function colorLog(color, ...args) {
  console.log(...args.map(
    (it) => typeof it === "string" ? colorString(color, string) : it
  ));
}


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
      text += `*${i.name}:* ${previousVersions[i.name]} ---> ${i.version}\n`;
    }
  });

  return text;
}

const getYarnUpdateOneliner = (newVersions) => {
  let text = 'yarn add';

  newVersions.forEach(i => {
    if (i.version !== previousVersions[i.name]) {
      text += ` ${i.name}@${i.version}`;
    }
  });

  return text;
};

try {
  const cmd = 'lerna ls --json';
  const newVersions = JSON.parse(execSync(cmd).toString());

  const versionUpdateText = getVersionsUpdate(newVersions);


  const yarnUpdate = getYarnUpdateOneliner(newVersions);
  console.log(colorString(Color.FgMagenta,"Don't forget to update your packages:"), yarnUpdate);


  if (versionUpdateText !== '') {
    // postToSlack(versionUpdateText).catch(err => console.log(err));
  }

  saveNewVersionToFile(newVersions);
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}
