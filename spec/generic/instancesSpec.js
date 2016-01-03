describe("Multiple Instances State Machine", function() {
  var fsm1, fsm2;

  beforeEach(function() {
    // First FSM instance
    fsm1 = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: 'green'
            },
            green: {
              warn: 'yellow'
            },
            yellow: {
              panic: 'red',
              clear: 'green'
            },
            red: {
              calm: 'yellow',
              clear: 'green'
            }
          }
        };
      }
    });

    // Second FSM instance
    fsm2 = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: 'on'
            },
            on: {
              stop: 'off'
            },
            off: {
              start: 'on'
            }
          }
        };
      }
    });
  });

  it("fsm1 initial state should be none", function() {
    expect(fsm1.is("none")).toBe(true);
  });

  it("fsm2 initial state should be none", function() {
    expect(fsm2.is("none")).toBe(true);
  });

  describe("fsm1 Transition 'init' from 'none' to 'green'", function() {
    beforeEach(function(done) {
      fsm1.doTransition('init').finally(done);
    });

    it("fsm1 state should be green", function() {
      expect(fsm1.is("green")).toBe(true);
    });
    it("fsm2 state should be none", function() {
      expect(fsm2.is("none")).toBe(true);
    });

    describe("fsm2 Transition 'init' from 'none' to 'on'", function() {
      beforeEach(function(done) {
        fsm2.doTransition('init').finally(done);
      });

      it("fsm1 state should be green", function() {
        expect(fsm1.is("green")).toBe(true);
      });
      it("fsm2 state should be on", function() {
        expect(fsm2.is("on")).toBe(true);
      });

      describe("fsm1 Transition 'warn' from 'green' to 'yellow'", function() {
        beforeEach(function(done) {
          fsm1.doTransition('warn').finally(done);
        });

        it("fsm1 state should be yellow", function() {
          expect(fsm1.is("yellow")).toBe(true);
        });
        it("fsm2 state should be on", function() {
          expect(fsm2.is("on")).toBe(true);
        });

        describe("fsm2 Transition 'stop' from 'on' to 'off'", function() {
          beforeEach(function(done) {
            fsm2.doTransition('stop').finally(done);
          });

          it("fsm1 state should be yellow", function() {
            expect(fsm1.is("yellow")).toBe(true);
          });
          it("fsm2 state should be off", function() {
            expect(fsm2.is("off")).toBe(true);
          });
        });
      });
    });
  });

  describe("fsm2 Transition 'init' from 'none' to 'on'", function() {
    beforeEach(function(done) {
      fsm2.doTransition('init').finally(done);
    });

    it("fsm1 state should be none", function() {
      expect(fsm1.is("none")).toBe(true);
    });
    it("fsm2 state should be on", function() {
      expect(fsm2.is("on")).toBe(true);
    });

    describe("fsm1 Transition 'init' from 'none' to 'green'", function() {
      beforeEach(function(done) {
        fsm1.doTransition('init').finally(done);
      });

      it("fsm1 state should be green", function() {
        expect(fsm1.is("green")).toBe(true);
      });
      it("fsm2 state should be on", function() {
        expect(fsm2.is("on")).toBe(true);
      });
    });
  });
});
