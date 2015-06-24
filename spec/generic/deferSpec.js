describe("Defer State Machine", function() {
  
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
          fsm.deferTransition("turn_on", options);
          resolve('blink', options);
        });
      }
    });
  });
  
  it("initial state should be none", function() {
    expect(this.fsm.is("none")).toBe(true);
  });

  describe("Transition to 'init'", function() {
    beforeEach(function(done) {
      this.fsm.doTransition('init').finally(done);
    });

    it("state should be off", function() {
      expect(this.fsm.is("off")).toBe(true);
    });

    describe("Transition to 'blink'", function() {
      beforeEach(function(done) {
        var options = {one: "One", two: "two"}
        this.fsm.doTransition('blink', options).then(checkReturn({
          from: 'blink',
          to: 'on',
          transition: 'turn_on',
          options: options
        })).finally(done);
      });
      
      it("state should be on", function() {
        expect(this.fsm.is("on")).toBe(true);
      });
    });
  });
});
