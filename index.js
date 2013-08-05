var liveStream = require('level-live-stream');
var Emitter = require('events').EventEmitter;

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);

  this.db = db;
  this.el = document.createElement('div');
  this.stream = null;
  this._limit = Infinity;
  this.rows = {};

  process.nextTick(this.seed.bind(this, fn));
}

List.prototype.seed = function (fn) {
  var self = this;
  self.stream = live(self.db, function (change) {
    var id = change.key;

    // delete?
    if (change.type == 'del') {
      var row = self.rows[id];
      self.el.removeChild(row.element);
      row.emit('remove');
      return;
    }

    // create element
    var row = new Emitter();
    row.key = change.key;
    row.value = change.value;
    row.element = fn(row);

    // save row
    var old = self.rows[id];
    self.rows[id] = row;

    // update?
    if (old) {
      old.emit('remove');
      self.el.replaceChild(row.element, old.element);
      return;
    }

    // insert
    self.el.appendChild(row.element);
    if (Object.keys(self.rows).length == self._limit) {
      this.destroy();
    }

  });
};

List.prototype.limit = function (count) {
  this._limit = count;
};

function live (db, fn) {
  return liveStream(db).on('data', fn);
}
