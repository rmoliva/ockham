(function() {
    var Ockham = {
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
                    if (!_.isUndefined(from_transitions[transition])) {
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
                        if (_.isFunction(transition_fn)) {
                            promise = transition_fn(fsm, options);
                        } else {
                            promise = new Promise(function(resolve, reject) {
                                resolve(from_transitions[transition], options);
                            });
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
                _createState = function(ockham, name, data, parent) {
                    var state_obj;
                    // Create and save the state
                    state_obj = new ockham.state(ockham, name, parent);
                    states[state_obj.getCompleteName()] = state_obj;

                    _.each(data, function(data, key) {
                        if (key === 'states') {
                          // Create the child states 
                            _.each(data, function(state_data, substate) {
                                _createState(ockham, substate, state_data, state_obj);
                            }, this);
                        } else {
                            // Create the transitions
                            state_obj.addTransition(key, data);
                        }
                    }, this);
                },
                can = function(transition) {
                    if (current) {
                        return current.can(transition);
                    }
                    return false;
                },
                cannot = function(transition) {
                    return !can(transition);
                },
                currentName = function() {
                    return current.getCompleteName();
                },
                is = function(state) {
                    if (current) {
                        return current.getCompleteName() === state;
                    }
                    return false;
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

                    if (_.isEmpty(transition_queue)) {
                        return Promise.resolve(eventData);
                    }

                    // Return first element of the transition queue
                    data = _.first(transition_queue);
                    promise = doTransition(data.transition, data.options);

                    // Remove elemento from the array
                    transition_queue.splice(0, 1);
                    return promise;
                },
                ret = _.extend({
                    can: can,
                    cannot: cannot,
                    currentName: currentName,
                    deferTransition: deferTransition,
                    doTransition: doTransition,
                    is: is
                }, cfg.config(this));

            // Travel each state configuration
            _.each(ret.states, function(data, state) {
                // Create root states
                _createState(this, state, data, null);
            }, this);

            // Always start with "none" state 
            // TODO: Should it be configurable??
            current = states.none;

            return ret;
        },

        create: function(cfg) {
            return this.fsm(cfg);
        }
    };

    // Ockham

    //===========================================================================

    // As for several things in this project, thanks to:
    // https://github.com/jakesgordon/javascript-state-machine/blob/master/state-machine.js

    //======
    // NODE
    //======
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Ockham;
        }
        exports.Ockham = Ockham;
    }

    //============
    // AMD/REQUIRE
    //============
    else if (typeof define === 'function' && define.amd) {
        define(function(require) {
            return Ockham;
        });
    }

    //========
    // BROWSER
    //========
    else if (typeof window !== 'undefined') {
        window.Ockham = Ockham;
    }

    //===========
    // WEB WORKER
    //===========
    else if (typeof self !== 'undefined') {
        self.Ockham = Ockham;
    }


}());
