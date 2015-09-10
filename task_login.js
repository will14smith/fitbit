import prompt from 'prompt';
import request from 'request';
import { auth as authWriter } from './config_writer';

const redirect_uri = 'http://www.toxon.co.uk/fitbit.php';

function generateAuthUrl(args) {
  return `https://www.fitbit.com/oauth2/authorize?client_id=${args.oauth_id}&response_type=code&scope=activity%20heartrate%20profile%20sleep`;
}

export default function (args) {
  console.log('Please visit this url:');
  console.log(generateAuthUrl(args));

  prompt.start();
  var result = Promise.node(cb => prompt.get(['token'], cb));

  result.then(obj => Promise.node(cb => request.post({
      url: 'https://api.fitbit.com/oauth2/token',
      form: {
        client_id: args.oauth_id,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
        code: obj.token
      },
      auth: {
        user: args.oauth_id,
        pass: args.client_secret
      }
    }, cb))
  ).then(httpResponse => {
    var response = JSON.parse(httpResponse.body);

    var expires_at = Math.floor(Date.now()) + response.expires_in * 1000;

    return authWriter({
      token: response.access_token,
      expires: expires_at,
      refresh: response.refresh_token
    });
  }).then(() => console.log('Logged in. Token saved in config_auth.js'));
}
