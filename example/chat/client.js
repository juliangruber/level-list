
/**
 * Module dependencies.
 */

var List = require('../..');
var reactive = require('reactive-component');
var domify = require('domify');
var multilevel = require('multilevel');
var engine = require('engine.io-stream');
var manifest = require('./manifest.json');
var Input = require('./input-view');
require('insert-css')(require('../style'));

/**
 * Database.
 */

var db = multilevel.client(manifest);
var con = engine('/engine');
con.pipe(db.createRpcStream()).pipe(con);

/**
 * Message input.
 */

var input = new Input();
input.on('message', function (msg) {
  db.put(Date.now(), msg);
});
document.body.appendChild(input.el);

/**
 * Message list.
 */

var tmpl = '<div><p>{author}: {message}</p></div>';

var list = List(db, function (row) {
  return reactive(domify(tmpl), row).el;
});

document.body.appendChild(list.el);
