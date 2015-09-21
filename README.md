### Paper typeahead

![screen shot 2015-09-20 at 9 31 46 pm](https://cloud.githubusercontent.com/assets/883126/9985336/0e049bae-5fdf-11e5-9ccf-e3122a8b1cc8.png)

#### API

* data - **required** an array of your data
* input-label - **optional** the label for your input
* filter-fn - **optional** your filter by logic
```js
function(data, input) { return data; }
```

#### Events

* `on-item-selected`: e.details === item that was tapped

#### Todo

* [ ] Add tab / enter result selection
* [ ] Add conditional empty list template
* [ ] Use iron-list to display results
* [ ] Add better style interface
* [ ] Any other ideas welcome 🎷
