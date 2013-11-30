/**
 * Module dependencies.
 */

var List = require('..');
var MemDB = require('memdb');
var test = require('tape');

var db = MemDB();

/**
 * Create a list.
 */

var list = List(db, function (row) {
  var el = document.createElement('div');
  el.appendChild(document.createTextNode(row.date));

  row.on('change date', function() {
    el.innerText = row.date;
  });
  return el;
});

/**
 * Insert into dom.
 */

var container = document.createElement('div');
container.appendChild(list.el);
document.body.appendChild(container);

/**
 * Start tests
 */

test('element on page', function(t) {
  t.true(container.firstElementChild.isSameNode(list.el));

  t.test('list empty', function(st) {
    st.equal(list.el.children.length, 0);

    t.end();
  });

  t.end();
});

test('updating list', function(t) {
  var d = (new Date()).toString();

  db.put(Date.now(), { date: d });

  t.test('expect children', function(ts) {
    ts.equal(list.el.children.length, 1);
    ts.end();
  });

  t.test('expect child to contain Date', function(ts) {
    ts.equal(list.el.children[0].innerText, d);
    ts.end();
  });
});

test('list limit', function(t) {
  list.limit(5);

  for(var i = 0 ; i < 10; i++) {
    db.put('key' + i, { date: Date.now() });
  }

  t.test('expect list to contain 5', function(st) {
    st.equal(list.el.children.length, 5);
    st.end();
  });
});

test('elemnt changes', function(t) {
  t.test(function(st) {
    db.put('datekey', { date: 'then' });
    t.equal(list.el.lastElementChild.innerText, 'now');

    t.test(function(st) {
      db.put('datekey', { date: 'now' });
      t.equal(list.el.lastElementChild.innerText, 'now');

      t.end();
    });

    t.end();
  });
});
