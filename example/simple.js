/**
 * Module dependencies.
 */

var List = require('..');
var MemDB = require('memdb');

/**
 * LevelUp style db.
 */

var db = MemDB();

/**
 * Create a list.
 */

var list = List(db, function (title) {
  var el = document.createElement('p');
  el.appendChild(document.createTextNode(title));
  return el;
});

/**
 * Insert into dom.
 */

document.body.appendChild(list.el);

/**
 * Insert some demo data.
 */

(function insert () {
  db.put(Date.now(), (new Date).toString());
  setTimeout(insert, 1000);
})();
