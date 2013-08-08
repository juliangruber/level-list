
/**
 * Module dependencies.
 */

var List = require('..');
var reactive = require('reactive-component');
var domify = require('domify');
var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var multilevel = require('multilevel');
var engine = require('engine.io-stream');
var manifest = require('./manifest.json');
var tmpl = require('./input');
require('insert-css')(require('../style'));

/**
 * LevelUp style db.
 */

var db = multilevel.client(manifest);
var con = engine('/engine');
con.pipe(db.createRpcStream()).pipe(con);

/**
 * Autosubmit binding.
 */

reactive.bind('autosubmit', function (el) {
  var view = this.fns;
  el.addEventListener('keydown', function (ev) {
    if (ev.keyCode != 13) return;
    view.submit(el.value);
    el.value = ''
    ev.preventDefault();
  })
});

/**
 * Chat input.
 */

function InputView () {
  Emitter.call(this);
  this.name = 'juliangruber';
  this.el = domify(tmpl);
  this.view = reactive(this.el, {}, this);
}

inherits(InputView, Emitter);

InputView.prototype.submit = function (message) {
  db.put(Date.now(), {
    author: this.name,
    message: message
  });
};

InputView.prototype.updateName = function (ev) {
  this.name = ev.target.value;
  this.emit('change name');
};

var input = new InputView();
document.body.appendChild(input.el);

/**
 * Message list.
 */

var tmpl = '<div><p>{author}: {message}</p></div>';

var list = List(db, function (row) {
  var view = reactive(domify(tmpl), row);
  return view.el;
});

document.body.appendChild(list.el);
