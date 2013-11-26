/**
 * Module dependencies.
 */

var List = require('..');
var MemDB = require('memdb');
require('insert-css')(require('./style'));

/**
 * LevelUp style db.
 */

var db = MemDB();

/**
 * Create a list wrapped in an unordered list.
 */

var list = List(db, 'ul', function (row) {
  var el = document.createElement('li');
  el.appendChild(document.createTextNode(row.date));
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
  db.put(Date.now(), { date: (new Date).toString() });
  setTimeout(insert, 1000);
})();
