
# level-list

Map lists of data stored in a LevelDB to DOM elements.

## Example

```js
var List = require('level-list');
var MemDB = require('memdb');

// a levelup style database
var db = MemDB();

// create a list with your db and a function that generates dom elements
var list = List(db, function (row) {
  var el = document.createElement('p');
  el.appendChild(document.createTextNode(row.value));
  return el;
});

// insert the list into the dom
document.body.appendChild(list.el);

// insert some data into the db
(function insert () {
  db.put(Date.now(), (new Date).toString());
  setTimeout(insert, 1000);
})();
```

## API

### List(db[, fn])

Create a new list that pulls data from `db`. Either pass a `fn` that creates
dom elements here or to `List#create`.

### List#create(fn)

`fn` is called with a `row` and should return a dom element. `row` is an
EventEmitter with `key`, `value` as keys. See its events below.

### List#limit(count)

Limit the display to `count` entries.

### List#sort(fn)

Sort the list by the given comparator function, that gets both rows as
arguments.

Use [comparator](https://github.com/juliangruber/comparator) to create
comparators conveniently. This would sort by `row.key` in descending order:

```js
var comparator = require('comparator');

list.sort(comparator.desc('key'));
```

### List#el

The list's dom element.

### Row#on('remove', fn)

A `remove` event is emitted when an already showed row needs to be removed, so
you can clean up if necessary.

### Row#on('update', fn), Row#on('change value', fn)

If you listen for the `update` and/or the `change value` event, your dom
element won't be replaced. Instead, you can use `row`'s updated data to update
it yourself.

This is especially handy when using
[component/reactive](https://github.com/component/reactive), see the
[example](https://github.com/juliangruber/level-list/blob/master/example/reactive.js).

## TODO

* sorting with limit
* infinite scrolling and/or load more
* testling tests

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
