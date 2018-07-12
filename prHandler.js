require('dotenv').config();
const octokit = require('@octokit/rest')({ debug: true });

const GITHUB_ICON = 'https://www.iconsdb.com/icons/preview/caribbean-blue/github-6-xxl.png';

module.exports = {
  getPRs,
}

function getPRs(req, res) {
  if (req.body.token !== process.env.MATTERMOST_TOKEN) {
    return res.json({ error: 'Incorrect token' });
  }

  if (!req.body.text) {
    let text = '[GitHub link to all of your PRs](https://github.com/pulls)';
    return mattermostResponse(res, text);
  }

  let parameters = req.body.text.split(' ');
  let githubUsername = parameters[0];
  let link = 'https://github.com/pulls?utf8=%E2%9C%93&q=is%3Aopen+is%3Apr+author%3A' + githubUsername;
  if (parameters.length === 1) {
    let text = `[GitHub link to ${githubUsername}'s PRs in all repos](${link})`;
    return mattermostResponse(res, text);
  }

  let repo = parameters[1];
  let repoOwner = 'appian';

  return octokit.issues.getForRepo({ owner: repoOwner, repo: repo, creator: githubUsername }).then(result => {
    let text = `### PRs created by ${githubUsername} in ${repo} ([Link on GitHub](${link})):\n`;

    result.data.forEach(prResponse => {
      let prTitle = prResponse.title;
      let prURL = prResponse.html_url;
      text += `${prTitle}: ${prURL}\n`;
    });

    return mattermostResponse(res, text);
  }).catch(error => {
    let inputCommand = `/prs ${githubUsername} ${repo}\n`;
    let errorMessage = ''

    if (error.code === '404') {
      errorMessage = '404 error. Did you provide the correct GitHub username and repo?';
    } else {
      errorMessage = 'Unknown error.';
    }

    return mattermostResponse(res, inputCommand + errorMessage);
  });
}

octokit.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN
});

function mattermostResponse(res, text) {
  return res.json({
    username: 'GitHub',
    response_type: 'ephemeral',
    text: text,
    icon_url: GITHUB_ICON
  });
}
