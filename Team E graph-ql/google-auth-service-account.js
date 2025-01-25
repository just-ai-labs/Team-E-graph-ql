import fs from 'fs';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const CREDENTIALS_PATH = 'credentials.json';

export function authorize(callback) {
  fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) {
      console.error('Error loading client secret file:', err);
      return;
    }
    const credentials = JSON.parse(content);
    const authClient = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    callback(authClient);
  });
}

export function listFiles(authClient) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}
