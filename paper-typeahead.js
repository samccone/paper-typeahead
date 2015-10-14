(function() {
  'use strict';

  Polymer({
    is: 'paper-typeahead',

    behaviors: [
      Polymer.IronA11yKeysBehavior,
      Polymer.IronTypeaheadBehavior,
    ],

    properties: {
      disabled: false,

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
      this.selectPrediction(e.detail.selected);
    },

    _upPressed: function() {
      if (!this._hideResults) {
        this.$.predictions.selectPrevious();
      }
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

    _valueChanged: function() {
      this.$.predictions.selected = 0;
      this._hideResults = this.filteredItems.length ? false : true;
    },

    _blur: function() {
      // paper-item gain focus on-tap so _blur is called too early
      // this.closePredictions();
    },

    /**
     * Select a prediction by index then close the predictions.
     *
     * @param {Number} itemIndex The index of the item to select
     */
    selectPrediction: function(itemIndex) {
      this.value = this.filteredItems[itemIndex];
      this.closePredictions();
    },

    /**
     * Manually display the predictions if the results list is not empty.
     *
     * @return {Boolean} True if the predictions are displayed.
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
    },

    /**
     * Manually hide the predictions and reset selected.
     */
    closePredictions: function() {
      this._hideResults = true;
      this.selected = 0;
    }

  });
})();
