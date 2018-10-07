/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  'use strict';

  Polymer({
    is: 'paper-typeahead',

    behaviors: [
      Polymer.IronA11yKeysBehavior,
      Polymer.PaperInputBehavior,
      Polymer.IronControlState,
      Polymer.IronFormElementBehavior,
      Polymer.Templatizer,
    ],

    properties: {
      sortFn: {type: Function},

      arrowsUpdateInput: {type: Boolean, value: false},

      /**
       * Allows a user to show all typeahead results even when there is no
       * input.
       */
      showEmptyResults: {type: Boolean, value: false},

      typedValue: {type: String, value: '', notify: true},

      elevation: {type: Number, value: 1},

      keyEventTarget: {
        type: Object,
        value: function() {
          return this;
        }
      },

      typeaheadDisabled: {type: Boolean, value: false},

      /**
       * If defined by a user, function is invoked on every keypress. The result
       * of the function is expected to be a Promise that resolves the a data
       * array.
       * @type {boolean|function(string): Promise<Array<?>>}
       */
      fetchData: {value: false},

      data: {
        type: Array,
        value: function() {
          return [];
        }
      },

      /**
       * dataKey provides a way to index into your data objects and use a
       * property for display.
       *
       * For instance if you had an array [{color: 'red'}, {color: 'pink'}], you
       * would set the dataKey to 'color' In more complex situations you can do
       * the following, 'color.name' which will extract from {color: {name:
       * 'red'}}.
       */
      dataKey: {
        type: String,
        value: '',
      },

      /**
       * The max number of results to show to pick from when showing selectable
       * items.
       */
      maxResults: {type: Number, value: 10},

      filteredItems: {
        type: Array,
        notify: true,
        value: [],
      },

      filterFn: {
        type: Function,
        value: function() {
          return function(data, value, dataKey) {
            var r = RegExp(value, 'i');

            if (value === '') {
              return this.showEmptyResults ? data : [];
            }

            return data.filter(v => {
              const normalizedData = this._getDataItemValue(v, dataKey);
              return (r.test(normalizedData) ? normalizedData : null);
            });
          };
        }
      },

      selectorItems: {type: Array},

      // private because we don't want the user to
      // set it true if there is no results
      _hideResults: {type: Boolean, value: true},
    },

    keyBindings: {
      'up': '_upPressed',
      'down': '_downPressed',
      'esc': 'closeResults',
      'enter': '_enterPressed'
    },

    listeners: {
      'iron-activate': '_itemPressed',
      'focus': '_onFocus',
      'blur': '_onBlur',
      // Note: This event is only available in the 1.0 version of this element.
      // In 2.0, the functionality of `_onIronInputReady` is done in
      // PaperInputBehavior::attached.
      'iron-input-ready': '_onIronInputReady'
    },

    observers: [
      '_calculateFilteredData(data.*, typedValue, filterFn, maxResults,' +
          'typeaheadDisabled, dataKey, fetchData)',
    ],

    attached: function() {
      if (!this.ctor) {
        const childTemplate = this.queryEffectiveChildren('template');

        if (childTemplate) {
          const items = this.$['item-list'];
          this.templatize(/** @type {!HTMLTemplateElement} */ (childTemplate));
          items.templatize(/** @type {!HTMLTemplateElement} */ (childTemplate));
        }
      }
    },

    /**
     * Polymer hybrid mode code copied from
     * https://github.com/PolymerElements/paper-input/blob/2.x/paper-input.html
     */

    beforeRegister: function() {
      // Copied from
      // https://github.com/PolymerElements/paper-input/blob/2.x/paper-input.html#L285
      //
      // We need to tell which kind of of template to stamp based on
      // what kind of `iron-input` we got, but because of polyfills and
      // custom elements differences between v0 and v1, the safest bet is
      // to check a particular method we know the iron-input#2.x can have.
      // If it doesn't have it, then it's an iron-input#1.x.
      const ironInput = document.createElement('iron-input');
      const version =
          typeof ironInput._initSlottedInput == 'function' ? 'v2' : 'v1';
      const template = Polymer.DomModule.import('paper-typeahead', 'template');
      const inputTemplate =
          Polymer.DomModule.import('paper-typeahead', 'template#' + version);
      const inputPlaceholder =
          template.content.querySelector('#template-placeholder');
      if (inputPlaceholder) {
        inputPlaceholder.parentNode.replaceChild(
            inputTemplate.content, inputPlaceholder);
      }
      // else it's already been processed, probably in superclass
    },

    /**
     * Returns a reference to the focusable element. Overridden from
     * PaperInputBehavior to correctly focus the native input.
     *
     * @return {!HTMLElement}
     */
    get _focusableElement() {
      return Polymer.Element ? this.inputElement._inputElement :
                               this.inputElement;
    },

    _onIronInputReady: function() {
      // Even though this is only used in the next line, save this for
      // backwards compatibility, since the native input had this ID until 2.0.5.
      if (!this.$.nativeInput) {
        this.$.nativeInput = this.$$('input');
      }
      if (this.inputElement &&
          this._typesThatHaveText.indexOf(this.$.nativeInput.type) !== -1) {
        this.alwaysFloatLabel = true;
      }
      // Only validate when attached if the input already has a value.
      if (!!this.inputElement.bindValue) {
        this.$.container._handleValueAndAutoValidate(this.inputElement);
      }
    },

    /**
     * @private
     * @param {Event} e
     */
    _itemPressed: function(e) {
      this.selectResult(e.detail.selected);
    },

    /**
     * @private
     * @param {Event} e
     */
    _upPressed: function(e) {
      e.preventDefault();

      if (!this._hideResults) {
        this.$.selector.selectPrevious();
        this.value = this.selected && this.arrowsUpdateInput ?
          this.filteredItems[this.selected] : this.typedValue;
      }
    },

    /**
     * @private
     * @param {Event} e
     */
    _downPressed: function(e) {
      e.preventDefault();

      if (!this._hideResults) {
        this.$.selector.selectNext();
        this.value = this.selected && this.arrowsUpdateInput ?
          this.filteredItems[this.selected] : this.typedValue;
        // if there are results and they are hide
      } else if (this.filteredItems.length) {
        // show them and select the first one
        this._hideResults = false;
        this.selected = 0;
      }
    },

    /**
     * @private
     */
    _enterPressed: function() {
      return this.selectResult(this.selected);
    },

    /**
     * @private
     */
    _mouseenterItem: function(e) {
      this.selected = this.$.selector.indexOf(e.target);
    },

    /**
     * @private
     */
    _mouseleaveItems: function() {
      this.selected = 0;
    },

    /**
     * @private
     * @param {{base: Array<?>}} data
     * @param {string} typedValue
     * @param {function(Array, string, string)} filterFn
     * @param {number} maxResults
     * @param {boolean} typeaheadDisabled
     * @param {string} dataKey
     * @param {boolean|function(string): !Promise<Array>} fetchData
     */
    _calculateFilteredData: function(
        data, typedValue, filterFn, maxResults, typeaheadDisabled, dataKey,
        fetchData) {
      Promise.resolve()
          .then(() => {
            if (typeaheadDisabled) {
              return [];
            }

            if (typeof fetchData === 'function') {
              let fetcher = /** @type{function(string)} */ (this.fetchData);

              return fetcher(typedValue);
            }

            return data.base;
          })
          .then(results => {
            if (results) {
              const filteredItems =
                  filterFn.call(this, results, typedValue, dataKey)
                      .slice(0, maxResults);

              this.set('filteredItems', filteredItems);
              this.set('_hideResults', !this._canShowResults(filteredItems));
            }
          });
    },

    /**
     * @private
     * @param {!Array<?>} results
     * @return {boolean}
     */
    _canShowResults: function(results) {
      let elmActive =
          (document.activeElement === this ||
           document.activeElement === this._focusableElement ||
           this.root.activeElement === this._focusableElement);

      return elmActive && results && results.length > 0;
    },

    _updateItems: function() {
      this.selectorItems = Array.from(
          Polymer.dom(this.root).querySelectorAll('.selectable'));
      this.selected = 0;
    },

    /**
     * Select a Result in the filteredItems array by index then
     * close the results.
     *
     * @param {!number} itemIndex The index of the item to select
     */
    selectResult: function(itemIndex) {
      // Since the results can be sorted we need to normalize here.
      var targetResult = (this.sortFn
                          ? this.filteredItems.sort(this.sortFn)
                          : this.filteredItems)[itemIndex];

      if (targetResult === undefined) {
        this.fire('customvalentered', {target: this.typedValue});
      } else {
        this.value = this._getDataItemValue(
          targetResult, this.dataKey);
        this.fire('selected', {target: this.value, targetResult: targetResult});
        this.closeResults();
      }
    },

    /**
     * Manually display the results if the filteredItems array is not empty.
     *
     * @return {boolean} True if the results are displayed.
     */
    tryDisplayResults: function() {
      var items = this.filteredItems;

      if (this._hideResults && this._canShowResults(items)) {
        this.set('_hideResults', false);
      }

      return !this._hideResults;
    },

    getDataDisplayValue: function(data, dataKey) {
      return this._getDataItemValue(data, dataKey);
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

    /**
     * @private
     */
    _onLabelTap: function() {
      this._focusableElement.focus();
    },

    /**
     * @private
     * @param {!string|!Object} data
     * @param {!string} dataKey
     */
    _getDataItemValue: function(data, dataKey) {
      if (this.dataKey === '') {
        return data;
      }

      const splitKey = this.dataKey.split('.');

      if (splitKey.length === 1) {
        return /** @type {!Object} */ (data)[dataKey];
      }

      return splitKey.slice(1).reduce((prev, curr) => {
        return /** @type {!Object} */ (prev)[curr];
      }, data[splitKey[0]]);
    },
  });
})();
