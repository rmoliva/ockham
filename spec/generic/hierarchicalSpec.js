describe("Hierarchical State Machine", function() {
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: "show_form"
            },
            show_form: {
              edit: 'show_form-edit_form',
              states: {
                edit_form: {
                  delete: 'show_form-edit_form-delete_form',
                  states: {
                    delete_form: {
                      cancel: 'show_form-edit_form'
                    }
                  },
                  cancel: 'show_form'
                }
              },
            }
          }
        };
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.is("none")).toBe(true);
  });

  describe("Transition 'init' from 'none' to 'show_form'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(done);
    });
    
    it("state should be show_form", function() {
      expect(this.fsm.is("show_form")).toBe(true);
    });
  
    describe("Transition 'edit' from 'show_form' to 'show_form-edit_form'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('edit').finally(done);
      });
      
      it("state should be show_form-edit_form", function() {
        expect(this.fsm.is("show_form-edit_form")).toBe(true);
      });
  
      describe("Transition 'cancel' from 'show_form-edit_form' to 'show_form'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('cancel').finally(done);
        });
        
        it("state should be show_form", function() {
          expect(this.fsm.is("show_form")).toBe(true);
        });
      }); // Cancel
        
      describe("Transition 'delete' from 'show_form-edit_form' to 'show_form-edit_form-delete_form'", function() {
        beforeEach(function(done) {
          this.fsm.doTransition('delete').finally(done);
        });
        
        it("state should be show_form-edit_form-delete_form", function() {
          expect(this.fsm.is("show_form-edit_form-delete_form")).toBe(true);
        });
        
        describe("Transition 'cancel' from 'show_form-edit_form-delete_form' to 'show_form-edit_form'", function() {
          beforeEach(function(done) {
            this.fsm.doTransition('cancel').finally(done);
          });
          
          it("state should be show_form-edit_form", function() {
            expect(this.fsm.is("show_form-edit_form")).toBe(true);
          });
        }); // Cancel
      }); // delete
    }); // edit
  }); // 'init'
}); // describe
