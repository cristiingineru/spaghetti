/* global requirejs,SVG,React,document,a  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['react', 'immutable.min'], function (React, Immutable) {

  /* test1 */
  var text = React.createElement('a', null, 'text');
  React.render(text, document.getElementById('test1'));

  var myComponent = React.createClass({
    render: function () {
      return React.createElement('a', null, '000');
    }
  });


  /* test2 */
  var myElement = React.createElement(myComponent, null, null);
  React.render(myElement, document.getElementById('test2'));


  /* test3 */
  var cerc = React.createElement('circle', {
    cx: 30,
    cy: 30,
    r: 10
  });
  React.render(cerc, document.getElementById('test3'));


  /* test4 */
  var body = React.createElement('rect', {
    width: 20,
    height: 60,
    key: '1',
    stroke: '#006600',
    fill: '#006600'
  });
  var finger = React.createElement('circle', {
    r: 10,
    cx: 50,
    cy: 50,
    key: '2',
    stroke: '#003300',
    fill: '#003300'
  });
  var group = React.createElement('g', null, [body, finger]);
  React.render(group, document.getElementById('test4'));


  /* test5 */

  var fingerClass = React.createClass({
    displayName: 'finger',
    getDefaultProps: function () {
      return {
        x: 0,
        y: 0
      };
    },
    render: function () {
      var radius = 10;
      return React.createElement('circle', {
        r: 10,
        cx: this.props.x + radius / 2,
        cy: this.props.y + radius / 2,
        stroke: '#003300',
        fill: '#003300'
      });
    }
  });

  var bodyClass = React.createClass({
    displayName: 'body',
    getDefaultProps: function () {
      return {
        x: 0,
        y: 0
      };
    },
    render: function () {
      return React.createElement('rect', {
        x: this.props.x,
        y: this.props.y,
        width: 20,
        height: 60,
        key: '1',
        stroke: '#006600',
        fill: '#006600'
      });
    }
  });

  var resistorClass = React.createClass({
    displayName: 'resistor',
    getDefaultProps: function () {
      return {
        x: 0,
        y: 0
      };
    },
    render: function () {
      var finger1 = React.createElement(fingerClass, {
        x: this.props.x + 100,
        y: this.props.y
      });
      var finger2 = React.createElement(fingerClass, {
        x: this.props.x + 30,
        y: this.props.y + 200
      });
      var body = React.createElement(bodyClass, {
        x: this.props.x + 200,
        y: this.props.y + 20
      });
      return React.createElement('g', null, [finger1, finger2, body]);
    }
  });

  var resistor = React.createElement(resistorClass);
  React.render(resistor, document.getElementById('test5'));

});