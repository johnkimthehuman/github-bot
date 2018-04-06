require('dotenv').config();
const octokit = require('@octokit/rest')({ debug: true });
const request = require('request');

const GITHUB_ICON = 'https://cdn4.iconfinder.com/data/icons/iconsimple-logotypes/512/github-512.png';

const squadToChannel = {
  '@organization/team-1'         : 'mattermost-channel-1',
  '@organization/team-1'         : 'mattermost-channel-2',
}

module.exports = {
  getCRs: getCRs,
}

function getCRs(req, res) {
  let prURL = req.body.issue.html_url;
  let prComment = req.body.comment.body;
  let prCommenter = req.body.comment.user.login;

  if (req.body.action == 'created') {
    let squads = prComment.match(/@(\w|-|_)+/g);
    squads.forEach(squad => {
      if (squad in squadToChannel) {
        let mattermostChannel = squadToChannel[squad];
        let mattermostComment = '@here ' + prURL + '\nCommented by: ' + prCommenter + '\n\nPull request comment:\n' + prComment;

        request.post({
          json: true,
          url: process.env.MATTERMOST_URL,
          headers: { 'Content-Type': 'application/json'},
          body: {
            username: 'GitHub Bot',
            channel: mattermostChannel,
            text: mattermostComment,
            icon_url: GITHUB_ICON
          },
        }, (error, response, body) => {
          console.log(body);
        });
      }
    });
  }
};
