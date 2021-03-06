(function() {
  var Ockham = (
    function() {
      'use strict';
      return {
        error: function(message) {
          return {
            name: 'OckhamError',
            level: 'Show Stopper',
            message: message,
            htmlMessage: message,
            toString: function() {
              return this.name + ': ' + this.message;
            }
          };
        },
        state: function(ockham, name, parent) {
          var from_transitions = [],
          getCompleteName = function() {
            var names = [];
            if (parent) {
              names.push(parent.getCompleteName());
            }
            names.push(name);
            return names.join('-');
          },
          addTransition = function(from, transition) {
            // Only one final state for each transition
            from_transitions[from] = transition;
          },
          can = function(transition) {
            if (from_transitions[transition]) {
              return true;
            }
            // If the transition is not defined in this state,
            // search it on the parents
            if (parent) {
              return parent.can(transition);
            }
            return false;
          },
          _doStringTransition = function(fsm, transition, options) {
            return Promise.resolve(
              from_transitions[transition],
              options
            );
          },
          _doFunctionTransition = function(fsm, transition, options) {
            var transition_fn = from_transitions[transition];
            return Promise.resolve(
              transition_fn(fsm, options, getCompleteName())
            ).then(function(return_data) {
              return return_data;
            });
          },
          doTransition = function(fsm, transition, options) {
            var transition_fn = from_transitions[transition];

            if (transition_fn) {
              switch (typeof transition_fn) {
                case 'function': {
                  return _doFunctionTransition(fsm, transition, options);
                }
                default: {
                  return _doStringTransition(fsm, transition, options);
                }
              }
            } else {
              if (parent) {
                // If this state does not allow the transition, pass it to
                // the parents
                return parent.doTransition(fsm, transition, options);
              }
            }

            var name = getCompleteName();
            return Promise.reject(
              new ockham.error(
                'No transition \'' +
                transition +
                '\' in state: \'' +
                name + '\''
              )
            );
          };

          return {
            getCompleteName: getCompleteName,
            addTransition: addTransition,
            can: can,
            doTransition: doTransition
          };
        },

        fsm: function(config_object) {
          var data,
            state,
            current = null,
            config = config_object.config(this),
            states = {},
            transition_queue = [],
            _extend = function(target, source) {
              for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                  target[prop] = source[prop];
                }
              }
              return target;
            },
            _createState = function(ockham, name, parent_state_data, parent) {
              var state_obj, key, substate, substate_data, key_data;
              // Create and save the state
              state_obj = new ockham.state(ockham, name, parent);
              states[state_obj.getCompleteName()] = state_obj;

              for (key in parent_state_data) {
                if (parent_state_data.hasOwnProperty(key)) {
                  key_data = parent_state_data[key];
                  if (key === 'states') {
                    // Create the child states
                    for (substate in key_data) {
                      if (key_data.hasOwnProperty(substate)) {
                        substate_data = key_data[substate];
                        _createState(
                          ockham,
                          substate,
                          substate_data,
                          state_obj
                        );
                      }
                    }
                  } else {
                    // Create the transitions
                    state_obj.addTransition(key, key_data);
                  }
                }
              }
            },
            can = function(transition) {
              // We always expect a current state
              return current.can(transition);
            },
            cannot = function(transition) {
              return !can(transition);
            },
            currentState = function() {
              return current.getCompleteName();
            },
            is = function(state) {
              // We always expect a current state
              return current.getCompleteName() === state;
            },
            doTransition = function(transition, options) {
              var from, eventData, that = this;

              // Delegate transition to the current state
              return current.doTransition(
                that,
                transition,
                options
              ).then(function(to) {
                from = current.getCompleteName();

                // Change to target state
                current = states[to];

                eventData = {
                  from: from,
                  to: current.getCompleteName(),
                  transition: transition,
                  options: options
                };
                return eventData;
              }).then(function(eventData) {
                return processTransitionQueue(eventData);
              });
            },
            deferTransition = function(transition, options) {
              transition_queue.push({
                transition: transition,
                options: options
              });
            },
            processTransitionQueue = function(eventData) {
              var data, promise;

              if (transition_queue.length === 0) {
                return Promise.resolve(eventData);
              }

              // Return first element of the transition queue
              data = transition_queue[0];
              promise = doTransition(data.transition, data.options);

              // Remove elemento from the array
              transition_queue.splice(0, 1);
              return promise;
            };

          // Travel each state configuration
          for (state in config.states) {
            if (config.states.hasOwnProperty(state)) {
              data = config.states[state];

              // Create root states
              _createState(this, state, data, null);
            }
          }

          // Always start with "none" state
          // TODO: Should it be configurable??
          current = states.none;

          // Extend fsm with passed configuration object
          return _extend({
            can: can,
            cannot: cannot,
            currentState: currentState,
            deferTransition: deferTransition,
            doTransition: doTransition,
            is: is
          }, config_object);
        },

        create: function(cfg) {
          return this.fsm(cfg);
        }
      };
    }
  )();

  // For node
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Ockham;
  } else {
    // For Browser
    window.Ockham = Ockham;
  }
})();
