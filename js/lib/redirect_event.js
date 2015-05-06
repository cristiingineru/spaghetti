/**
 * @fileoverview redirect an event.
 */

/* global define: false */
/* jshint browser:true */

define([], function () {
  var redirectEvent = function (e, svg) {

    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent('mousedown',
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode);

    svg.dispatchEvent(evt);
  };

  return redirectEvent;
});