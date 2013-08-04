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
 * Insert some demo data, then delete it.
 */

var i = 0;
(function insert () {
  if (i < 5) {
    console.log('insert', i)
    db.put(i+'', (new Date).toString());
  } else if (i < 10) {
    console.log('delete', 5 - (i - 4))
    db.del((5 - (i - 4)) +'');
  } else {
    return;
  }
  i++;
  setTimeout(insert, 1000);
})();
