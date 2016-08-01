(function() {
    var Ockham = (function() {
        return {
            error: function(message) {
                return {
                    name: "OckhamError",
                    level: "Show Stopper",
                    message: message,
                    htmlMessage: message,
                    toString: function() {
                        return this.name + ": " + this.message;
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
                    doTransition = function(fsm, transition, options) {
                        var promise,
                            transition_fn = from_transitions[transition];

                        // If this state does not allow the transition, pass it to
                        // the parents
                        if (from_transitions[transition]) {
                            if (typeof transition_fn === "function") {
                                promise = transition_fn(fsm, options);
                            } else {
                                promise = Promise.resolve(from_transitions[transition], options);
                            }
                        } else {
                            if (parent) {
                                promise = parent.doTransition(fsm, transition, options);
                            }
                        }

                        // Check if the transtion can be done
                        if (promise) {
                            return promise;
                        }
                        return Promise.reject(new ockham.error("No transition '" + transition + "' in state: '" + getCompleteName() + "'"));
                    };

                return {
                    getCompleteName: getCompleteName,
                    addTransition: addTransition,
                    can: can,
                    doTransition: doTransition
                };
            },

            fsm: function(cfg) {
                var current = null,
                    states = {},
                    transition_queue = [],
                    i,
                    _createState = function(ockham, name, parent_state_data, parent) {
                        var state_obj;
                        // Create and save the state
                        state_obj = new ockham.state(ockham, name, parent);
                        states[state_obj.getCompleteName()] = state_obj;

                        for(key in parent_state_data) {
                          data = parent_state_data[key];
                            if (key === 'states') {
                                // Create the child states
                                for(substate in data) {
                                  state_data = data[substate];
                                  _createState(ockham, substate, state_data, state_obj);
                                };
                            } else {
                                // Create the transitions
                                state_obj.addTransition(key, data);
                            }
                        };
                    },
                    can = function(transition) {
                        // We always expect a current state
                        return current.can(transition);
                    },
                    cannot = function(transition) {
                        return !can(transition);
                    },
                    currentName = function() {
                        return current.getCompleteName();
                    },
                    is = function(state) {
                        // We always expect a current state
                        return current.getCompleteName() === state;
                    },
                    doTransition = function(transition, options) {
                        var from, eventData, that = this;

                        // Delegate transition to the current state
                        return current.doTransition(that, transition, options).then(function(to) {
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
                        var promise_queue, data, promise;

                        if (transition_queue.length === 0) {
                            return Promise.resolve(eventData);
                        }

                        // Return first element of the transition queue
                        data = transition_queue[0];
                        promise = doTransition(data.transition, data.options);

                        // Remove elemento from the array
                        transition_queue.splice(0, 1);
                        return promise;
                    },
                    ret = cfg.config(this);
                    ret.can = can;
                    ret.cannot = cannot;
                    ret.currentName = currentName;
                    ret.deferTransition = deferTransition;
                    ret.doTransition = doTransition;
                    ret.is = is;

                // Travel each state configuration
                for(state in ret.states) {
                  data = ret.states[state]
                  // Create root states
                  _createState(this, state, data, null);
                }

                // Always start with "none" state
                // TODO: Should it be configurable??
                current = states.none;

                return ret;
            },

            create: function(cfg) {
                return this.fsm(cfg);
            }
        };
    })();

    // For node
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Ockham;
    } else {
        // For Browser
        window.Ockham = Ockham;
    }
})();
