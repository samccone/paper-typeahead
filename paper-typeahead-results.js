(function() {
  'use strict';

  Polymer({
    is: 'paper-typeahead-results',
    properties: {
      results: Array,
      selectable: {
        type: String,
        value: '.result-item'
      }
    },
    observers: [
      'updateSelectable(results, selectable)'
    ],
    behaviors: [
      Polymer.IronMenuBehavior
    ],
    updateSelectable: function() {
      this.async(function() {
        this._resetTabindices();
      });
    },
    onKeyPress: function(e) {
      if (e.which === 13) {
        this.onSelected(e);
      }
    },
    onSelected: function(e) {
      this.fire('selected', {target: e.model.item});
    },
    // https://github.com/PolymerElements/iron-selector/blob/master/iron-selectable.html#L153
    // is not working as expected
    get items() {
      return Array.from(
          this.querySelectorAll(this.selectable));
    }
  });
})();
