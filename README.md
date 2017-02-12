[![Build Status](https://travis-ci.org/rmoliva/ockham.svg)](https://travis-ci.org/rmoliva/ockham)
[![Code Climate](https://codeclimate.com/github/rmoliva/ockham/badges/gpa.svg)](https://codeclimate.com/github/rmoliva/ockham)
[![Test Coverage](https://codeclimate.com/github/rmoliva/ockham/badges/coverage.svg)](https://codeclimate.com/github/rmoliva/ockham/coverage)
[![Dependencies](https://david-dm.org/rmoliva/ockham.svg)](https://david-dm.org/rmoliva/ockham.svg)

# ockham
A Javascript hierachical finite state machine library

Ockham is a very simple finite state machine controller. It was developed to fullfill a concrete necessity so it is not really a generic solution implementation.
It has the main following characteristics:
* Nested states
* Promise transitions

## Simple State Machine

A simple state machine can be the following:


```javascript
var fsm = Ockham.create({
  config: function(fsm) {
    return {
      states: {
        none: {
          init: 'green'
        },
        green: {
          warn: 'yellow'
        },
        yellow: {
          panic: 'red',
          clear: 'green'
        },
        red: {
          calm: 'yellow',
          clear: 'green'
        }
      }
    };
  }
});
```

We define a function called 'config' that returns an object with the state definition.
It always starts with the 'none' state, and by calling the transition functions we can make the State Machine to change its state:

```javascript
fsm.currentState(); // => 'none'
fsm.is('none'); // => true
fsm.can('init'); // => true

fsm.doTransition('init');
fsm.currentState(); // => 'green'
fsm.is('none'); // => false
fsm.is('green'); // => true
fsm.can('init'); // => false
fsm.can('warn'); // => true

fsm.doTransition('warn');
fsm.currentState(); // => 'yellow'

fsm.doTransition('panic');
fsm.currentState(); // => 'red'

fsm.doTransition('calm');
fsm.currentState(); // => 'yellow'
```

## Defining transitions

We can also define the transition functions. We have to be aware of the following:
* We have to define the transition to be a Promise.
* We can pass an optional object within the call to be received by the promise function.
* We have to resolve the promise with the name of the final state of the transition and the options object received.

An example explaining all:

```javascript
var fsm = Ockham.create({
  config: function(fsm) {
    return {
      states: {
        none: {
          init: this.initTransition
        },
        off: {
          turn_on: this.turnOnTransition
        },
        on: {
          turn_off: this.turnOffTransition
        }
      }
    };
  },
  initTransition : function(fsm, options) {
    return new Promise(function(resolve, reject) {
      resolve('off', options);
    });
  },
  turnOnTransition: function(fsm, options) {
    return new Promise(function(resolve, reject) {
      resolve('on', options);
    });
  },
  turnOffTransition: function(fsm, options) {
    return new Promise(function(resolve, reject) {
      resolve('off', options);
    });
  }
});

fsm.currentState(); // => 'none'

fsm.doTransition('init');
fsm.currentState(); // => 'off'

fsm.doTransition('turn_on');
fsm.currentState(); // => 'on'

fsm.doTransition('turn_off');
fsm.currentState(); // => 'off'
```

There is not much difference from the simple example, because this promises are not doing anything. But you can implement whatever you need inside the promise.
With this approach you can do the following inside the transition promise:
* Throw an error and no transition would take place.
* Do a conditional transition an resolve to a diferent state.
* Guard the transition and prevent it to go to the final state.

For example, we can define the 'turn_on' transition this way:

```javascript
  turnOnTransition: function(fsm, options) {
    return new Promise(function(resolve, reject) {
      if(options && options.switch) {
        resolve('on', options);
      }
      else {
        resolve('off', options);
      }
    });
  },

fsm.currentState(); // => 'none'

fsm.doTransition('init');
fsm.currentState(); // => 'off'

fsm.doTransition('turn_on',{switch: false});
fsm.currentState(); // => 'off'

fsm.doTransition('turn_on', {switch: true});
fsm.currentState(); // => 'on'
```

## Deferring transitions

Sometimes you need to chain several transition. This can be done by deferring transitions.
You can defer a transition while executing a transition, so the sistem will execute the deferred transition once it has finished the current transition.

```javascript
var fsm = Ockham.create({
  config: function(fsm) {
    return {
      states: {
        none: {
          init: 'off'
        },
        off: {
          blink: this.blink,
          round: this.round
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
  },
  round: function(fsm, options) {
    return new Promise(function(resolve, reject) {
      fsm.deferTransition("turn_on", options);
      fsm.deferTransition("turn_off", options);
      resolve('blink', options);
    });
  }
});

fsm.currentState(); // => 'none'
fsm.doTransition('init');
fsm.currentState(); // => 'off'

fsm.doTransition('blink'); // When blink transition finishes it will do a turn_on transition
fsm.currentState(); // => 'on'

fsm.doTransition('turn_off');
fsm.currentState(); // => 'off'

fsm.doTransition('round'); // When round transition finishes it will do a turn_on transition and then a turn_off
fsm.currentState(); // => 'off'
```

## Nested states

States can also be nested. This feature eases the develop of more complex state machines.
You have to take care of the following:
* Nested states implements the [Liskov Substition Principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle): Basically if a state cannot handle a transition it will ask for the parent to do it.
* The current name of a child state is the name of the parent and the child joined with a dash (parent-child)

Consider the following state machine:

```javascript
var fsm = Ockham.create({
  config: function(fsm) {
    return {
      states: {
        none: {
          init: 'off'
        },
        off: {
          start: 'on',
          blink: 'off-blink',
          states: {
            blink: {
              cancel: 'off'
            }
          }
        },
        on: {
          stop: 'off',
          blink: 'on-blink',
          states: {
            blink: {
              cancel: 'on'
            }
          }
        }
      }
    };
  }
});

fsm.currentState(); // => 'none'
fsm.currentState('init');
fsm.currentState(); // => 'off'

fsm.doTransition('blink');
fsm.currentState(); // => 'off-blink'

fsm.doTransition('cancel');
fsm.currentState(); // => 'off'

fsm.doTransition('blink');
fsm.currentState(); // => 'off-blink'
fsm.can('start'); // true
fsm.can('blink'); // true
fsm.can('cancel'); // true

fsm.doTransition('start'); // This transition is defined on 'off'
fsm.currentState(); // => 'on'

fsm.doTransition('blink');
fsm.currentState(); // => 'on-blink'
fsm.can('stop'); // true
fsm.can('blink'); // true
fsm.can('cancel'); // true

fsm.doTransition('stop'); // This transition is defined on 'on'
fsm.currentState(); // => 'off'
```

## API

`Ockham.create`: This is the creator function of an Ockham finite state machine. It must receive an object with a 'config' function:

```javascript
var fsm = Ockham.create({
  config: function(fsm) {}
});
```
Once we have an Ockham instance we can call its following methods:

* `can(transition)`: Returns true if the current state can do the transition.
* `cannot(transition)`: Returns true if the current state cannot do the transition.
* `currentState()`: Returns the complete name (taking care of inheritance) of the current state.
* `deferTransition(transition, options)`: Defer a transition to be fullfiled once the current transition has finished.
* `doTransition(transition, options)`: Execute transition in the current state.
* `is(state)`: Return true if the current state is the passed state.

## Dependencies

Currently Ockhan has the following dependencies:
* [Bluebird](https://github.com/petkaantonov/bluebird)

I will try to remove it whenever I can.

## Testing Okcham

1. Download and setup the npm packages:

    `npm install`

2. Run the grunt task:

    `grunt jasmine:all`

## TODO

* Improve documentation
* Support for Node, AMD, Web worker...

## License

Ockham is released under the [MIT License](http://www.opensource.org/licenses/MIT).
