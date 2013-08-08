
/**
 * Module dependencies.
 */

var reactive = require('reactive-component');
var domify = require('domify');
var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var tmpl = require('./input');

/**
 * Expose `InputView`.
 */

module.exports = InputView;

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
  this.emit('message', {
    author: this.name,
    message: message
  });
};

InputView.prototype.updateName = function (ev) {
  this.name = ev.target.value;
  this.emit('change name');
};
