describe("Extended State Machine", function() {
  var fsm = Ockham.create({
    states: {
      none: {
        init: 'green'
      },
      green: {
        warn: 'yellow',
        states: {
          green_blink: {
            cancel: 'green'
          }
        }
      },
      yellow: {
        panic: 'red',
        clear: 'green',
        states: {
          yellow_blink: {
            cancel: 'yellow'
          }
        }
      },
      red: {
        calm: 'yellow',
        clear: 'green',
        states: {
          yellow_blink: {
            clear_blink: 'green_blink'
          }
        }
      } 
    }
  });
  
  it("initial state should be none", function() {
    expect(fsm.current.getCompleteName()).toBe("none");
  });
  
  
  
  
});
