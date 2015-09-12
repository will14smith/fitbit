import request from 'request';
import auth from './config_auth';
import { auth as authWriter } from './config_writer';

let _args;

function checkToken() {
  // check if auth token is still valid
  if(auth.expires > Date.now()) {
    return new Promise(resolve => resolve());
  }

  // use refresh token if not
  return Promise.node(cb => request.post({
      url: 'https://api.fitbit.com/oauth2/token',
      form: {
        grant_type: 'refresh_token',
        refresh_token: auth.refresh
      },
      auth: {
        user: _args.oauth_id,
        pass: _args.client_secret
      }
    }, cb))
    .then(httpResponse => {
      var response = JSON.parse(httpResponse.body);

      var expires_at = Math.floor(Date.now()) + response.expires_in * 1000;

      auth.token = response.access_token;
      auth.expires = expires_at;
      auth.refresh = response.refresh_token;

      return authWriter(auth);
    })
    .then(() => console.log('Refreshed OAuth token'));
}

export default class Api {
  static init(args) {
    _args = args;
  }

  static get(url) {
    return checkToken()
      .then(() => Promise.node(cb => request({
        url: `https://api.fitbit.com${url}`,
        auth: { bearer: auth.token },
      }, cb)))
      .then(response => {
        if(response.statusCode === 429) {
          var retryAfter = parseInt(response.headers["retry-after"], 10) + 2;
          console.warn(`Rate Limit reached, retrying in ${retryAfter} seconds`);

          return new Promise((resolve, reject) => {
            setTimeout(() => {
              Api.get(url).then(resolve, reject);
            }, retryAfter * 1000);
          });
        }

        var data = JSON.parse(response.body);
        if(data.success === false || (data.errors && data.errors.length > 0)) {
          throw data;
        }
        return data;
      })
  }
}
