describe("Extended State Machine", function() {
  beforeEach(function() {
    this.fsm = Ockham.create({
      states: {
        none: {
          init: 'off'
        },
        off: {
          start: new Promise(function(resolve, reject) {
            resolve('on');
          }),
        },
        on: {
          stop: new Promise(function(resolve, reject) {
            resolve('off');
          }),
        }
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.current.getCompleteName()).toBe("none");
  });

  describe("Transition 'init' from 'none' to 'off'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').then(done);
    });
    
    it("state should be off", function() {
      expect(this.fsm.current.getCompleteName()).toBe("off");
    });

    describe("Transition 'start' from 'off' to 'on'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('start').then(done);
      });
      
      it("state should be on", function() {
        expect(this.fsm.current.getCompleteName()).toBe("on");
      });
  
      describe("Transition 'stop' from 'on' to 'off'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('stop').then(done);
        });
        
        it("state should be off", function() {
          expect(this.fsm.current.getCompleteName()).toBe("off");
        });
      });
    });
  });
});
