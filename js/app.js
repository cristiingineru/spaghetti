/* global requirejs,SVG  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['svg', 'svg.draggable', 'app/componentCatalog'], function (s, g, catalog) {
  var cookerSVG = SVG('cookerPlaceholder');
  var resistor = catalog('resistor').create(100, 100).draw(cookerSVG);
  resistor.draggable();
});