var liveStream = require('level-live-stream');
var Emitter = require('events').EventEmitter;
var comparator = require('comparator');

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);

  this.db = db;
  this.el = document.createElement('div');
  this.stream = null;
  this._limit = Infinity;
  this._sort = comparator('_key');
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
      self.el.removeChild(row._element);
      row.emit('remove');
      return;
    }

    // current row?
    var cur = self.rows[id];

    // update?
    var props = cur && Object.keys(cur);
    var listeners = cur && props.some(function (prop) {
      return cur.listeners('change ' + prop).length;
    });
    if (listeners) {
      for (var prop in change.value) {
        var changed = cur[prop] != change.value[prop];
        cur[prop] = change.value[prop];
        if (changed) cur.emit('change ' + prop);
      }
      cur.emit('update');
      return;
    }

    // create row
    var row = new Emitter();
    merge(row, change.value);
    row._key = id;
    row._element = self._create(row);
    self.rows[id] = row;

    // replace?
    if (cur) {
      cur.emit('remove');
      self.el.replaceChild(row._element, cur._element);
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
      self.el.appendChild(row._element);
    } else {
      var before = self.rows[rows[position + 1]._key];
      self.el.insertBefore(row._element, before._element);
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

function merge (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
}
