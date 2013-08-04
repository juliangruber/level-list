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

    // delete?
    if (change.type == 'del') {
      self.el.removeChild(self.elements[change.key]);
      return;
    }

    // create element
    var el = fn(change.value, change.key);
    var old = self.elements[change.key];
    self.elements[change.key] = el;

    // update?
    if (old) {
      self.el.replaceChild(el, old);
      return;
    }

    // insert
    self.el.appendChild(el);
    if (self.elements.length == self._limit) this.destroy();

  });
};

List.prototype.limit = function (count) {
  this._limit = count;
};

function live (db, fn) {
  return liveStream(db).on('data', fn);
}
