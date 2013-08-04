# Example

## Module dependencies

  var List = require('..');
  var MemDB = require('memdb');

## DB

Set up a LevelUp style db interface.

  var db = MemDB();

## List

Create a list with your db and a function that returns a dom element
per incoming db value.

  var list = List(db, function (title) {
    var el = document.createElement('p');
    el.appendChild(document.createTextNode(title));
    return el;
  });

## DOM

Insert the list's dom element into the dom.

  document.body.appendChild(list.el);

## Data

Insert some demo data.

  (function insert () {
    db.put(Date.now(), (new Date).toString());
    setTimeout(insert, 1000);
  })();

