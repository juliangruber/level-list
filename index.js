var live = require('level-live-stream');

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);

  this.db = db;
  this.el = document.createElement('div');
  this.stream = null;
  this.received = null;
  this._limit = Infinity;

  process.nextTick(this.seed.bind(this, fn));
}

List.prototype.seed = function (fn) {
  var self = this;
  self.stream = live(self.db);
  self.stream.on('data', function (chg) {
    self.el.appendChild(fn(chg.value, chg.key));
    if (++self.received == self._limit) {
      self.stream.destroy();
    }
  });
};

List.prototype.limit = function (count) {
  this._limit = count;
};
