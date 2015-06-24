describe("Extended State Machine", function() {
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: this.initTransition
            },
            off: {
              start: this.startTransition,
              blink: this.offBlinkTransition,
              states: {
                blink: {
                  cancel: this.cancelOffBlinkTransition
                }
              }
            },
            on: {
              stop: this.stopTransition,
              blink: this.onBlinkTransition,
              states: {
                blink: {
                  cancel: this.cancelOnBlinkTransition
                }
              }
            }
          }
        };
      },
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

    describe("Transition 'blink' from 'off' to 'off_blink'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('blink').finally(done);
      });
      
      it("state should be off-blink", function() {
        expect(this.fsm.is("off-blink")).toBe(true);
      });
      
      describe("Transition 'cancel' from 'off-blink' to 'off'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('cancel').finally(done);
        });
        
        it("state should be off", function() {
          expect(this.fsm.is("off")).toBe(true);
        });
      });

      describe("Transition 'start' from 'off-blink' to 'on'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('start').finally(done);
        });
        
        it("state should be on", function() {
          expect(this.fsm.is("on")).toBe(true);
        });
      });
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
      
      describe("Transition 'blink' from 'on' to 'on-blink'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('blink').finally(done);
        });
        
        it("state should be on", function() {
          expect(this.fsm.is("on-blink")).toBe(true);
        });
        
        describe("Transition 'cancel' from 'on-blink' to 'on'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('cancel').finally(done);
          });
          
          it("state should be off", function() {
            expect(this.fsm.is("on")).toBe(true);
          });
        });
  
        describe("Transition 'stop' from 'on-blink' to 'off'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('stop').finally(done);
          });
          
          it("state should be on", function() {
            expect(this.fsm.is("off")).toBe(true);
          });
        });
      });
    });
  });
});
