var liveStream = require('level-live-stream');
var fix = require('level-fix-range');
var Emitter = require('events').EventEmitter;
var deep = require('deep-access');
var comparator = require('comparator');

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);

  this.db = db;
  this.el = document.createElement('div');
  this.stream = null;
  this.limit(Infinity);
  this.sort('_key', 'desc');
  this.create(fn || function () {
    throw new Error('needs a create function');
  });
  this.rows = {};

  process.nextTick(this.seed.bind(this));
}

List.prototype.seed = function (opts) {
  var self = this;
  var sort = comparator[this.sortDir](this.sortKey);
  opts = opts || {};
  opts.reverse = self.sortDir == 'desc';
  
  self.stream = live(self.db, fix(opts), function (change) {
    var id = change.key;
    var row;

    // delete?
    if (change.type == 'del') {
      row = self.rows[id];
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
      .sort(sort);
    // TODO: limit to self._limit, remove/update row if necessary
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
    if (rows.length == self._limit) {
      this.destroy();
      if (self._limit == Infinity) return;
      // TODO: destroy when new stream is made up
      
      if (self.sortDir == 'asc') {
        self.seed({ end: rows[rows.length - 1]._key });
      } else {
        self.seed({ start: rows[0]._key });
      }
    }

  });
};

List.prototype.limit = set('limit');

/**
 * Sort by `key` in `dir` direction.
 *
 * @param {String} key
 * @param {String='desc'} dir
 * @return {List}
 */
 
List.prototype.sort = function (key, dir) {
  if (dir && dir != 'asc' && dir != 'desc') {
    throw new TypeError('direction has to be asc or desc');
  }
  this.sortKey = key;
  this.sortDir = dir;
  return this;
};

List.prototype.create = set('create');

function live (db, fn) {
  return liveStream(db).on('data', fn);
}

function set (prop) {
  return function (value) {
    this[_ + 'prop'] = value;
    return this;
  };
}

function merge (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
}
