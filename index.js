var liveStream = require('level-live-stream');

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);

  this.db = db;
  this.el = document.createElement('div');
  this.stream = null;
  this._limit = Infinity;
  this.elements = {};

  process.nextTick(this.seed.bind(this, fn));
}

List.prototype.seed = function (fn) {
  var self = this;
  self.stream = live(self.db, function (change) {

    // remove element if update or delete
    if (self.elements[change.key]) {
      self.el.removeChild(self.elements[change.key]);
    }
    if (change.type == 'del') return;

    // insert
    var el = fn(change.value, change.key);
    self.el.appendChild(el);
    self.elements[change.key] = el;

    // limit
    if (self.elements.length == self._limit) {
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
