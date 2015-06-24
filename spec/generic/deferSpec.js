describe("Defer State Machine", function() {
  
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: 'off'
            },
            off: {
              blink: this.blink
            },
            blink: {
              turn_on: 'on',
            },
            on: {
              turn_off: 'off',
            }
          }
        };
      },
      blink : function(fsm, options) {
        return new Promise(function(resolve, reject) {
          // fsm.deferTransition("on");
          resolve('blink', options);
        });
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.current.getCompleteName()).toBe("none");
  });

  describe("Transition to 'init'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(function() {
        done();
      });
    });

    it("state should be off", function() {
      expect(this.fsm.current.getCompleteName()).toBe("off");
    });

    describe("Transition to 'blink'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('blink').finally(function() {
          done();
        });
      });
      
      it("state should be on", function() {
        expect(this.fsm.current.getCompleteName()).toBe("blink");
      });
    });
  });
});
