/* global __dirname, console, process */
/* eslint no-console:0 */

var EXAMPLE_PATH = /^\/examples\/([a-z]+\.html)/;

var LISTEN_PORT = process.env.LISTEN_PORT || 49684;

var STRIPE_KEY = process.env.STRIPE_KEY;
var STRIPE_KEY_PLACEHOLDER = /YOUR PUBLISHABLE STRIPE KEY/g;

if (!STRIPE_KEY)
  throw new Error('STRIPE_KEY must be set to a publishable Stripe key');

var readFile = require('fs').readFile;
var serveStatic = require('serve-static')(__dirname + '/..',{
  fallthrough: false
});

require('http')
  .createServer(handleRequest)
  .listen(LISTEN_PORT,function() {
    console.log('Listening on port',LISTEN_PORT);
  });


function handleRequest(req, res) {
  var match;
  if ((match = EXAMPLE_PATH.exec(req.url))) {
    readExample(match[1],function(err, contents) {
      if (err) {
        serveError(req,res,err);
      } else {
        res.writeHead(200,{ 'Content-Type': 'text/html' });
        res.end(contents);
      }
    });
  } else {
    serveStatic(req,res,function(err) {
      serveError(req,res,err);
    });
  }
}


function readExample(file, callback) {
  var path = __dirname + '/../examples/' + file;

  readFile(path,'utf8',function(err, contents) {
    if (err) {
      callback(err);
    } else {
      callback(null,contents.replace(STRIPE_KEY_PLACEHOLDER,STRIPE_KEY));
    }
  });
}

function serveError(req, res, err) {
  if (err.code === 'ENOENT') {
    res.writeHead(404,{ 'Content-Type': 'text/plain' });
    res.end('Not found: ' + req.url + '\n');
  } else {
    console.error(err.stack);
    res.writeHead(500,{ 'Content-Type': 'text/plain' });
    res.end(err.stack + '\n');
  }
}
