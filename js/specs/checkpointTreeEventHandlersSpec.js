/* global define, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine, set, beforeEach, afterEach */


define(['app/checkpointTreeEventHandlers', 'immutable.min', 'app/checkpointTree'], function (CheckpointTreeEventHandlers, Immutable, CheckpointTree) {
  describe('CheckpointTreeEventHandlers', function () {
    it('should return a checkpoint and an svg event handlers', function () {
      expect(CheckpointTreeEventHandlers.CheckpointEventHandler).not.toBeFalsy();
      expect(CheckpointTreeEventHandlers.SvgEventHandler).not.toBeFalsy();
    });

    describe('CheckpointEventHandler', function () {
      it('should return a specialized instance with onClick function', function () {
        var handler = new CheckpointTreeEventHandlers.CheckpointEventHandler();

        expect(handler.onClick).not.toBeFalsy();
      });

      describe('onClick', function () {
        var newSpaghettiMock = function () {
          // a new mock is created each time to make sure the spies are called for each test
          return {
            setUndoRedoStacks: jasmine.createSpy(),
            redraw: jasmine.createSpy()
          };
        };

        var nextId = 0,
          id = function () {
            var id = nextId;
            nextId += 1;
            return id;
          },
          dummyCheckpoint = function (name, previous) {
            return {
              name: name,
              id: id(),
              timestamp: Date.now(),
              previousCheckpointId: previous && previous.id
            };
          };

        it('should pass to Spaghetti the new undo and the redo stacks accordingly to the new current checkpoint', function () {
          var c11 = dummyCheckpoint('c11'),
            c21 = dummyCheckpoint('c21', c11),
            c31 = dummyCheckpoint('c31', c21),
            c311 = dummyCheckpoint('c311', c31),
            c32 = dummyCheckpoint('c32', c21),
            c321 = dummyCheckpoint('c321', c32),
            checkpoints = Immutable.Seq.of(c11, c21, c31, c311, c32, c321),
            currentCheckpoint = c31,
            rootNode = CheckpointTree.buildTree(checkpoints, currentCheckpoint),
            toBeTheNewCurrentCheckpoint = c32,
            setUndoRedoStacks = jasmine.createSpy(),
            markCurrentCheckpoint = CheckpointTree.markCurrentCheckpoint,
            handler = new CheckpointTreeEventHandlers.CheckpointEventHandler(
              toBeTheNewCurrentCheckpoint, rootNode, markCurrentCheckpoint, setUndoRedoStacks);

          handler.onClick();

          var calls = setUndoRedoStacks.calls,
            args = calls.argsFor(0);
          expect(calls.count()).toBe(1);
          expect(Immutable.Stack.isStack(args[0])).toBe(true);
          expect(args[0].contains(c11)).toBe(true);
          expect(args[0].contains(c21)).toBe(true);
          expect(args[0].contains(c32)).toBe(true);
          expect(args[0].contains(c31)).toBe(false);
          expect(args[0].contains(c311)).toBe(false);

          expect(Immutable.Stack.isStack(args[1])).toBe(true);
          expect(args[1].count()).toBe(1);
          expect(args[1].contains(c321)).toBe(true);
        });
      });

    });

    describe('SvgEventHandler', function () {

      var newDummySvg = function () {
          return {
            addEventListener: jasmine.createSpy()
          };
        },
        newDummySvgAndHandlers = function () {
          var that = this;
          this.dummySvg = {
            addEventListener: function (name, handler) {
              if (name === 'mousedown') {
                that.onMouseDown = handler;
              } else if (name === 'mousemove') {
                that.onMouseMove = handler;
              } else if (name === 'mouseup') {
                that.onMouseUp = handler;
              }
            }
          };
          return this;
        };

      it('should return a specialized instance with deltaX, deltaY and setCheckpointsRedraw functions', function () {
        var handler = new CheckpointTreeEventHandlers.SvgEventHandler(newDummySvg());

        expect(handler.deltaX).not.toBeFalsy();
        expect(handler.deltaY).not.toBeFalsy();
        expect(handler.setCheckpointsRedraw).not.toBeFalsy();
      });

      describe('deltaX() and deltaY()', function () {
        it('should return a default value when svg not moved', function () {
          var handler = new CheckpointTreeEventHandlers.SvgEventHandler(newDummySvg());

          expect(handler.deltaX()).toEqual(jasmine.any(Number));
          expect(handler.deltaY()).toEqual(jasmine.any(Number));
        });

        it('should should attach mouse handlers to the svg', function () {
          var dummySvg = newDummySvg(),
            handler = new CheckpointTreeEventHandlers.SvgEventHandler(dummySvg);

          expect(dummySvg.addEventListener).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
          expect(dummySvg.addEventListener).toHaveBeenCalledWith('mousemove', jasmine.any(Function));
          expect(dummySvg.addEventListener).toHaveBeenCalledWith('mouseup', jasmine.any(Function));
        });

        it('should return an deltaX and deltaY corresponding to current svg pan', function () {
          var dummySvgAndHandlers = newDummySvgAndHandlers(),
            handler = new CheckpointTreeEventHandlers.SvgEventHandler(dummySvgAndHandlers.dummySvg),
            initialDeltaX = handler.deltaX(),
            initialDeltaY = handler.deltaY();

          var mouseDownX = 40,
            mouseDownY = 50,
            mouseMoveX = 44,
            mouseMoveY = 55;
          dummySvgAndHandlers.onMouseDown({
            clientX: mouseDownX,
            clientY: mouseDownY
          });
          dummySvgAndHandlers.onMouseMove({
            clientX: mouseMoveX,
            clientY: mouseMoveY
          });
          expect(initialDeltaX - handler.deltaX()).toBe(mouseDownX - mouseMoveX);
          expect(initialDeltaY - handler.deltaY()).toBe(mouseDownY - mouseMoveY);

          var mouseUpX = 88,
            mouseUpY = 110;
          dummySvgAndHandlers.onMouseUp({
            clientX: mouseUpX,
            clientY: mouseUpY
          });
          expect(initialDeltaX - handler.deltaX()).toBe(mouseDownX - mouseUpX);
          expect(initialDeltaY - handler.deltaY()).toBe(mouseDownY - mouseUpY);
        });
      });
    });
  });
});