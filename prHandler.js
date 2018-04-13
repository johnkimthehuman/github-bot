require('dotenv').config();
const octokit = require('@octokit/rest')({ debug: true });

const GITHUB_ICON = 'https://www.iconsdb.com/icons/preview/caribbean-blue/github-6-xxl.png';

module.exports = {
  getPRs: getPRs
}

function getPRs(req, res) {
  if (req.body.token != process.env.MATTERMOST_TOKEN) {
    return res.json({ error: 'Incorrect token' });
  }

  let parameters = req.body.text.split(' ');
  if (parameters.length != 2) {
    let text = 'Incorrect number of arguments :(';
    return mattermostResponse(res, text);
  }

  const repoOwner = 'appian';
  let githubUsername = parameters[0];
  let repo = parameters[1];

  octokit.issues.getForRepo({ owner: repoOwner, repo: repo, creator: githubUsername }).then(result => {
    let text = `### PRs created by ${githubUsername} in ${repo}:\n`;

    result.data.forEach(prResponse => {
      let prTitle = prResponse.title;
      let prURL = prResponse.html_url;
      text += `${prTitle}: ${prURL}\n`;
    });

    return mattermostResponse(res, text);
  }).catch(error => {
    let inputCommand = `/prs ${githubUsername} ${repo}\n`;
    let errorMessage = ''

    if (error.code == '404') {
      errorMessage = '404 error. Did you provide the correct GitHub username and repo?';
    } else {
      errorMessage = 'Unknown error.';
    }

    return mattermostResponse(res, inputCommand + errorMessage);
  });
};

octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
});

function mattermostResponse(res, text) {
  return res.json({
    username: 'GitHub Bot',
    response_type: 'ephemeral',
    text: text,
    icon_url: GITHUB_ICON
  });
}
