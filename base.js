/**
 * Base constructors
 */

/**
 * Logo exception. Holds code, that is handled with sendMessage
 * @param code code
 * @param extra some extra data
 * @constructor
 */
var Exception = function(code, extra) {
    Error.call(this);
    this.code = code;
    this.extra = extra;
};
/*
case 0: - div by zero
case 1: - wrong bracket
case 2: - insufficient number  of arguments
case 3: - wrong arg type
case 4: - unknown variable
case 5: - unknown command
case 6: - unexpected token
case 7: - token as command
case 8: - wrong name of function
case 9: - stack overflow
case 10: - inner error
case 11: - wrong name
case 12: - name page
case 13: - stopped
case 14: - can't find end
case 15: - runtime error
*/

/**
 * Scope that contains it's name, list of variables and queue of commands
 * @param name name of scope
 * @returns {Scope}
 * @constructor
 */

var Scope = function(name) {
    this.name = name;
    this.variables = [];
    this.commands = [];
    return this;
};

/**
 * Variable in scope
 * @param name name of variable
 * @param value value of variable
 * @returns {ScopedValue}
 * @constructor
 */
var ScopedValue = function (name, value) {
    this.name = name;
    this.value = value;
    return this;
};

var scopes = [];         // Stack of scopes

function addScope(name) {
    scopes.push(new Scope(name));
}

function addQueue(q) {
    scopes.top.commands.push(q);
}

function getQueue() {
    return scopes.top.commands.top;
}

function getScope() {
    return scopes.top;
}

/**
 * Simple forward iterator
 * @param list list to iterate
 * @returns {Iterator}
 * @constructor
 */
var Iterator = function (list) {
    var pos = 0;
    this.next = function () {
        return list[pos++];
    };
    this.peek = function () {
        return list[pos];
    };
    this.hasNext = function () {
        return pos != list.length;
    };
    return this;
};

/**
 * Property "top" for array
 */
Object.defineProperty(Array.prototype, "top", {
    get: function () {
        if (this.length != 0)
            return this[this.length - 1];
    },
    set: function (value) {
        if (this.length != 0)
            this[this.length - 1] = value;
    }
});

/**
 * Does this array contain x?
 * @param x
 * @returns {boolean}
 */
Array.prototype.contains = function (x) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == x) {
            return true;
        }
    }
    return false;
};