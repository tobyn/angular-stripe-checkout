/* global __dirname, console, process */
/* eslint no-console:0 */
var node = process.argv[0];
var spawn = require('child_process').spawn;

var LISTENING = /^Listening on port/;

var done = false;

var serverPath = __dirname + '/example-server.js';
var server = spawn(node,[serverPath],{ stdio: 'pipe' });

server.stdout.setEncoding('utf8');
server.stdout.on('data',function(data) {
  if (LISTENING.test(data)) {
    runTests();
  }
});

server.stderr.setEncoding('utf8');
server.stderr.on('data',function(data) {
  var lines = data.split('\n');
  for (var i = 0, len = lines.length - 1; i < len; i++) {
    console.error('[server err]',lines[i]);
  }
});

server.on('exit',function(code, signal) {
  if (signal && !done) {
    throw new Error('Server exited on signal ' + signal);
  } else if (code) {
    throw new Error('Server exited with code ' + code);
  }
});


function runTests() {
  var wdioPath = __dirname + '/../node_modules/.bin/wdio';
  var wdioConfig = __dirname + '/../wdio.conf.js';
  var wdio = spawn(wdioPath,[wdioConfig],{ stdio: 'inherit' });

  wdio.on('exit',function() {
    done = true;
    server.kill('SIGINT');
  });
}
