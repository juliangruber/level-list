/**
 * Module dependencies.
 */

var List = require('..');
var MemDB = require('memdb');
var reactive = require('reactive-component');
var domify = require('domify');
require('insert-css')(require('./style'));

/**
 * LevelUp style db.
 */

var db = MemDB();

/**
 * Create a list.
 */

var tmpl = '<div><p data-text="value"></p></div>';

var list = List(db, function (row) {
  var view = reactive(domify(tmpl), row);
  return view.el;
});

/**
 * Insert into dom.
 */

document.body.appendChild(list.el);

/**
 * Insert some demo data, then update it.
 */

var i = 0;
(function insert () {
  if (i < 5) {
    db.put(i+'', (new Date).toString());
  } else if (i < 10) {
    db.put((5 - (i - 4)) +'', (new Date).toString());
  } else {
    return;
  }
  i++;
  setTimeout(insert, 1000);
})();
