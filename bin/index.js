const jsonfile = require('jsonfile');
const parseArgs = require('minimist');
const extract = require('../lib');

const argv = parseArgs(process.argv.slice(2));
const [input, output] = argv._;

extract(input)
  .then((palette) => {
    jsonfile.writeFileSync(output, palette);
  });
