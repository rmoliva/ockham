describe("Conditional State Machine", function() {
  beforeEach(function() {
    this.fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: this.initTransition
            },
            off: {
              start: this.startTransition
            },
            on: {
              stop: this.stopTransition
            },
            blink: {
              stop: 'off'
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
          if(options && options.blink) {
            resolve('blink', options);
          } else {
            resolve('on', options);
            
          }
        });
      },
      stopTransition : function(fsm, options) {
        return new Promise(function(resolve, reject) {
          resolve('off', options);
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
    
    describe("Transition 'start' with blink a false from 'off' to 'on'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('start', {blink: false}).finally(done);
      });
    
      it("state should be on", function() {
        expect(this.fsm.is("on")).toBe(true);
      });
    });
    
    describe("Transition 'start' with blink a true from 'off' to 'blink'", function() {
      beforeEach(function(done) {
        this.fsm.doTransition('start', {blink: true}).finally(done);
      });
    
      it("state should be blink", function() {
        expect(this.fsm.is("blink")).toBe(true);
      });
    });
  });
});
