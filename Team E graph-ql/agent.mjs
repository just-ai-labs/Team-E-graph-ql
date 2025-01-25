import { graphql } from '@octokit/graphql';
import readline from 'readline';

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: 'token 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'
  }
});

function startAgent() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter your GitHub username: ', (username) => {
    rl.question('Enter your GitHub repository name: ', (repo) => {
      rl.question('Do you want to create or update an issue? (create/update): ', (action) => {
        if (action === 'create') {
          rl.question('Enter the issue title: ', (title) => {
            rl.question('Enter the issue body: ', (body) => {
              rl.question('Enter the assignee username: ', (assignee) => {
                createIssue(username, repo, title, body, assignee, rl);
              });
            });
          });
        } else if (action === 'update') {
          rl.question('Enter the issue number to update: ', (issueNumber) => {
            rl.question('Enter the new issue title: ', (title) => {
              rl.question('Enter the new issue body: ', (body) => {
                rl.question('Enter the assignee username: ', (assignee) => {
                  updateIssue(username, repo, issueNumber, title, body, assignee, rl);
                });
              });
            });
          });
        } else {
          console.log('Invalid action! Please run the agent again.');
          rl.close();
        }
      });
    });
  });
}

async function createIssue(username, repo, title, body, assignee, rl) {
  try {
    const { createIssue } = await graphqlWithAuth(`
      mutation($repositoryId: ID!, $title: String!, $body: String!, $assignees: [ID!]!) {
        createIssue(input: { repositoryId: $repositoryId, title: $title, body: $body, assigneeIds: $assignees }) {
          issue {
            url
          }
        }
      }
    `, {
      repositoryId: await getRepositoryId(username, repo),
      title: title,
      body: body,
      assignees: [await getUserId(assignee)] // Ensure `assignees` is an array of IDs
    });

    console.log(`Issue created: ${createIssue.issue.url}`);
  } catch (err) {
    console.error('Error creating issue:', err);
  } finally {
    askToRunAgain(rl);
  }
}

async function updateIssue(username, repo, issueNumber, title, body, assignee, rl) {
  try {
    const { updateIssue } = await graphqlWithAuth(`
      mutation($issueId: ID!, $title: String!, $body: String!, $assignees: [ID!]!) {
        updateIssue(input: { id: $issueId, title: $title, body: $body, assigneeIds: $assignees }) {
          issue {
            url
          }
        }
      }
    `, {
      issueId: await getIssueId(username, repo, issueNumber),
      title: title,
      body: body,
      assignees: [await getUserId(assignee)] // Ensure `assignees` is an array of IDs
    });

    console.log(`Issue updated: ${updateIssue.issue.url}`);
  } catch (err) {
    console.error('Error updating issue:', err);
  } finally {
    askToRunAgain(rl);
  }
}

async function getRepositoryId(username, repo) {
  const { repository } = await graphqlWithAuth(`
    query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        id
      }
    }
  `, {
    owner: username,
    name: repo
  });

  return repository.id;
}

async function getIssueId(username, repo, issueNumber) {
  const { repository } = await graphqlWithAuth(`
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        issue(number: $number) {
          id
        }
      }
    }
  `, {
    owner: username,
    name: repo,
    number: issueNumber
  });

  return repository.issue.id;
}

async function getUserId(username) {
  const { user } = await graphqlWithAuth(`
    query($login: String!) {
      user(login: $login) {
        id
      }
    }
  `, {
    login: username
  });

  return user.id;
}

function askToRunAgain(rl) {
  rl.question('Do you want to run the agent again? (yes/no): ', (response) => {
    if (response.toLowerCase() === 'yes') {
      rl.close(); // Close the current instance of readline
      startAgent(); // Start the agent again
    } else {
      console.log('Exiting the agent. Goodbye!');
      rl.close();
    }
  });
}

// Start the agent
startAgent();
