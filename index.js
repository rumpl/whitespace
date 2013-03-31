var ws = require('./lib/whitespace');

if (process.argv[2] === 'debug') {
  ws.debug(process.argv[3]);
} else {
  ws.run(process.argv[2]);
}
