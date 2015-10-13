(function() {
  'use strict';
  Polymer({
    is: 'paper-typeahead',
    behaviors: [
      Polymer.IronA11yKeysBehavior
    ],
    properties: {
      input: {
        type: String,
        observer: '_inputChanged'
      },
      // private because we don't want the user to set it true if there is no results
      _hideResults: {
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
        computed: '_getFiltered(data.*, input, filterFn, maxResults)'
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
    _getFiltered: function(data, input, filterFn, maxResults) {
      return filterFn.call(this, data.base, input)
        .slice(0, maxResults);
    },
    _inputChanged: function() {
      this.$.predictions.selected = 0;
      this._hideResults = this.filteredItems.length ? false : true;
    },
    selectPrediction: function(selected) {
      this.input = this.filteredItems[selected];
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

