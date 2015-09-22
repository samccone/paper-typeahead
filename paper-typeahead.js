(function() {
  'use strict';
  Polymer({
    is: 'paper-typeahead',
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
              return v.match(r);
            });
          };
        }
      },
      filteredItems: {
        type: Array,
        computed: 'getFiltered(data, input, filterFn)'
      }
    },
    listeners: {
      'blur': 'onBlur',
    },
    onBlur: function() {
      this.hideResults = true;
    },
    onFocus: function() {
      this.hideResults = false;
    },
    selected: function(e) {
      this.input = e.model.item;
      this.fire('itemSelected', {details: e.model.item});
      this.fire('blur');
    },
    getFiltered: function(data, input, filterFn) {
      return filterFn.call(this, data, input);
    }
  });
})();

