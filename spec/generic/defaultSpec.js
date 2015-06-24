describe("Default State Machine", function() {
  
  var checkReturn = function(expectedEventData) {
    return function(eventData) {
      expect(eventData.from).toBe(expectedEventData.from);
      expect(eventData.to).toBe(expectedEventData.to);
      expect(eventData.transition).toBe(expectedEventData.transition);
      expect(eventData.options).toBe(expectedEventData.options);
    };
  };
  
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
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
        };
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.current.getCompleteName()).toBe("none");
  });

  it("should return eventData correctly", function(done) {
    var options = {one: "One", two: "two"}
    this.fsm.doTransition('init', options).then(checkReturn({
      from: 'none',
      to: 'green',
      transition: 'init',
      options: options
    })).finally(done);
  });
  
  describe("Transition to 'warn'", function() {
    it("should fail", function(done) {
      this.fsm.doTransition('warn').catch(function(error) {
        expect(error.name).toBe("OckhamError");
        expect(error.message).toBe("No transition 'warn' in state: 'none'");
      }).finally(done);
    });
  });

  describe("Transition 'init' from 'none' to 'green'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(done);
    });

    it("state should be green", function() {
      expect(this.fsm.current.getCompleteName()).toBe("green");
    });
    
    it("return eventDataCorrectly", function() {
      expect(this.fsm.current.getCompleteName()).toBe("green");
    });
    
    describe("Transition to 'panic'", function() {
      it("should fail", function(done) {
        this.fsm.doTransition('panic').catch(function(error) {
          expect(error.name).toBe("OckhamError");
          expect(error.message).toBe("No transition 'panic' in state: 'green'");
        }).finally(done);
      });
    });
    
    
    describe("Transition 'blink' from 'green' to 'green-blink'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('blink').finally(done);
      });
      
      it("state should be green-blink", function() {
        expect(this.fsm.current.getCompleteName()).toBe("green-blink");
      });
      
      describe("Transition 'cancel' from 'green-blink' to 'green'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('cancel').finally(done);
        });
        
        it("state should be green", function() {
          expect(this.fsm.current.getCompleteName()).toBe("green");
        });
      });

      describe("Transition 'warn' from 'green-blink' to 'yellow'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('warn').finally(done);
        });
        
        it("state should be yellow", function() {
          expect(this.fsm.current.getCompleteName()).toBe("yellow");
        });
      });
    });

    describe("Transition 'warn' from 'green' to 'yellow'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('warn').finally(done);
      });
      
      it("state should be yellow", function() {
        expect(this.fsm.current.getCompleteName()).toBe("yellow");
      });
      
      describe("Transition 'panic' from 'yellow' to 'red'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('panic').finally(done);
        });
        
        it("state should be red", function() {
          expect(this.fsm.current.getCompleteName()).toBe("red");
        });
        
        describe("Transition 'calm' from 'red' to 'yellow'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('calm').finally(done);
          });
          
          it("state should be yellow", function() {
            expect(this.fsm.current.getCompleteName()).toBe("yellow");
          });
        });
        
        describe("Transition 'clear' from 'red' to 'green'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('clear').finally(done);
          });
          
          it("state should be green", function() {
            expect(this.fsm.current.getCompleteName()).toBe("green");
          });
        });
        
        describe("Transition 'blink' from 'red' to 'red-blink'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('blink').finally(done);
          });
          
          it("state should be red-blink", function() {
            expect(this.fsm.current.getCompleteName()).toBe("red-blink");
          });
          
          describe("Transition 'clear_blink' from 'red-blink' to 'green-blink'", function() {
            beforeEach(function(done) {
              this.fsm.doTransition('clear_blink').finally(done);
            });
            
            it("state should be green-blink", function() {
              expect(this.fsm.current.getCompleteName()).toBe("green-blink");
            });
          });
          
          describe("Transition 'calm' from 'red-blink' to 'yellow'", function() {
            beforeEach(function(done) {
              this.fsm.doTransition('calm').finally(done);
            });
            
            it("state should be yellow", function() {
              expect(this.fsm.current.getCompleteName()).toBe("yellow");
            });
          });
          
          describe("Transition 'clear' from 'red-blink' to 'green'", function() {
            beforeEach(function(done) {
              this.fsm.doTransition('clear').finally(done);
            });
            
            it("state should be green", function() {
              expect(this.fsm.current.getCompleteName()).toBe("green");
            });
          });
        });
      });
      
      describe("Transition 'clear' from 'yellow' to 'green'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('clear').finally(done);
        });
        
        it("state should be green", function() {
          expect(this.fsm.current.getCompleteName()).toBe("green");
        });
      });

      describe("Transition 'blink' from 'yellow' to 'yellow-blink'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('blink').finally(done);
        });
        
        it("state should be yellow-blink", function() {
          expect(this.fsm.current.getCompleteName()).toBe("yellow-blink");
        });
        
        describe("Transition 'panic' from 'yellow-blink' to 'red'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('panic').finally(done);
          });
          
          it("state should be red", function() {
            expect(this.fsm.current.getCompleteName()).toBe("red");
          });
        });

        describe("Transition 'clear' from 'yellow-blink' to 'green'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('clear').finally(done);
          });
          
          it("state should be green", function() {
            expect(this.fsm.current.getCompleteName()).toBe("green");
          });
        });

        describe("Transition 'cancel' from 'yellow-blink' to 'yellow'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('cancel').finally(done);
          });
          
          it("state should be yellow", function() {
            expect(this.fsm.current.getCompleteName()).toBe("yellow");
          });
          
        });
      });
    });
    
    
    
  });
  
  
  
});
