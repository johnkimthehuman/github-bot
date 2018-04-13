require('dotenv').config();
const octokit = require('@octokit/rest')({ debug: true });
const request = require('request');
const crypto = require('crypto');

const GITHUB_ICON = 'https://www.iconsdb.com/icons/preview/caribbean-blue/github-6-xxl.png';

const squadToChannel = {
  '@test-squad1': 'johns-private-channel',
  '@test-squad2': 'johns-private-channe2',
}

module.exports = {
  getCRs: getCRs,
}

function getCRs(req, res) {
  let calculatedSignature = 'sha1=' + crypto.createHmac("sha1", process.env.GITHUB_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (req.headers['x-hub-signature'] != calculatedSignature) {
    return res.json({ error: 'Incorrect signature' });
  }

  let prTitle = req.body.issue.title;
  let prURL = req.body.issue.html_url;
  let prComment = req.body.comment.body;
  let prCommenter = req.body.comment.user.login;

  if (req.body.action == 'created') {
    let squads = prComment.match(/@(\w|-|_)+/g);

    squads.forEach(squad => {
      if (squad in squadToChannel) {
        let mattermostChannel = squadToChannel[squad];
        let mattermostComment = `@here\n` +
                                `### [${prTitle}](${prURL})\n` +
                                `Commented by: ${prCommenter}\n` +
                                `PR comment:\n` +
                                `${prComment}`;
        postToMattermost(mattermostChannel, mattermostComment);
      }
    });
  }
}

function postToMattermost(channel, comment) {
  request.post({
    json: true,
    url: process.env.MATTERMOST_URL,
    headers: { 'Content-Type': 'application/json' },
    body: {
      username: 'GitHub Bot',
      channel: channel,
      text: comment,
      icon_url: GITHUB_ICON
    },
  }, (error, response, body) => {
    console.log(body);
  });
}
