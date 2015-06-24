/*! ockham.js - v0.0.1+build.1434809699303 - 2015-06-24 */(function() {
    var OckhamError = function(message) {
        return {
            name: "OckhamError",
            level: "Show Stopper",
            message: message,
            htmlMessage: message,
            toString: function() {
                return this.name + ": " + this.message;
            }
        };
    };

    var OckhamState = function(name, parent) {
        this.name = name;
        this.parent = parent;
        this.from_transitions = {};
    };

    OckhamState.prototype.getCompleteName = function() {
        var parent = this.parent,
            names = [];
        if (this.parent) {
            names.push(this.parent.getCompleteName());
        }
        names.push(this.name);
        return names.join('-');
    };

    OckhamState.prototype.addTransition = function(from, transition) {
        // Solo puede haber un estado final para cada transicion
        this.from_transitions[from] = transition;
    };

    OckhamState.prototype.can = function(transition) {
        if (!_.isUndefined(this.from_transitions[transition])) {
            return true;
        }
        // Si no esta definido en el propio estado buscarlo en los padres
        if (this.parent) {
            return this.parent.can(transition);
        }
        return false;
    };

    OckhamState.prototype.doTransition = function(fsm, transition, options) {
        var that = this,
            promise,
            transition_fn = that.from_transitions[transition];

        // Si este estado no acepta la transicion, pasarselo al padre
        if (that.from_transitions[transition]) {
            if (_.isFunction(transition_fn)) {
                promise = transition_fn(fsm, options);
            } else {
                promise = new Promise(function(resolve, reject) {
                    resolve(that.from_transitions[transition], options);
                });
            }
        } else {
            if (that.parent) {
                promise = that.parent.doTransition(fsm, transition, options);
            }
        }

        // Comprobar que se pueda hacer la transicion
        if (promise) {
            return promise;
        }
        return Promise.reject(new OckhamError("No transition '" + transition + "' in state: '" + that.getCompleteName() + "'"));
    };

    var Ockham = {
        fsm: function(cfg) {
          var current = null;
          var states = {};
          var transition_queue = [];
          
            var _createState = function(name, data, parent) {
                var state_obj;
                // Crear el estado y guardarlo
                state_obj = new OckhamState(name, parent);
                states[state_obj.getCompleteName()] = state_obj;

                // Crear las transiciones
                _.each(data, function(data, key) {
                    if (key === 'states') {
                        _.each(data, function(state_data, substate) {
                            _createState(substate, state_data, state_obj);
                        }, this);
                    } else {
                        state_obj.addTransition(key, data);
                    }
                }, this);
            };

            var can = function(transition) {
                if (current) {
                    return current.can(transition);
                }
                return false;
            };
            var cannot = function(transition) {
                return !can(transition);
            };
            
            var currentName = function() {
              return current.getCompleteName();
            };
            
            var is = function(state) {
                if (current) {
                    return current.getCompleteName() === state;
                }
                return false;
            };
            var doTransition = function(transition, options) {
                var from, eventData, that = this;

                // Debe de haber un estado seleccionado, siempre devolver un promise

                // Delegar en el estado actual la transicion
                return current.doTransition(that, transition, options).then(function(to) {
                    from = current.getCompleteName();

                    // Cambiar al estado destino
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
            };
            var deferTransition = function(transition, options) {
                transition_queue.push({
                    transition: transition,
                    options: options
                });
            };
            var processTransitionQueue = function(eventData) {
                var promise_queue, data, promise;

                if (_.isEmpty(transition_queue)) {
                    return Promise.resolve(eventData);
                }
                
                // Devolver el primer elemento de la cola de transicion
                data = _.first(transition_queue);
                promise = doTransition(data.transition, data.options);
                
                // Quitar el elemento del array
                transition_queue.splice(0,1);
                return promise;
            };
            
            var ret = _.extend({
                can: can,
                cannot: cannot,
                is: is,
                doTransition: doTransition,
                deferTransition: deferTransition,
                processTransitionQueue: processTransitionQueue,
                currentName: currentName
            }, cfg.config(this));

            // Travel each state configuration
            _.each(ret.states, function(data, state) {
                // Crear los estados raiz
                _createState(state, data, null);
            }, ret);

            // Siempre se empieza por el estado 'none'
            // TODO: Hacerlo configurable ??
            current = states.none;

            return ret;
        },

        create: function(cfg) {
            var fsm = this.fsm(cfg);

            return fsm;
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
