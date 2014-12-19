/* global requirejs,SVG,React,document,a  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['react', 'immutable.min', 'immutable.cursor'], function (React, Immutable, Cursor) {

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


  /* test 6 - getting from the cursor */

  var state = Immutable.fromJS({
    a: 'A',
    b: {
      b00: 'B00',
      b01: {g: 'G'}
    },
    c: ['C0', 'C1', 'C2']
  });

  var cursor = Cursor.from(state, function(newState) {
    state = newState;
  });
  var b_v1 = cursor.getIn('b');
  var b_v2 = cursor.getIn(['b']);
  var b00_v1 = cursor.getIn(['b', 'b00']);

  var g_v1 = b_v1.getIn(['b01', 'g']);

  //don't call the getIn of a subcorsuor and passing a simple string, it doesn't work
  //var g_v2 = b_v1.getIn(['b01']).deref();

  var g_v2 = b_v1.getIn(['b01']).deref();


  /* test 7 - changing using the cursor */

  var state = Immutable.fromJS({
    a: 'A',
    b: {
      b00: 'B00',
      b01: {g: 'G'}
    },
    c: ['C0', 'C1', 'C2']
  });

  var cursor2 = Cursor.from(state, function(newState) {
    state = newState;
  });

  // updating a direct child
  var r1 = cursor2.update('c', function(v) { return 'new C'; });

  // updating a deep element
  var b_v3 = cursor2.getIn(['b']);
  var r2 = b_v3.update('b00', function(v) { return 'new B00'; });

  // deleting an element
  var b_v4 = cursor2.getIn('b');
  var r3 = b_v4.delete('b01');

  // adding an element to a map
  var b_v5 = cursor2.getIn('b');
  var r4 = b_v5.set('b02', 'the new B02');

  // adding an element to an array
  var c_v1 = cursor2.getIn('c');
  var r5 = c_v1.set(0, 'new C0'); // note the channing!
  var r6 = r5.set(3, 'new C3');
  var r7 = r6.set(5, 'new C5');
});