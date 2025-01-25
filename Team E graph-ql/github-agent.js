const fs = require('fs'); // Add this line
const { Octokit } = require('@octokit/rest');
const { authorize, listFiles } = require('./google-auth');

const octokit = new Octokit({
  auth: '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',
});

async function createIssue(repoOwner, repoName, title, body) {
  const response = await octokit.issues.create({
    owner: repoOwner,
    repo: repoName,
    title,
    body,
  });
  console.log('Issue created:', response.data.url);
}

authorize(JSON.parse(fs.readFileSync('credentials.json')), listFiles);

// Example usage: createIssue('your-username', 'your-repo', 'Issue title', 'Issue body');
