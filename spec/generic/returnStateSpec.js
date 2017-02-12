describe("Transition return posibilities", function() {
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: this.initTransition
            },
            on: {
              turn_off: this.turnOffTransition
            },
            off: {
              stop: this.stopTransition
            }
          }
        };
      },
      initTransition : function(fsm, options) {
        // Works by simply returning an string.
        return "on";
      },
      turnOffTransition : function(fsm, options) {
        // Works by simply returning a resolving Promise
        return Promise.resolve('off');
      },
      stopTransition : function(fsm, options) {
        // Works by returning an string following a Promise
        return Promise.resolve().then(function() {
          return 'none'
        });
      }
    });
  });

  it("initial state should be none", function() {
    expect(this.fsm.is("none")).toBe(true);
  });

  describe("Transition 'init' from 'none' to 'on'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(done);
    });

    it("state should be on", function() {
      expect(this.fsm.is("on")).toBe(true);
    });

    describe("Transition 'turn_off' from 'on' to 'off'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('turn_off').finally(done);
      });

      it("state should be off", function() {
        expect(this.fsm.is("off")).toBe(true);
      });

      describe("Transition 'stop' from 'off' to 'none'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('stop').finally(done);
        });

        it("state should be none", function() {
          expect(this.fsm.is("none")).toBe(true);
        });
      });
    });
  });
});
