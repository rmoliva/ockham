(function() {
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

    OckhamState.prototype.addTransition = function(from, to) {
        // Solo puede haber un estado final para cada transicion
        this.from_transitions[from] = to;
    };

    OckhamState.prototype.doTransition = function(fsm, transition, options) {
        var that = this,
            promise, 
            transition_fn = that.from_transitions[transition];

        // Si este estado no acepta la transicion, pasarselo al padre
        if (that.from_transitions[transition]) {
          if(_.isFunction(transition_fn)) {
            promise = transition_fn(fsm, options);
          } else {
            promise = new Promise(function(resolve, reject) {
                resolve(that.from_transitions[transition],options);
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

        create: function(cfg, target) {
            var fsm = {
                current: null,
                states: {},
                transition_queue: [],
                transitions: cfg.transitions
            };
            target = target || {};
            
            fsm = _.extend(fsm, cfg.config(fsm));

            // Travel each state configuration
            _.each(fsm.states, function(data, state) {
                // Crear los estados raiz
                this._createState(fsm, state, data, null);
            }, this);
            
            fsm.test = function() {
                return true;
            };

            // Siempre se empieza por el estado 'none'
            // TODO: Hacerlo configurable ??
            fsm.current = fsm.states['none'];
            fsm.doTransition = this.doTransition;
            fsm.processTransitionQueue = this.processTransitionQueue;
            fsm.deferTransition = this.deferTransition;
            return fsm;
        },
        _createState: function(fsm, name, data, parent) {
            var state_obj;
            // Crear el estado y guardarlo
            state_obj = new OckhamState(name, parent);
            fsm.states[state_obj.getCompleteName()] = state_obj;

            // Crear las transiciones
            _.each(data, function(data, key) {
                if (key === 'states') {
                    _.each(data, function(state_data, substate) {
                        this._createState(fsm, substate, state_data, state_obj);
                    }, this);
                } else {
                    state_obj.addTransition(key, data);
                }
            }, this);
        },
        doTransition: function(transition, options) {
            var from, eventData, that = this;

            // Debe de haber un estado seleccionado, siempre devolver un promise

            // Delegar en el estado actual la transicion
            return that.current.doTransition(that, transition, options).then(function(to) {
                from = that.current.getCompleteName();

                // Cambiar al estado destino
                that.current = that.states[to];

                eventData = {
                    from: from,
                    to: that.current.getCompleteName(),
                    transition: transition,
                    options: options
                };
                return eventData;
            }).then(function(eventData) {
              return that.processTransitionQueue(eventData); 
            });
        },
        deferTransition: function(transition, options) {
          this.transition_queue.push({transition: transition, options: options});
        },
        processTransitionQueue: function(eventData) {
          if(_.isEmpty(this.transition_queue)) {
            return Promise.resolve(eventData);
          }
          
          return _.map(this.transition_queue, function(data) {
            return this.doTransition(data.transition, data.options);
          }, this);
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
