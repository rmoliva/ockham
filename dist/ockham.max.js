/*! ockham.js - v0.0.1+build.1434809699303 - 2015-06-24*/
!function(a, b) {
  b["true"] = a, function() {
    var b = {
      error: function(a) {
        return {
          name: "OckhamError",
          level: "Show Stopper",
          message: a,
          htmlMessage: a,
          toString: function() {
            return this.name + ": " + this.message;
          }
        };
      },
      state: function(a, b, c) {
        var d = [], e = function() {
          var a = [];
          return c && a.push(c.getCompleteName()), a.push(b), a.join("-");
        }, f = function(a, b) {
          // Solo puede haber un estado final para cada transicion
          d[a] = b;
        }, g = function(a) {
          // Si no esta definido en el propio estado buscarlo en los padres
          return _.isUndefined(d[a]) ? c ? c.can(a) : !1 : !0;
        }, h = function(b, f, g) {
          var h, i = d[f];
          // Comprobar que se pueda hacer la transicion
          // Si este estado no acepta la transicion, pasarselo al padre
          // Comprobar que se pueda hacer la transicion
          return d[f] ? h = _.isFunction(i) ? i(b, g) : new Promise(function(a, b) {
            a(d[f], g);
          }) : c && (h = c.doTransition(b, f, g)), h ? h : Promise.reject(new a.error("No transition '" + f + "' in state: '" + e() + "'"));
        };
        return {
          getCompleteName: e,
          addTransition: f,
          can: g,
          doTransition: h
        };
      },
      fsm: function(a) {
        var b = null, c = {}, d = [], e = function(a, b, d, f) {
          var g;
          // Crear el estado y guardarlo
          g = new a.state(a, b, f), c[g.getCompleteName()] = g, // Crear las transiciones
          _.each(d, function(b, c) {
            "states" === c ? _.each(b, function(b, c) {
              e(a, c, b, g);
            }, this) : g.addTransition(c, b);
          }, this);
        }, f = function(a) {
          return b ? b.can(a) : !1;
        }, g = function(a) {
          return !f(a);
        }, h = function() {
          return b.getCompleteName();
        }, i = function(a) {
          return b ? b.getCompleteName() === a : !1;
        }, j = function(a, d) {
          var e, f, g = this;
          // Debe de haber un estado seleccionado, siempre devolver un promise
          // Delegar en el estado actual la transicion
          return b.doTransition(g, a, d).then(function(g) {
            // Cambiar al estado destino
            return e = b.getCompleteName(), b = c[g], f = {
              from: e,
              to: b.getCompleteName(),
              transition: a,
              options: d
            };
          }).then(function(a) {
            return l(a);
          });
        }, k = function(a, b) {
          d.push({
            transition: a,
            options: b
          });
        }, l = function(a) {
          var b, c;
          // Devolver el primer elemento de la cola de transicion
          // Quitar el elemento del array
          return _.isEmpty(d) ? Promise.resolve(a) : (b = _.first(d), c = j(b.transition, b.options), 
          d.splice(0, 1), c);
        }, m = _.extend({
          can: f,
          cannot: g,
          is: i,
          doTransition: j,
          deferTransition: k,
          processTransitionQueue: l,
          currentName: h
        }, a.config(this));
        // Travel each state configuration
        // Siempre se empieza por el estado 'none'
        // TODO: Hacerlo configurable ??
        return _.each(m.states, function(a, b) {
          // Crear los estados raiz
          e(this, b, a, null);
        }, this), b = c.none, m;
      },
      create: function(a) {
        var b = this.fsm(a);
        return b;
      }
    };
    // Ockham
    //===========================================================================
    // As for several things in this project, thanks to:
    // https://github.com/jakesgordon/javascript-state-machine/blob/master/state-machine.js
    //======
    // NODE
    //======
    "undefined" != typeof a ? ("undefined" != typeof module && module.exports && (a = module.exports = b), 
    a.Ockham = b) : "function" == typeof define && define.amd ? define(function(a) {
      return b;
    }) : "undefined" != typeof window ? window.Ockham = b : "undefined" != typeof self && (self.Ockham = b);
  }();
}({}, function() {
  return this;
}());