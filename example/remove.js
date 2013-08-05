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

var list = List(db, function (row) {
  var el = document.createElement('p');
  el.appendChild(document.createTextNode(row.date));
  row.on('remove', function () {
    console.log('removed');
  });
  return el;
});

/**
 * Insert into dom.
 */

document.body.appendChild(list.el);

/**
 * Insert some demo data, then delete it.
 */

var i = 0;
(function insert () {
  if (i < 5) {
    db.put(i+'', { date: (new Date).toString() });
  } else if (i < 10) {
    db.del((5 - (i - 4)) +'');
  } else {
    return;
  }
  i++;
  setTimeout(insert, 1000);
})();
