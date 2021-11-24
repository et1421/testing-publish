const { execSync } = require('child_process');
const fs = require('fs');
// const axios = require('axios');
const https = require('https');


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

const httpPost = (options, body) => {
  return new Promise((resolve, reject) => {
    const clientRequest = https.request(options, incomingMessage => {
      // Response object.
      let response = {
        statusCode: incomingMessage.statusCode,
        headers: incomingMessage.headers,
        body: []
      };

      // Collect response body data.
      incomingMessage.on('data', chunk => {
        response.body.push(chunk);
      });

      incomingMessage.on('end', () => {
        if (response.body.length) {
          response.body = response.body.join();

          try {
            response.body = JSON.parse(response.body);
          } catch (error) {
            // Silently fail if response is not JSON.
          }
        }

        resolve(response);
      });
    });

    // Reject on request error.
    clientRequest.on('error', error => {
      reject(error);
    });

    // Write request body.
    clientRequest.write(body);

    // Close HTTP connection.
    clientRequest.end();
  });
};

async function postToSlack(text) {

  const options = {
    hostname: 'slack.com',
    path: '/api/chat.postMessage',
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
      authorization: `Bearer ${process.env.SLACK_TOKEN}`
    },
  };

  const body = {
    channel: '#testing-posting',
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'A new version of the design system was just published :rocket:.\nPlease, *update* your packages locally.' }
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: text }
      }
    ],
    username: 'Bit Design system',
    icon_emoji: ':rocket:',
  };

  httpPost(options, JSON.stringify(body))
    .then((response) => {
      if (response.body.error) {
        console.log(colorString(Color.FgRed,'Slack message error:'), response.body.error);
      } else {
        console.log(colorString(Color.FgGreen,'Slack message successfully sent!'));
      }
    })
    .catch(function(error) {
      console.error(error)
    });
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
  let text = '';

  newVersions.forEach(i => {
    if (i.version !== previousVersions[i.name]) {
      text += ` ${i.name}@${i.version}`;
    }
  });

  text = (text !== '') ? `yarn add${text}` : text;

  return text;
};

try {
  const cmd = 'lerna ls --json';
  const newVersions = JSON.parse(execSync(cmd).toString());

  const versionUpdateText = getVersionsUpdate(newVersions);


  const yarnUpdate = getYarnUpdateOneliner(newVersions);
  if (yarnUpdate !== '') {
    console.log(colorString(Color.FgMagenta,"Don't forget to update your packages:"), yarnUpdate);
  }


  if (versionUpdateText !== '') {
    postToSlack(versionUpdateText).catch(err => console.log(err));
  }

  saveNewVersionToFile(newVersions);
} catch (error) {
  console.log(`Status Code: ${error.status} with '${error.message}'`);
}
