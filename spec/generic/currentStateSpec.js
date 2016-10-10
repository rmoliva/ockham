describe("current_state during transition", function() {
  it("should be 'none'", function() {
    var fsm = Ockham.create({
      config: function(fsm) {
        return {
          states: {
            none: {
              init: this.initTransition
            },
            home: {
              stop: 'none'
            }
          }
        };
      },
      initTransition : function(transition, options, current_state) {
        expect(current_state).toBe('none');
        return Promise.resolve('home');
      }
    });
    fsm.doTransition('init');
  });
});
