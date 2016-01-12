(function() {
  'use strict';

  Polymer({
    is: 'paper-typeahead',

    behaviors: [
      Polymer.IronA11yKeysBehavior,
      Polymer.IronSelectableBehavior,
      Polymer.PaperInputBehavior,
      Polymer.IronControlState,
      Polymer.IronFormElementBehavior
    ],

    properties: {
      arrowsUpdateInput: {
        type: Boolean,
        value: false
      },

      showEmptyResults: {
        type: Boolean,
        value: false
      },

      typedValue: {
        type: String,
        observer: '_typedValueChanged',
        value: '',
        notify: true
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

      data: {
        type: Array,
        value: function() { return []; }
      },

      maxResults: {
        type: Number,
        value: 10
      },

      filteredItems: {
        type: Array,
        computed: '_getFiltered(data.*, typedValue, filterFn, maxResults,' +
        'typeaheadDisabled)',
        notify: true
      },

      filterFn: {
        type: Function,
        value: function() {
          return function(data, value) {
            var r = RegExp(value, 'i');

            if (value === '') {
              return this.showEmptyResults ? data : [];
            }

            return data.filter(function(v) {
              return (r.test(v) ? v : null);
            });
          };
        }
      },

      // private because we don't want the user to
      // set it true if there is no results
      _hideResults: {
        type: Boolean,
        value: true
      },
    },

    keyBindings: {
      'up': '_upPressed',
      'down': '_downPressed',
      'esc': '_escPressed',
      'enter': '_enterPressed'
    },

    listeners: {
      'iron-activate': '_itemPressed',
      'focus': '_onFocus',
      'blur': '_onBlur',
    },

    /**
     * @private
     * @param {Event} e
     */
    _itemPressed: function(e) {
      // if pressed item is not paper-input-container
      if (e.detail.selected) {
        this.selectResult(e.detail.selected - 1);
      }
    },

    /**
     * @private
     */
    _upPressed: function() {
      if (!this._hideResults) {
        this.selectPrevious();
        this.value = this.selected && this.arrowsUpdateInput ?
          this.filteredItems[this.selected - 1] : this.typedValue;
      }
    },

    /**
     * @private
     */
    _downPressed: function() {
      if (!this._hideResults) {
        this.selectNext();
        this.value = this.selected && this.arrowsUpdateInput ?
          this.filteredItems[this.selected - 1] : this.typedValue;
      // if there are results and they are hide
      } else if (this.filteredItems.length) {
        // show them and select the first one
        this._hideResults = false;
        this.selected = 1;
      }
    },

    /**
     * @private
     */
    _escPressed: function() {
      this.selected = 0;
      this._hideResults = true;
    },

    /**
     * @private
     */
    _enterPressed: function() {
      // -1 since paper-input-container is part of
      // selectable array, index is shifted
      if (this.selected > 0) {
        this.selectResult(this.selected - 1);
      }
    },

    /**
     * @private
     */
    _typedValueChanged: function() {
      var hasItems = this.filteredItems && this.filteredItems.length;
      this._hideResults = !hasItems;
    },

    /**
     * @private
     */
    _mouseenterItem: function(e) {
      this.select(this.indexOf(e.target));
    },

    /**
     * @private
     */
    _mouseleaveItems: function() {
      this.selected = 0;
    },

    /**
     * @private
     * @return {Array}
     */
    _getFiltered: function(
      data, typedValue, filterFn, maxResults, typeaheadDisabled) {
      if (typeaheadDisabled) { return []; }
      return filterFn.call(this, data.base, typedValue)
        .slice(0, maxResults);
    },

    _updateItems: function() {
      this._setItems(
        Array.from(
          Polymer.dom(this.root).querySelectorAll('.selectable')
        )
      );
      this.selected = 1;
      this._updateSelected();
    },

    /**
     * Select a Result in the filteredItems array by index then
     * close the results.
     *
     * @param {!number} itemIndex The index of the item to select
     */
    selectResult: function(itemIndex) {
      this.typedValue = this.value = this.filteredItems[itemIndex];

      this.fire('selected', {target: this.value});
      this.closeResults();
    },

    /**
     * Manually display the results if the filteredItems array is not empty.
     *
     * @return {boolean} True if the results are displayed.
    */
    tryDisplayResults: function() {
      var items = this.filteredItems;

      if (this._hideResults && items && items.length) {
        this.set('_hideResults', false);
      }

      return !this._hideResults;
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
    },

    /**
     * Stop the _onBlur event from firing when scrollbar is clicked.
     *
     * @param {!Event} e
     */
    _mouseDownItems: function(e) {
      e.preventDefault();
    },

    /**
     * @private
     */
    _onFocus: function() {
      this.tryDisplayResults();
    },

    /**
     * @private
     */
    _onBlur: function() {
      this.closeResults();
    },
  });
})();
