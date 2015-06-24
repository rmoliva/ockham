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
            var from_transitions = [];
            var getCompleteName = function() {
                var names = [];
                if (parent) {
                    names.push(parent.getCompleteName());
                }
                names.push(name);
                return names.join('-');
            };

            var addTransition = function(from, transition) {
                // Solo puede haber un estado final para cada transicion
                from_transitions[from] = transition;
            };

            var can = function(transition) {
                if (!_.isUndefined(from_transitions[transition])) {
                    return true;
                }
                // Si no esta definido en el propio estado buscarlo en los padres
                if (parent) {
                    return parent.can(transition);
                }
                return false;
            };

            var doTransition = function(fsm, transition, options) {
                var promise,
                    transition_fn = from_transitions[transition];

                // Si este estado no acepta la transicion, pasarselo al padre
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

                // Comprobar que se pueda hacer la transicion
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
            var current = null;
            var states = {};
            var transition_queue = [];
            var _createState = function(ockham, name, data, parent) {
                var state_obj;
                // Crear el estado y guardarlo
                state_obj = new ockham.state(ockham, name, parent);
                states[state_obj.getCompleteName()] = state_obj;

                // Crear las transiciones
                _.each(data, function(data, key) {
                    if (key === 'states') {
                        _.each(data, function(state_data, substate) {
                            _createState(ockham, substate, state_data, state_obj);
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
                transition_queue.splice(0, 1);
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
                _createState(this, state, data, null);
            }, this);

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
