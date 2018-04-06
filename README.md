# github-bot

Source code for both the /prs slash command and pull request webhook.
All sensitive data is stripped, but the structure remains the same.

npm packages used:
* body-parser
* dotenv
* express
* @octokit/rest
* request

## Usage

### Pull Request Webhook
In a GitHub pull request, a new (not edited) comment with the structure
```
@organization/github-team ...
```
will post a `@here` comment to the corresponding channel on Mattermost.
The channel must be mapped from GitHub team to the name of Mattermost channel in this list(Todo: add link here) for it to receive the message from the webhook.

**Note**:
* The webhook must be attached on the GitHub repo for this to work.
* The name of the Mattermost channel must be the one with which the channel was created with.
Channels that have changed their name will refer to this original name internally in Mattermost.
The original channel name can be found by: navigating to the channel's header -> view info -> the last part of the URL.

### /prs Slash Command
In the Mattermost prompt, invoke:
```
/prs [github_username] [repo]
```
This will return a list of open pull requests against the specified repo, opened by the specified user.
This post will only be visible to the user invoking the command, and will disappear across sessions.
