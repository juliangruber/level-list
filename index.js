var liveStream = require('level-live-stream');
var Emitter = require('events').EventEmitter;
var comparator = require('comparator');

module.exports = List;

function List (db, tag, fn) {
  if (!(this instanceof List)) return new List(db, tag, fn);
  if (typeof tag == 'function') {
    fn = tag;
    tag = null;
  }
  if (!tag) tag = 'div';

  this.db = db;
  this.el = document.createElement(tag);
  this.stream = null;
  this.limit(Infinity);
  this.sort(comparator('_key'));
  this.create(fn || function () {
    throw new Error('needs a create function');
  });
  this.rows = {};

  process.nextTick(this.seed.bind(this));
}

List.prototype.seed = function () {
  var self = this;
  self.stream = live(self.db, function (change) {
    var id = change.key;
    var row;

    // delete?
    if (change.type == 'del') {
      row = self.rows[id];
      self.el.removeChild(row._element);
      row.emit('remove');
      delete self.rows[id];
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
        if (cur[prop] != change.value[prop]) {
          cur[prop] = change.value[prop];
          cur.emit('change ' + prop);
        }
      }
      cur.emit('update');
      return;
    }

    // create row
    row = new Emitter();
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

List.prototype.limit = set('limit');
List.prototype.sort = set('sort');
List.prototype.create = set('create');

function live (db, fn) {
  if (!db.createLiveStream) liveStream.install(db);
  return db.createLiveStream().on('data', fn);
}

function set (prop) {
  return function (value) {
    this['_' + prop] = value;
    return this;
  };
}

function merge (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
}
