/* global define, describe, it, xit, expect, dissect, update, updateAll, filter, where, spyOn, jasmine, set, beforeEach, afterEach */


define(['app/checkpointTreeEventHandler', 'Squire'], function (CheckpointTreeEventHandler, Squire) {
  describe('CheckpointTreeEventHandler', function () {
    it('should return a checkpoint event handler', function () {
      expect(CheckpointTreeEventHandler.checkpointEventHandler).not.toBeFalsy();
    });

    describe('checkpoint event handler', function () {
      it('should return a specialized instance with onClick function', function () {
        var checkpoint = {};
        var handler = CheckpointTreeEventHandler.checkpointEventHandler(checkpoint);
        expect(handler.onClick).not.toBeFalsy();
      });

      describe('onClick', function () {
        var newSpaghettiMock = function () {
          // a new mock is created each time to make sure the spies are called for each test
          return {
            state: jasmine.createSpy(),
            redraw: jasmine.createSpy()
          };
        };

        it('should set the state to a specific checkpoint', function (done) {
          new Squire()
            .mock('app/spaghetti', newSpaghettiMock())
            .require(['app/spaghetti', 'app/checkpointTreeEventHandler'], function (Spaghetti2, CheckpointTreeEventHandler2) {
              var checkpoint = {
                  state: {}
                },
                handler = CheckpointTreeEventHandler2.checkpointEventHandler(checkpoint);

              handler.onClick();

              expect(Spaghetti2.state).toHaveBeenCalledWith(checkpoint.state);
              done();
            });
        });

        it('should redraw to reflect the new state', function (done) {
          new Squire()
            .mock('app/spaghetti', newSpaghettiMock())
            .require(['app/spaghetti', 'app/checkpointTreeEventHandler'], function (Spaghetti2, CheckpointTreeEventHandler2) {
              var checkpoint = {
                  state: {}
                },
                handler = CheckpointTreeEventHandler2.checkpointEventHandler(checkpoint);

              handler.onClick();

              expect(Spaghetti2.redraw).toHaveBeenCalled();
              done();
            });
        });
      });

    });
  });
});