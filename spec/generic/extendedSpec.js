describe("Extended State Machine", function() {
  beforeEach(function() {
    this.fsm = Ockham.create({
      states: {
        none: {
          init: 'initTransition'
        },
        off: {
          start: "startTransition",
          blink: "offBlinkTransition",
          states: {
            blink: {
              cancel: "cancelOffBlinkTransition"
            }
          }
        },
        on: {
          stop: "stopTransition",
          blink: "onBlinkTransition",
          states: {
            blink: {
              cancel: "cancelOnBlinkTransition"
            }
          }
        }
      },
      transitions: {
        initTransition : function(fsm, options) {
          return new Promise(function(resolve, reject) {
            resolve('off', options);
          });
        }, 
        startTransition : function(fsm, options) {
          return new Promise(function(resolve, reject) {
            resolve('on', options);
          });
        },
        stopTransition : function(fsm, options) {
          return new Promise(function(resolve, reject) {
            resolve('off', options);
          });
        }, 
        offBlinkTransition : function(fsm, options) {
          return new Promise(function(resolve, reject) {
            resolve('off-blink', options);
          });
        },
        onBlinkTransition : function(fsm, options) {
          return new Promise(function(resolve, reject) {
            resolve('on-blink', options);
          });
        }, 
        cancelOffBlinkTransition : function(fsm, options) {
          return new Promise(function(resolve, reject) {
            resolve('off', options);
          });
        },
        cancelOnBlinkTransition : function(fsm, options) {
          return new Promise(function(resolve, reject) {
            resolve('on', options);
          });
        } 
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.current.getCompleteName()).toBe("none");
  });

  describe("Transition 'init' from 'none' to 'off'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(done);
    });
    
    it("state should be off", function() {
      expect(this.fsm.current.getCompleteName()).toBe("off");
    });

    describe("Transition 'blink' from 'off' to 'off_blink'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('blink').finally(done);
      });
      
      it("state should be off-blink", function() {
        expect(this.fsm.current.getCompleteName()).toBe("off-blink");
      });
      
      describe("Transition 'cancel' from 'off-blink' to 'off'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('cancel').finally(done);
        });
        
        it("state should be off", function() {
          expect(this.fsm.current.getCompleteName()).toBe("off");
        });
      });

      describe("Transition 'start' from 'off-blink' to 'on'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('start').finally(done);
        });
        
        it("state should be on", function() {
          expect(this.fsm.current.getCompleteName()).toBe("on");
        });
      });
    });      

    describe("Transition 'start' from 'off' to 'on'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('start').finally(done);
      });
      
      it("state should be on", function() {
        expect(this.fsm.current.getCompleteName()).toBe("on");
      });
  
      describe("Transition 'stop' from 'on' to 'off'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('stop').finally(done);
        });
        
        it("state should be off", function() {
          expect(this.fsm.current.getCompleteName()).toBe("off");
        });
      });
      
      describe("Transition 'blink' from 'on' to 'on-blink'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('blink').finally(done);
        });
        
        it("state should be on", function() {
          expect(this.fsm.current.getCompleteName()).toBe("on-blink");
        });
        
        describe("Transition 'cancel' from 'on-blink' to 'on'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('cancel').finally(done);
          });
          
          it("state should be off", function() {
            expect(this.fsm.current.getCompleteName()).toBe("on");
          });
        });
  
        describe("Transition 'stop' from 'on-blink' to 'off'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('stop').finally(done);
          });
          
          it("state should be on", function() {
            expect(this.fsm.current.getCompleteName()).toBe("off");
          });
        });
      });      
    });
  });
});
