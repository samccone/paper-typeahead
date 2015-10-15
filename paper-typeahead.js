(function() {
  'use strict';
  Polymer({
    is: 'paper-typeahead',
    behaviors: [
      Polymer.IronA11yKeysBehavior,
      Polymer.IronSelectableBehavior,
    ],
    properties: {
      disabled: {
        type: Boolean,
        value: false
      },
      value: {
        type: String,
        observer: '_valueChanged'
      },
      label: {
        type: String,
        value: ''
      },
      elevation: {
        type: Number,
        value: 1
      },
      keyEventTarget: {
        type: Object,
        value: function() {
          return this;
        }
      },
      typeaheadDisabled: {
        type: Boolean,
        value: false
      },
      data: Array,
      query: String,
      maxResults: {
        type: Number,
        value: 10
      },
      filteredItems: {
        type: Array,
        computed: '_getFiltered(data.*, value, filterFn, maxResults,' +
        'typeaheadDisabled)',
        notify: true
      },
      filterFn: {
        type: Function,
        value: function() {
          return function(data, value) {
            var r = RegExp(value, 'i');

            if (value === '') {
              return [];
            }

            return data.filter(function(v) {
              return (r.test(v) ? v : null);
            });
          };
        }
      },
      // private because we don't want the user to set it true if there is no results
      _hideResults: {
        type: Boolean,
        value: false
      },
    },
    keyBindings: {
      'up': '_upPressed',
      'down': '_downPressed',
      'esc': '_escPressed',
      'enter': '_enterPressed'
    },
    listeners: {
      'iron-activate': '_itemPressed'
    },
    _itemPressed: function(e) {
      this.selectResult(e.detail.selected);
    },
    _upPressed: function() {
      if (!this._hideResults) {
        this.selectPrevious();
      }
    },
    _downPressed: function() {
      if (!this._hideResults) {
        this.selectNext();
      // if there are results and they are hide
      } else if (this.filteredItems.length) {
        // just show them
        this._hideResults = false;
      }
    },
    _escPressed: function() {
      this.selected = 0;
      this._hideResults = true;
    },
    _enterPressed: function() {
      this.selectResult(this.selected);
    },
    _valueChanged: function() {
      this.selected = 0;
      this._hideResults = this.filteredItems.length ? false : true;
    },
    _blur: function() {
      // paper-item gain focus on-tap so _blur is called too early
      // this.closeResults();
    },
    _mouseoverItem: function(e) {
      this.select(this.indexOf(e.target));
    },
    _getFiltered: function(
      data, value, filterFn, maxResults, typeaheadDisabled) {
      if (typeaheadDisabled) { return []; }
      return filterFn.call(this, data.base, value)
        .slice(0, maxResults);
    },
    get items() {
      return Array.from(this.querySelectorAll('.selectable'));
    },
    /**
     * Select a Result in the filteredItems array by index then close the results.
     *
     * @param {Number} itemIndex The index of the item to select
     */
    selectResult: function(itemIndex) {
      this.value = this.filteredItems[itemIndex];
      this.closeResults();
    },
    /**
     * Manually display the results if the filteredItems array is not empty.
     *
     * @return {Boolean} True if the results are displayed.
     */
    tryDisplayResults: function() {
      if (this._hideResults && this.filteredItems.length) {
        this._hideResults = false;
      }
      return !_hideResults;
    },
    /**
     * Manually hide the results.
     */
    hideResults: function() {
      this._hideResults = true;
    },
    /**
     * Manually hide the results and reset selected item.
     */
    closeResults: function() {
      this._hideResults = true;
      this.selected = 0;
    }
  });
})();
