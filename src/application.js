(function() {

    var Ockham = {

        create: function(cfg, target) {
            var fsm = {
                current: "none"
            };
            target = target || {};

            // Travel each transition configuration
            _.each(cfg.transitions, function(data) {
                // For each transition create a promise handler
                fsm[data.name] = _.bind(this.promiseTransition(fsm, data), fsm);
            }, this);

            fsm.test = function() {
                return true;
            };

            return _.merge(fsm, target);
        },
        promiseTransition: function(fsm, transition_data) {
            var from, eventData;
            return function(options) {
                return new Promise(function(resolve, reject) {
                    from = fsm.current;
                    // TODO: Comprobar si se puede transicionar

                    // TODO: Ejecutar el evento de transicion

                    // Cambiar el estado del fsm
                    fsm.current = transition_data.to;

                    eventData = {
                        from: from,
                        to: fsm.current,
                        transition: transition_data.name,
                        options: options
                    };
                    resolve(eventData);
                    return true;
                });
            };
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
