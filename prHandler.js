require('dotenv').config();
const octokit = require('@octokit/rest')({ debug: true });

const GITHUB_ICON = 'https://cdn4.iconfinder.com/data/icons/iconsimple-logotypes/512/github-512.png';

module.exports = {
  getPRs: getPRs
}

function getPRs(req, res) {
  if (req.body.token != process.env.MATTERMOST_TOKEN)
    return res.json({ error: 'Incorrect token' });

  let parameters = req.body.text.split(" ");
  let githubUsername = parameters[0];
  let repo = parameters[1];
  const repoOwner = 'appian';

  let text = 'PRs created by **' + githubUsername + '** in **' + repo + '**:\n';

  octokit.issues.getForRepo({owner:repoOwner, repo:repo, creator:githubUsername}).then(result => {
    result.data.forEach(prResponse => {
      let prTitle = prResponse.title;
      let prURL = prResponse.html_url;
      text += '\n' + prTitle + ': ' + prURL;
    });
  }).catch(error => {
    if (error.code == '404') {
      text = '404 error. Did you provide the correct GitHub username and repo?';
    } else {
      text = 'Unknown error.';
    }
  }).then(() => {
    return res.json({
      username: 'GitHub Bot',
      response_type: 'ephemeral',
      text: text,
      icon_url: GITHUB_ICON
    });
  });
};

octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
});
