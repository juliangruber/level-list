var Engine = require('engine.io-stream');
var http = require('http');
var multilevel = require('multilevel');
var MemDB = require('memdb');
var liveStream = require('level-live-stream');
var createManifest = require('level-manifest');
var fs = require('fs');
var browserify = require('browserify');

var server = http.createServer(function(req, res) {
  if (req.url == '/bundle.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    browserify(__dirname + '/client.js').bundle().pipe(res);
    return;
  }
  
  res.end('<body><script src="/bundle.js"></script></body>');
});

var db = MemDB({ valueEncoding: 'json' });
liveStream.install(db);

var manifest = JSON.stringify(createManifest(db));
fs.writeFileSync(__dirname + '/manifest.json', manifest);

var engine = Engine(function (con) {
  con.pipe(multilevel.server(db)).pipe(con);
});

engine.attach(server, '/engine');

server.listen(9000);
