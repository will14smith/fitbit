import fs from 'fs';

export function auth(config) {
  var text = `const config = {
  token: '${config.token}',
  expires: new Date(${config.expires}),
  refresh: '${config.refresh}'
};
export default config;`;

  return Promise.node(cb => fs.writeFile('config_auth.js', text, cb));
}
