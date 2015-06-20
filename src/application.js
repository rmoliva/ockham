(function() {
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

    OckhamState.prototype.doTransition = function(transition, options) {
        var that = this;

        // TODO: Comprobar que se pueda hacer la transicion

        return new Promise(function(resolve, reject) {
            resolve(that.from_transitions[transition]);
        });
    };

    var Ockham = {

        create: function(cfg, target) {
            var fsm = {
                current: null,
                states: {}
            };
            target = target || {};

            // Travel each state configuration
            _.each(cfg.states, function(data, state) {
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

            return _.merge(fsm, target);
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

            // TODO: Debe de haber un estado seleccionado, siempre devolver un promise

            // Delegar en el estado actual la transicion
            return that.current.doTransition(transition, options).then(function(to) {
                from = that.current.getCompleteName();

                // Cambiar al estado destino
                that.current = that.states[to];

                // TODO: Comprobar que exista estado destino

                eventData = {
                    from: from,
                    to: that.current.getCompleteName(),
                    transition: transition,
                    options: options
                };
                return eventData;
            });
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
