import { argv } from 'yargs';

if(!argv._ || !argv._[0]) {
  console.error('Provide a task.');
  process.exit(1);
}

const file = './task_' + argv._[0];
// es6 imports are static so we have to use node require.
const task = require(file);

const envArgs = Object.keys(process.env)
  .filter(k => k.startsWith('FITBIT_'))
  .reduce((args, k) => {
    args[k.substr(7).toLowerCase()] = process.env[k];
    return args;
  }, {});
const args = Object.assign({}, envArgs, argv);

task(args);
