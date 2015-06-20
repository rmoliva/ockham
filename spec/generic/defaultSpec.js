describe("Default State Machine", function() {
  
  beforeEach(function() {
    this.fsm = Ockham.create({
      states: {
        none: {
          init: 'green'
        },
        green: {
          warn: 'yellow',
          blink: 'green-blink',
          states: {
            blink: {
              cancel: 'green'
            }
          }
        },
        yellow: {
          panic: 'red',
          clear: 'green',
          blink: 'yellow-blink',
          states: {
            blink: {
              cancel: 'yellow'
            }
          }
        },
        red: {
          calm: 'yellow',
          clear: 'green',
          blink: 'red-blink',
          states: {
            blink: {
              clear_blink: 'green-blink'
            }
          }
        } 
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.current.getCompleteName()).toBe("none");
  });

  describe("Transition 'init' from 'none' to 'green'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').then(function() {
        done();
      });
    });

    it("state should be green", function() {
      expect(this.fsm.current.getCompleteName()).toBe("green");
    });
    
    describe("Transition 'blink' from 'green' to 'green-blink'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('blink').then(done);
      });
      
      it("state should be green-blink", function() {
        expect(this.fsm.current.getCompleteName()).toBe("green-blink");
      });
      
      describe("Transition 'cancel' from 'green-blink' to 'green'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('cancel').then(done);
        });
        
        it("state should be green", function() {
          expect(this.fsm.current.getCompleteName()).toBe("green");
        });
      });
    });

    describe("Transition 'warn' from 'green' to 'yellow'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('warn').then(done);
      });
      
      it("state should be yellow", function() {
        expect(this.fsm.current.getCompleteName()).toBe("yellow");
      });
      
      describe("Transition 'panic' from 'yellow' to 'red'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('panic').then(done);
        });
        
        it("state should be red", function() {
          expect(this.fsm.current.getCompleteName()).toBe("red");
        });
        
        describe("Transition 'calm' from 'red' to 'yellow'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('calm').then(done);
          });
          
          it("state should be yellow", function() {
            expect(this.fsm.current.getCompleteName()).toBe("yellow");
          });
        });
        
        describe("Transition 'clear' from 'red' to 'green'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('clear').then(done);
          });
          
          it("state should be green", function() {
            expect(this.fsm.current.getCompleteName()).toBe("green");
          });
        });
        
        describe("Transition 'blink' from 'red' to 'red-blink'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('blink').then(done);
          });
          
          it("state should be red-blink", function() {
            expect(this.fsm.current.getCompleteName()).toBe("red-blink");
          });
          
          describe("Transition 'clear_blink' from 'red-blink' to 'green-blink'", function() {
            beforeEach(function(done) {
              this.fsm.doTransition('clear_blink').then(done);
            });
            
            it("state should be green-blink", function() {
              expect(this.fsm.current.getCompleteName()).toBe("green-blink");
            });
          });
          
        });
      });
      
      describe("Transition 'clear' from 'yellow' to 'green'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('clear').then(done);
        });
        
        it("state should be green", function() {
          expect(this.fsm.current.getCompleteName()).toBe("green");
        });
      });

      describe("Transition 'blink' from 'yellow' to 'yellow-blink'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('blink').then(done);
        });
        
        it("state should be yellow-blink", function() {
          expect(this.fsm.current.getCompleteName()).toBe("yellow-blink");
        });
        
        describe("Transition 'cancel' from 'yellow-blink' to 'yellow'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('cancel').then(done);
          });
          
          it("state should be yellow", function() {
            expect(this.fsm.current.getCompleteName()).toBe("yellow");
          });
        });
      });
    });
    
    
    
  });
  
  
  
});
