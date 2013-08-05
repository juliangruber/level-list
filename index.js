var liveStream = require('level-live-stream');
var Emitter = require('events').EventEmitter;

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);

  this.db = db;
  this.el = document.createElement('div');
  this.stream = null;
  this._limit = Infinity;
  this._sort = function () { return 0 };
  this._create = fn || function () {
    throw new Error('needs a create function');
  };
  this.rows = {};

  process.nextTick(this.seed.bind(this));
}

List.prototype.seed = function () {
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
    row.key = id;
    row.value = change.value;
    row.element = self._create(row);

    // save row
    var old = self.rows[id];
    self.rows[id] = row;

    // update?
    if (old) {
      old.emit('remove');
      self.el.replaceChild(row.element, old.element);
      return;
    }

    // sort
    var rows = Object
      .keys(self.rows)
      .map(function (key) {
        return self.rows[key];
      })
      .sort(self._sort);
    var position = rows.indexOf(row);
    if (position == -1) position = rows.length;

    // insert
    if (rows.length == 1 || position == rows.length - 1) {
      self.el.appendChild(row.element);
    } else {
      var before = self.rows[rows[position + 1].key];
      self.el.insertBefore(row.element, before.element);
    }

    // apply limit
    if (Object.keys(self.rows).length == self._limit) {
      this.destroy();
    }

  });
};

List.prototype.limit = c(function (count) {
  this._limit = count;
});

List.prototype.sort = c(function (fn) {
  this._sort = fn;
});

List.prototype.create = c(function (fn) {
  this._create = fn;
});

function live (db, fn) {
  return liveStream(db).on('data', fn);
}

function c (fn) {
  return function () {
    fn.apply(this, arguments);
    return this;
  }
}
