require('dotenv').config();
const request = require('request');
const crypto = require('crypto');

const GITHUB_ICON = 'https://www.iconsdb.com/icons/preview/caribbean-blue/github-6-xxl.png';

const squadToChannel = {
  '@test-squad1': 'johns-private-channel',
  '@test-squad2': 'johns-private-channe2',
}

module.exports = {
  getCRs,
}

function getCRs(req, res) {
  let calculatedSignature = 'sha1=' + crypto.createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (req.headers['x-hub-signature'] !== calculatedSignature) {
    return res.json({ error: 'Incorrect signature' });
  }

  let prTitle = req.body.issue.title;
  let prBody = req.body.issue.body;
  let prURL = req.body.issue.html_url;
  let prComment = req.body.comment.body;
  let prCommenter = req.body.comment.user.login;

  if (prCommenter === 'hudson-admin') {
    return;
  }

  let ticketLink = '';
  let ticketInTitle = prTitle.match(/^\w+-\d+/i);
  let ticketInBody = prBody.match(/(ticket:\s*https:.*\d+)|(jira:\s*https:.*\d+)/gi);
  if (ticketInTitle) {
    ticketLink = 'https://issues.appian.com/browse/' + ticketInTitle[0];
  } else if (ticketInBody) {
    ticketLink = ticketInBody[0].match(/https:.*\d+/gi)[0];
  }

  if (req.body.action === 'created') {
    let squads = prComment.match(/@(\w|-|_|\/)+/g);
    squads.forEach(squad => {
      if (squad in squadToChannel) {
        let mattermostChannel = squadToChannel[squad];
        let mattermostComment = generateMattermostComment(prTitle, prURL, prCommenter, prComment, ticketLink);

        postToMattermost(mattermostChannel, mattermostComment);
      }
    });
  }
}

function generateMattermostComment(prTitle, prURL, prCommenter, prComment, ticketLink) {
  let mattermostComment = `@here\n`;
  mattermostComment += `#### [${prTitle}](${prURL})`;

  if (ticketLink) {
    mattermostComment += ` ([Ticket Link](${ticketLink}))\n`;
  } else {
    mattermostComment += `\n`;
  }

  mattermostComment += `Tagged by: ${prCommenter}\n\n`;
  mattermostComment += `PR comment:\n`;
  mattermostComment += `${prComment}`;

  return mattermostComment;
}

function postToMattermost(channel, comment) {
  request.post({
    json: true,
    url: process.env.MATTERMOST_URL,
    headers: { 'Content-Type': 'application/json' },
    body: {
      username: 'GitHub',
      channel: channel,
      text: comment,
      icon_url: GITHUB_ICON
    },
  }, (error, response, body) => {
    console.log(body);
  });
}
