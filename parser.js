/**
 * Recursive descent parser
 * By Danil Kolikov, March 2016
 */

/**
 * Simple left fold
 * @param f function, applied to previous and current values
 * @param z start value
 * @returns {Function} left fold function
 */
var foldl = function (f, z) {
    return function () {
        for (var i = 0; i < arguments.length; i++) {
            z = f(z, arguments[i]);
        }
        return z;
    }
};

/**
 * Constructor of map
 * Make function that applies arguments passed to constructor to arguments of function
 * @returns {Function} map function
 */
var map = function () {
    var parentArgs = arguments;
    return function () {
        var result = [];
        for (var i = 0; i < parentArgs.length; i++) {
            result.push(parentArgs[i].apply(null, arguments));
        }
        return result;
    }
};

/**
 * Constructor of command. Every command constructs with it it's parsed name and list of arguments
 * @param func what should command do
 * @param names names of command
 * @param args types of command arguments
 * @returns {result} command
 */
var command = function (func, names, args) {
    var result = function (parsedName) {
        var operands = Array.prototype.slice.call(arguments, 1);
        if (operands.length != args.length) {
            throw new Exception(2, parsedName);
        }

        for (var i = 0; i < operands.length; i++) {
            if (operands[i] == null) {
                throw new Exception(2, parsedName);
            }
        }

        return function () {
            var constants = map.apply(null, operands).apply(null, arguments);
            for (var i = 0; i < constants.length; i++) {
                if (constants[i].type != args[i] && args[i] != Type.ANY) {
                    throw new Exception(3, [parsedName, constants[i].type]);
                }
            }
            var values = foldl(function (z, n) {
                z.push(n.value);
                return z;
            }, []).apply(null, constants);

            return func.apply(null, values);
        };
    };
    result.names = names;
    result.args = args;
    return result;
};

/**
 * Const value of one of available types
 * @param type type of value
 * @param value value
 * @returns {Const} Const object
 * @constructor
 */
var Const = function (type, value) {
    this.type = type;
    this.value = value;
    return this;
};

/**
 * Function that constantly returns value
 * @param value value to return
 * @returns {Function}
 */
var cnst = function (value) {
    return function () {
        return value;
    };
};

/**
 * Default types in LOGO
 * @type {{NUMBER: number, STRING: number, LIST: number, BOOL: number, ANY: number, VOID: number}}
 */
var Type = {
    NUMBER: 0,
    STRING: 1,
    LIST: 2,
    BOOL: 3,
    ANY: 4,
    VOID: 5
};

/**
 * Constructor of Number
 * @returns {number}
 */
var number = function (x) {
    Const.call(this, Type.NUMBER, x);
    return this;
};

/**
 * Constructor of String
 * @returns {string}
 */
var string = function (s) {
    Const.call(this, Type.STRING, s);
    return this;
};

/**
 * Constructor of List
 * @returns {lst}
 */
var lst = function (s) {
    Const.call(this, Type.LIST, s);
    return this;
};

/**
 * Constructor of Bool
 * @returns {bool}
 */
var bool = function (b) {
    Const.call(this, Type.BOOL, b);
    return this;
};

/**
 * Wrap JavaScript objects into Logo typed objects
 * @param v value to wrap
 * @returns {*} wrapped value
 */
function boxValue(v) {
    var type = typeof v;
    switch (type) {
        case "number":
            return new number(v);
        case "string":
            return new string(v);
        case "boolean":
            return new bool(v);
        case "object":
            return new lst(v);
        default:
            return null;
    }
}

/**
 * Constructor of functional variable. It's looking for it's value in scope and returns it
 * @param name name of variable
 * @returns {Function}
 */
var variable = function (name) {
    return function (scope) {
        for (var j = scope.length - 1; j >= 0; j--) {
            for (var i = 0; i < scope[j].variables.length; i++) {
                if (scope[j].variables[i].name == name) {
                    return scope[j].variables[i].value;
                }
            }
        }
        throw new Exception(4, name);
    }
};

// List of commands
var commands = [];
function findCommand(s, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].names.contains(s.toLowerCase())) {
            return list[i];
        }
    }
    return null;
}

/**
 * Simple tokenizer
 * @param s sting to tokenize
 * @returns {Array} list of tokens
 */
function tokenize(s) {
    s = " " + s + " ";
    var tokens = [];
    var separators = [" ", "\t", "\n", "[", "]", "(", ")"];
    var i = 0;
    while (i < s.length) {
        var j = i;
        while (separators.indexOf(s[j]) == -1) {
            j++;
        }

        var token = s.substr(i, j - i);
        if (token != "") {
            tokens.push(token);
        }
        if (separators.indexOf(s[j]) > 2) //Добавляем скобки, знаки
            tokens.push(s[j]);
        i = j + 1;
    }
    return tokens;
}

function nextParser(iter, level) {
    if (level + 1 < binaryOperators.length) {
        return parseBinary(iter, level + 1);
    }
    return parseUnary(iter);
}

/**
 * Parse binary expression
 * @param iter iterator over tokens
 * @param level current priority
 */
function parseBinary(iter, level) {
    var expr = nextParser(iter, level);
    while (iter.hasNext()) {
        var command = findCommand(iter.peek(), binaryOperators[level]);
        if (command == null) {
            break;
        }
        var parsed = iter.next();
        var next = nextParser(iter, level);
        expr = command(parsed, expr, next);
    }
    return expr;
}

function parseUnary(iter) {
    if (!iter.hasNext()) {
        return null;
    }
    var key = iter.next();
    if (isNumber(key)) {
        return cnst(new number(parseFloat(key)));
    }
    if (key == "(") {
        var next = parseBinary(iter, 0);
        var closing = iter.next();
        if (closing != ")") {
            throw new Exception(6, closing);
        }
        return next;
    }
    if (key == "[") {
        var result = [];
        while (key != "]") {
            result.push(parseBinary(iter, 0));
            key = iter.peek();
        }
        iter.next();
        return cnst(new lst(result));
    }
    if (key == ")" || key == "]") {
        throw new Exception(1, key);
    }
    if (key[0] == '"') {
        return cnst(new string(key.substr(1)));
    }
    if (key[0] == ":") {
        return variable(key.substr(1));
    }
    var command = findCommand(key, commands);
    if (command != null) {
        var args = [];
        for (var i = 0; i < command.args.length; i++) {
            args.push(parseBinary(iter, 0));
        }
        return command.apply(null, [key].concat(args));
    }
    throw new Exception(6, key);
}

function isNumber(s) {
    return /^[0-9]+(.[0-9]*)*$/.test(s);
}
/**
 * Parses expression, assuming that every operation is left-associative
 * @param s array of tokens
 */
function parseExpressions(s) {
    var iterator = new Iterator(s);
    var result = [];
    while (iterator.hasNext()) {
        result.push(parseBinary(iterator, 0));
    }
    return result;
}

/**
 * Parses function
 * @returns {result}
 */
function parseFunction(iter) {
    var key = iter.next();
    if (key == "to") {
        var name = iter.next();
        var variables = [];
        var types = [];
        while (iter.hasNext()) {
            var arg = iter.peek();
            if (arg[0] == ':') {
                variables.push(arg.substr(1));
                types.push(Type.ANY);
                iter.next();
            } else {
                break;
            }
        }
        var commands = [];
        while (iter.hasNext() && iter.peek() != "end") {
            commands.push(parseBinary(iter, 0));
        }
        if (!iter.hasNext() || iter.hasNext() && iter.peek() != "end") {
            throw new Exception(14);
        }
        iter.next();
        return command(function () {
            addScope(name);
            for (var i = 0; i < arguments.length; i++) {
                getScope().variables.push(new ScopedValue(variables[i], boxValue(arguments[i])));
            }
            addQueue(commands.slice());
        }, [name], types);
    } else {
        throw new Exception(6, key);
    }
}

commands[0] = command(function (x) {
    drawLine(x)
}, ["forward", "fd", "вперед", "вп"], [Type.NUMBER]);

commands[1] = command(function (x) {
    drawLine(-x)
}, ["back", "bk", "назад", "нд"], [Type.NUMBER]);

commands[2] = command(function (x) {
    rotate(x)
}, ["right", "rt", "пр"], [Type.NUMBER]);

commands[3] = command(function (x) {
    rotate(-x)
}, ["left", "lt", "лев"], [Type.NUMBER]);

commands[4] = command(function () {
    stX = 160;
    stY = 95;
    realX = stX;
    realY = stY;
    angle = 0;
    realAngle = Math.PI / 2;
    rotateShape();
    drawShape(overlay);
}, ["home", "домой"], []);

commands[5] = command(function () {
    clean(field);
    data = cleanData();
}, ["clean"], []);

commands[6] = command(function () {
    commands[4]()();
    commands[5]()();
}, ["cg"], []);

commands[7] = command(function () {
    commands[6]()();
    setColor(1);
    setBgColor(0);
    commands[9]()();
    changeBasicShape(0);
    drawShape(overlay);
    changed = textLayer.value != "" || backText.value != "";
}, ["rg"], []);

commands[8] = command(function () {
    pen = false;
    eraser = false
}, ["pu"], []);

commands[9] = command(function () {
    pen = true;
    eraser = false
}, ["pd"], []);


commands[10] = command(function () {
    pen = false;
    eraser = true
}, ["pe"], []);

commands[11] = command(function (s) {
    if (s.length > 8) {
        throw new Exception(11);
    }
    changeName(s);

    // Отправляю файл пользователю
    saveFile.href = encodeFile();
    saveFile.download = captions[2] + ".log";
    saveFile.click();
    changed = false;
}, ["namepage", "np"], [Type.STRING]);

commands[12] = command(function () {
    if (changed) {
        throw new Exception(12);
    }
    window.open('', '_self', '');
    window.close()
}, ["dos"], []);

commands[13] = command(function (n, c) {
    addQueue(c);
    for (var i = 0; i < n - 1; i++)
        scopes.top.commands.top = getQueue().concat(c);
}, ["repeat", "повтори"], [Type.NUMBER, Type.LIST]);

commands[14] = command(function () {
    throw new Exception(7, "to");
}, ["to"], []);

commands[15] = command(function () {
    throw new Exception(7, "end");
}, ["end"], []);

commands[16] = command(function (name, value) {
    var layer = -1;
    var ind = -1;
    // Ищем переменную по всем областям видимости
    for (var j = scopes.length - 1; j > -1; j--) {
        for (var i = 0; i < scopes[j].variables.length; i++) {
            if (scopes[j].variables[i].name == name) {
                ind = i;
                layer = j;
                break;
            }
        }
    }
    if (ind == -1)
        scopes.top.variables.push(new ScopedValue(name, boxValue(value)));
    else {
        scopes[layer].variables[ind].value = boxValue(value);
    }
}, ["make"], [Type.STRING, Type.ANY]);

commands[17] = command(function (x) {
    setColor(x)
}, ["setc"], [Type.NUMBER]);

commands[18] = command(function (x) {
    setBgColor(x)
}, ["setbg"], [Type.NUMBER]);

commands[19] = command(function () {
    var stCol = data[limitY(stY)][limitX(stX)]; // Изначальный цвет
    if (stCol == curColorN)
        return;
    changed = true;
    var q = [];
    q.head = 0;
    q.tail = 0;
    var push = function (x) {
        q[q.head++] = x;
    };
    var pop = function () {
        return q[q.tail++];
    };
    var st = [[0, -1], [-1, 0], [0], [0, 1]]; // Соседние клетки
    push([stX, stY]);
    var i;
    // Медленный, но рабочий поиск в ширину
    while (q.head != q.tail) {
        var c = pop();
        for (i = 0; i < 4; i++) {
            var newX = limitX(c[0] + st[i][0]);
            var newY = limitY(c[1] + st[i][1]);
            if (data[newY][newX] == stCol) {
                push([newX, newY]);
                makeDot[0](newX, newY);
            }
        }
    }
    letsBreak = true;
    setTimeout(slowExecution, 6); // Ждем, пока нарисуется картинка
}, ["fill"], []);

commands[20] = command(function () {
    letsBreak = true;
    setTimeout("changeWindow(6, 2)", 7);
}, ["shapes"], []);

commands[21] = command(function (n) {
    if (n > 90 || n < 0) {
        throw new Exception(15, ["setsh", boxValue(n)]);
    }
    changed = true;
    if (n == 0)
        changeBasicShape(0);
    else changeShape(n);
    drawShape(overlay);
}, ["setsh"], [Type.NUMBER]);

commands[22] = command(function () {
    if (pen) {
        changed = true;
        drawShape();
    }
}, ["stamp"], []);

commands[23] = command(function (f, t) {
    if (t < 1)
        return;
    oscillator.frequency.value = f;
    letsBreak = true;
    playTone();
    setTimeout(function () {
        stopTone();
        slowExecution();
    }, t * 50);
}, ["tone"], [Type.NUMBER, Type.NUMBER]);

commands[24] = command(function (n) {
    if (n < 1)
        return;
    letsBreak = true;
    setTimeout(slowExecution, n * 50);
}, ["wait", "жди"], [Type.NUMBER]);

commands[25] = command(function (f, a) {
    if (f) {
        addQueue(a);
    }
}, ["if", "если"], [Type.BOOL, Type.LIST]);

commands[26] = command(function (f, a, b) {
    var s = (f) ? a : b;
    addQueue(s);
}, ["ifelse", "еслииначе"], [Type.BOOL, Type.LIST, Type.LIST]);

// Operators
commands[27] = command(function (a, b) {
    return new number(a + b);
}, ["+"], [Type.NUMBER, Type.NUMBER]);

commands[28] = command(function (a, b) {
    return new number(a - b);
}, ["-"], [Type.NUMBER, Type.NUMBER]);

commands[29] = command(function (a, b) {
    return new number(a * b);
}, ["*"], [Type.NUMBER, Type.NUMBER]);

commands[30] = command(function (a, b) {
    if (b == 0) {
        throw new Exception(0);
    }
    return new number(a / b);
}, ["/"], [Type.NUMBER, Type.NUMBER]);

commands[31] = command(function (a, b) {
    if (a instanceof Array && b instanceof Array) {
        if (a.length != b.length) {
            return new bool(false);
        }
        var f = true;
        for (var i = 0; i < a.length; i++) {
            f = f && (a[i] == b[i]);
        }
        return new bool(f);
    }
    return new bool(a == b);
}, ["="], [Type.ANY, Type.ANY]);

commands[32] = command(function (a, b) {
    return new bool(a > b);
}, [">"], [Type.NUMBER, Type.NUMBER]);

commands[33] = command(function (a, b) {
    return new bool(a < b);
}, ["<"], [Type.NUMBER, Type.NUMBER]);

commands[34] = command(function () {
    return new bool(true);
}, ["true", "истина"], []);

commands[35] = command(function () {
    return new bool(false);
}, ["false", "ложь"], []);

commands[36] = command(function(a, b) {
    return new bool(a && b);
}, ["and", "и"], [Type.BOOL, Type.BOOL]);

commands[37] = command(function(a, b) {
    return new bool(a || b);
}, ["or", "или"], [Type.BOOL, Type.BOOL]);

commands[38] = command(function(f) {
    return new bool(!f);
}, ["not", "не"], [Type.BOOL]);

commands[39] = command(function (s) {
    return new string(prompt(s));
}, ["readword"], [Type.STRING]);

commands[40] = command(function(l) {
    addQueue(l);
}, ["run"], [Type.LIST]);

var binaryOperators = [
    [commands[31], commands[32], commands[33]], // = > <
    [commands[27], commands[28]],               // + -
    [commands[29], commands[30]]];              // * /

var commandsLength = commands.length; // Количество стандартных команд
