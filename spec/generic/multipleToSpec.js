describe("MultipleTo State Machine", function() {
  
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: 'hungry'
            },
            hungry: {
              eat: "satisfied",
              rest: "hungry"
            },
            satisfied: {
              eat: "full",
              rest: "hungry"
            },
            full: {
              eat: "sick",
              rest: "hungry"
            },
            sick: {
              rest: "hungry"
            }
          }
        };
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.is("none")).toBe(true);
  });

  describe("Transition 'init' from 'none' to 'hungry'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(done);
    });

    it("state should be hungry", function() {
      expect(this.fsm.is("hungry")).toBe(true);
    });
    
    describe("Transition 'eat' from 'hungry' to 'satisfied'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('eat').finally(done);
      });

      it("state should be satisfied", function() {
        expect(this.fsm.is("satisfied")).toBe(true);
      });
      
      describe("Transition 'eat' from 'satisfied' to 'full'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('eat').finally(done);
        });

        it("state should be full", function() {
          expect(this.fsm.is("full")).toBe(true);
        });
      
        describe("Transition 'eat' from 'full' to 'sick'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('eat').finally(done);
          });

          it("state should be sick", function() {
            expect(this.fsm.is("sick")).toBe(true);
          });
        
          describe("Transition 'rest' from 'sick' to 'hungry'", function() {
            beforeEach(function(done) {
              this.fsm.doTransition('rest').finally(done);
            });

            it("state should be sick", function() {
              expect(this.fsm.is("hungry")).toBe(true);
            });
          });
        });
      });
    });
  });
});
