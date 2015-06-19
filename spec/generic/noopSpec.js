
describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
  it("create should return true", function() {
    var obj = Ockham.create({});
    expect(obj.test()).toBe(true);
  });
});


describe("Basic State Machine", function() {
  
  var fsm = Ockham.create({
    transitions: [
      { name: 'init',  from: 'none',   to: 'green' },
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  },
      { name: 'clear', from: 'red', to: 'green'  }
  ]});
  
  it("initial state should be none", function() {
    expect(fsm.current).toBe("none");
  });
  
  describe("Transition 'init' from 'none' to 'green'", function() {
    var options = {1: "Uno", 2: "Dos"};
    
    var testTransitionData = function(data) {
      expect(data.options).toBe(options);
      expect(data.from).toBe("none");
      expect(data.to).toBe("green");
      expect(data.transition).toBe("init");
    };
    
    it("should return transitionData correctly", function(done) {
      return fsm.init(options).then(testTransitionData).then(function() {
        done();
      });
    });

    it("state should be green", function(done) {
      return fsm.init(options).then(function() {
        expect(fsm.current).toBe("green");
      }).then(function() {
        done();
      });
    });

    describe("Transition 'warn' from 'green' to 'yellow'", function() {
      beforeEach(function() {
        fsm.init();
      });
      
      it("state should be yellow", function(done) {
        return fsm.init(options).then(function() {
          expect(fsm.current).toBe("green");
        }).then(function() {
          done();
        });
      });
      
    });
    
    
    
    
  });
  
  
  
});

describe("Specific State Machine", function() {
  var testData = {3: "Tres", 4: "Cuatro"};
  var fsm = Ockham.create({
    transitions: [
      { name: 'init',  from: 'none',   to: 'green' },
      { name: 'warn',  from: 'green',  to: 'yellow' },
      { name: 'panic', from: 'yellow', to: 'red'    },
      { name: 'calm',  from: 'red',    to: 'yellow' },
      { name: 'clear', from: 'yellow', to: 'green'  },
      { name: 'clear', from: 'red', to: 'green'  }
  ]},{
    init: function(transitionData) {
      return new Promise(function(resolve, reject) {
        // Anadimos algo mas al eventData para interceptarlo
        transitionData.test = testData;
        resolve(transitionData)
      });
    }
  });
  
  it("initial state should be none", function() {
    expect(fsm.current).toBe("none");
  });

  describe("Transition to 'init'", function(done) {
    var options = {1: "Uno", 2: "Dos"};
    var testData = {3: "Tres", 4: "Cuatro"};
    
    var testTransitionData = function(data) {
      console.log(options);
      
      expect(data.options).toBe(options);
      expect(data.from).toBe("none");
      expect(data.from).toBe("green");
      expect(data.transition).toBe("init");
      expect(data.test).toBe(testData);
    };
    
    it("should return transitionData correctly", function(done) {
      return fsm.init(options).then(testTransitionData).then(function() {
        done();
      });
    });
    
  });
  
});
