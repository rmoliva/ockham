describe("Statefull State Machine", function() {
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: this.initTransition
            },
            off: {
              start: this.startTransition
            },
            on: {
              stop: this.stopTransition
            }
          }
        };
      },
      nextState: 'on',
      initTransition : function(fsm, options) {
        return Promise.resolve('off', options);
      },
      startTransition : function(fsm, options) {
        return Promise.resolve(fsm.nextState, options).then(function(data) {
          fsm.nextState = 'off';
          return data;
        });
      },
      stopTransition : function(fsm, options) {
        return Promise.resolve(fsm.nextState, options);
      }
    });
  });

  it("initial state should be none", function() {
    expect(this.fsm.is("none")).toBe(true);
  });

  describe("Transition 'init' from 'none' to 'off'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(done);
    });

    it("state should be off", function() {
      expect(this.fsm.is("off")).toBe(true);
    });


    describe("Transition 'start' from 'off' to 'on'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('start').finally(done);
      });

      it("state should be on", function() {
        expect(this.fsm.is("on")).toBe(true);
      });

      describe("Transition 'stop' from 'on' to 'off'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('stop').finally(done);
        });

        it("state should be off", function() {
          expect(this.fsm.is("off")).toBe(true);
        });
      });
    });
  });
});
