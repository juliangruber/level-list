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
 * Create a list.
 */

var list = List(db)
  .create(function (row) {
    var el = document.createElement('p');
    el.appendChild(document.createTextNode(row.value));
    return el;
  })
  .sort(function (a, b) {
    return b.key - a.key;
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
