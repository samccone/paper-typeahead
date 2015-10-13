(function() {
  'use strict';
  Polymer({
    is: 'paper-typeahead',
    behaviors: [
      Polymer.IronA11yKeysBehavior
    ],
    properties: {
      input: String,
      hideResults: {
        type: Boolean,
        value: false
      },
      inputLabel: {
        type: String,
        value: ''
      },
      data: Array,
      filterFn: {
        type: Function,
        value: function() {
          return function(data, input) {
            var r = RegExp(input, 'i');

            if (input === '') {
              return [];
            }

            return data.filter(function(v) {
              return (r.test(v) ? v : null);
            });
          };
        }
      },
      maxResults: {
        type: Number,
        value: 50
      },
      resultsElevation: {
        type: Number,
        value: 1
      },
      filteredItems: {
        type: Array,
        computed: 'getFiltered(data.*, input, filterFn, maxResults)'
      },
      keyEventTarget: {
        type: Object,
        value: function() {
          return this;
        }
      },
    },
    keyBindings: {
      'up': '_upPressed',
      'down': '_downPressed',
      'esc': '_escPressed',
      'enter': '_enterPressed'
    },
    _upPressed: function() {
    },
    _downPressed: function() {
    },
    _escPressed: function() {
    },
    _enterPressed: function() {
    },
    getFiltered: function(data, input, filterFn, maxResults) {
      return filterFn.call(this, data.base, input)
        .slice(0, maxResults);
    },
  });
})();

