(function() {
  'use strict';
  Polymer({
    is: 'paper-typeahead',
    behaviors: [
      Polymer.IronA11yKeysBehavior
    ],
    properties: {
      value: {
        type: String,
        observer: '_valueChanged'
      },
      // private because we don't want the user to set it true if there is no results
      _hideResults: {
        type: Boolean,
        value: false
      },
      label: {
        type: String,
        value: ''
      },
      data: Array,
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
      maxResults: {
        type: Number,
        value: 50
      },
      elevation: {
        type: Number,
        value: 1
      },
      filteredItems: {
        type: Array,
        computed: '_getFiltered(data.*, value, filterFn, maxResults)'
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
    listeners: {
      'iron-activate': '_itemPressed'
    },
    _itemPressed: function(e) {
      this.selectPrediction(e.detail.selected);
    },
    _upPressed: function() {
      this.$.predictions.selectPrevious();
    },
    _downPressed: function() {
      if (!this._hideResults) {
        this.$.predictions.selectNext();
      // if there are results and they are hide
      } else if (this.filteredItems.length) {
        // just show them
        this._hideResults = false;
      }
    },
    _escPressed: function() {
      this.$.predictions.selected = 0;
      this._hideResults = true;
    },
    _enterPressed: function() {
      this.selectPrediction(this.$.predictions.selected);
    },
    _getFiltered: function(data, value, filterFn, maxResults) {
      return filterFn.call(this, data.base, value)
        .slice(0, maxResults);
    },
    _valueChanged: function() {
      this.$.predictions.selected = 0;
      this._hideResults = this.filteredItems.length ? false : true;
    },
    /**
     * Select a prediction by index then hide and reset the predictions.
     */
    selectPrediction: function(selectedIndex) {
      this.value = this.filteredItems[selectedIndex];
      this.$.predictions.selected = 0;
      this._hideResults = true;
    },
    /**
     * Manually display the predictions if the results list is not empty.
     *
     * @return {boolean} True if the predictions are displayed.
     */
    tryDisplayPredictions: function() {
      if (this._hideResults && this.filteredItems.length) {
        this._hideResults = false;
      }
      return !_hideResults;
    },
    /**
     * Manually hide the predictions.
     */
    hidePredictions: function() {
      this._hideResults = true;
    }
  });
})();

