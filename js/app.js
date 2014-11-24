/* global requirejs,SVG  */

requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app'
  }
});

requirejs(['svg', 'svg.draggable'], function() {
  var cookerSVG = SVG('cookerPlaceholder');  
  var circle = cookerSVG.circle(25, 25, 10);
  circle.draggable();
});