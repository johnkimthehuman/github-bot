require('dotenv').config();

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

  let text = `The 2 argument command is deprecated, sorry :(`;
  return mattermostResponse(res, text);
}

function mattermostResponse(res, text) {
  return res.json({
    username: 'GitHub',
    response_type: 'ephemeral',
    text: text,
    icon_url: GITHUB_ICON
  });
}
