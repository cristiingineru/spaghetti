/* global define, require */


define(['React', 'immutable.min', 'app/core', 'app/component-catalog'], function (React, Immutable, Core, Catalog) {

  var checkpointTreeClass = React.createClass({
    displayName: 'checkpointTree',
    getDefaultProps: function () {
      return {
        model: null
      };
    },
    render: function () {

    }
  });


  return {
    class: function () {
      return checkpointTreeClass;
    }
  };
});