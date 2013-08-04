var live = require('level-live-stream');

module.exports = List;

function List (db, fn) {
  if (!(this instanceof List)) return new List(db, fn);
  this.db = db;
  this.el = document.createElement('div');
  this.seed(fn);
}

List.prototype.seed = function (fn) {
  var el = this.el;
  live(this.db).on('data', function (chg) {
    el.appendChild(fn(chg.value));
  });
}
