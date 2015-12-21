/* Можно было бы использовать меньше массивов
 /* Но так логичнее */

var names = []; // Имена команд
var args = []; // Количество и тип аргументов
var cmd = []; // Сами команды

// Поддержка пользовательских процедур
var argNames = []; // Имена аргументов
var bodies = []; // Тела процедур

names[0] = ["forward", "fd", "вперед", "вп"];
args[0] = [1, "n"];
cmd[0] = function (x) {
    drawLine(x[1])
};

names[1] = ["back", "bk", "назад", "нд"];
args[1] = [1, "n"];
cmd[1] = function (x) {
    drawLine(-x[1])
};

names[2] = ["right", "rt", "пр"];
args[2] = [1, "n"];
cmd[2] = function (x) {
    rotate(x[1])
};

names[3] = ["left", "lt", "лев"];
args[3] = [1, "n"];
cmd[3] = function (x) {
    rotate(-x[1])
};

names[4] = ["home", "домой"];
args[4] = [0];
cmd[4] = function () {
    stX = 160;
    stY = 95;
    realX = stX;
    realY = stY;
    angle = 0;
    realAngle = Math.PI / 2;
    rotateShape();
    drawShape(overlay);
};

names[5] = ["clean"];
args[5] = [0];
cmd[5] = function () {
    clean(field);
    data = cleanData();
};

names[6] = ["cg"];
args[6] = [0];
cmd[6] = function () {
    cmd[4]();
    cmd[5]()
};

// Здесь было rg

names[8] = ["pu"];
args[8] = [0];
cmd[8] = function () {
    pen = false;
    eraser = false
};

names[9] = ["pd"];
args[9] = [0];
cmd[9] = function () {
    pen = true;
    eraser = false
};

names[7] = ["rg"];
args[7] = [0];
cmd[7] = function () {
    cmd[6]();
    setColor(1);
    setBgColor(0);
    cmd[9]();
    changeBasicShape(0);
    drawShape(overlay);
    changed = textLayer.value != "" || backText.value != "";
};

names[10] = ["pe"];
args[10] = [0];
cmd[10] = function () {
    pen = false;
    eraser = true
};

names[11] = ["namepage", "np"];
args[11] = [1, "s"];
cmd[11] = function (s) {
    s = s[1];
    if (s.length > 8) {
        sendError(11, "");
        return;
    }
    changeName(s);

    // Отправляю файл пользователю
    saveFile.href = encodeFile();
    saveFile.download = captions[2] + ".log";
    saveFile.click();
    changed = false;
};

names[12] = ["dos"];
args[12] = [0];
cmd[12] = function () {
    if (changed) {
        sendError(12);
        return;
    }
    window.open('', '_self', '');
    window.close()
};

names[13] = ["repeat", "повтори"];
args[13] = [2, "n", "a"];
cmd[13] = function (n, c) {
    var s = trainStation(c[1]);
    pushAll("", s);
    if (correct)
        for (var i = 0; i < n[1] - 1; i++)
            line.top = line.top.concat(s);
};

names[14] = ["to"];	// Процедуры собираем отдельно
args[14] = [0];
cmd[14] = null;

names[15] = []; // End на лицевой стороне не обрабатывается
args[15] = [0];
cmd[15] = null;

names[16] = ["make"];
args[16] = [2, "s", "u"];
cmd[16] = function (name, value) {
    var ind = infinity;
    name = name[1].toLowerCase();
    // Ищем переменную по всем областям видимости
    for (var j = variables.length - 1; j > -1; j--) {
        var tind = indexOf(name, variables[j]);
        if (tind != infinity) {
            ind = j;
            break;
        }
    }
    if (ind == infinity)
        variables.top.push([name, value]);
    else {
        var temp = indexOf(name, variables[ind]);
        variables[ind][temp][1] = value;
    }
};

names[17] = ["setc"];
args[17] = [1, "n"];
cmd[17] = function (x) {
    setColor(x[1])
};

names[18] = ["setbg"];
args[18] = [1, "n"];
cmd[18] = function (x) {
    setBgColor(x[1])
};

names[19] = ["fill"];
args[19] = [0];
cmd[19] = function () {
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
    var st = [[0, -1], [-1, 0], [1, 0], [0, 1]]; // Соседние клетки
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
    setTimeout(fastAnalyze, 6); // Ждем, пока нарисуется картинка
};

names[20] = ["shapes"];
args[20] = [0];
cmd[20] = function () {
    letsBreak = true;
    setTimeout("changeWindow(6, 2)", 7);
};

names[21] = ["setsh"];
args[21] = [1, "n"];
cmd[21] = function (n) {
    if (n[1] > 90 || n[1] < 0) {
        sendError(3, "setsh", n[1]);
        return;
    }
    changed = true;
    if (n[1] == 0)
        changeBasicShape(0);
    else changeShape(n[1]);
    drawShape(overlay);
};

names[22] = ["stamp"];
args[22] = [0];
cmd[22] = function () {
    if (pen) {
        changed = true;
        drawShape();
    }
};

names[23] = ["tone"];
args[23] = [2, "n", "n"];
cmd[23] = function (f, t) {
    if (t[2] < 1)
        return;
    oscillator.frequency.value = f[1];
    letsBreak = true;
    playTone();
    setTimeout(function () {
        stopTone();
        fastAnalyze();
    }, t[1] * 50);
};

names[24] = ["wait", "жди"];
args[24] = [1, "n"];
cmd[24] = function (n) {
    if (n[1] < 1)
        return;
    letsBreak = true;
    setTimeout(fastAnalyze, n[1] * 50);
};

names[25] = ["if", "если"];
args[25] = [2, "b", "a"];
cmd[25] = function (f, a) {
    var out = trainStation(a[1]);
    if (f[1])
        pushAll("", out);
};

names[26] = ["ifelse", "еслииначе"];
args[26] = [3, "b", "a", "a"];
cmd[26] = function (f, a, b) {
    var s = (f[1]) ? a[1] : b[1];
    pushAll("", trainStation(s));
};

names[27] = ["and", "и"];
args[27] = [2, "b", "b"];
cmd[27] = function (a, b) {
    stack.top.push(["b", a[1] && b[1]]);
};
names[28] = ["not", "не"];
args[28] = [1, "b"];
cmd[28] = function (a) {
    stack.top.push(["b", !a[1]]);
};
names[29] = ["or", "или"];
args[29] = [2, "b", "b"];
cmd[29] = function (a, b) {
    stack.top.push(["b", a[1] || b[1]]);
};
names[30] = ["print"];
args[30] = [1, "u"];
cmd [30] = function (a) {
    changed = true;
    textLayer.value += makeMes(a) + "\n";
    textLayer.scrollTop = 9999;
};
names[31] = ["ct"];
args[31] = [0];
cmd[31] = function () {
    textLayer.value = "";
    changed = changed || backText.value != "";
};
names[32] = ["run"];
args[32] = [1, "a"];
cmd[32] = function (a) {
    pushAll("", trainStation(a[1]));
};
names[33] = ["readchar"];
args[33] = [0];
cmd[33] = function () {
    letsBreak = true;
    readChar = true;
};

names[34] = ["readlist"];
args[34] = [0];
cmd[34] = function () {
    letsBreak = true;
    readList = true;
};
// Операторы - тоже команды, как оказалось
names[35] = ['"'];
args[35] = [1, "u"];
cmd[35] = function (a) {
    stack.top.push(["s", a[1]]);
};

names[36] = [":"];
args[36] = [1, "u"];
cmd[36] = function (a) {
    // Проверяем наличие переменной во всех областях видимости
    var ind = infinity;
    a[1] = a[1].toLowerCase();
    for (var j = variables.length - 1; j > -1; j--)
        if (indexOf(a[1], variables[j]) != infinity) {
            ind = j;
            break;
        }
    if (ind == infinity) {
        // Если нет такой переменной
        sendError(4, a[1]);
        return;
    }
    var temp = indexOf(a[1], variables[ind]);
    stack.top.push(variables[ind][temp][1]);
};

names[37] = ["+"];
args[37] = [2, "n", "n"];
cmd[37] = function (a, b) {
    stack.top.push(["n", a[1] + b[1]]);
};

names[38] = ["-"];
args[38] = [2, "n", "n"];
cmd[38] = function (a, b) {
    stack.top.push(["n", a[1] - b[1]]);
};

names[39] = ["*"];
args[39] = [2, "n", "n"];
cmd[39] = function (a, b) {
    stack.top.push(["n", a[1] * b[1]]);
};

names[40] = ["/"];
args[40] = [2, "n", "n"];
cmd[40] = function (a, b) {
    if (b == 0) {
        sendError(0);
        return;
    }
    stack.top.push(["n", a[1] / b[1]]);
};

names[41] = ["="];
args[41] = [2, "u", "u"];
cmd[41] = function (a, b) {
    if (a[0] != b[0]) {
        stack.top.push(["b", false]);
        return;
    }
    switch (a[0]) {
        case "n":
        case "s":
        case "u":
        case "b":
            stack.top.push(["b", a[1] == b[1]]);
            break;
        case "a":
            var f = true;
            for (var i = 0; i < a[1].length; i++) {
                if (i == b[1].length) {
                    f = false;
                    break;
                }
                f = f && (a[1][i] == b[1][i]);
            }
            f = f && (i == b[1].length);
            stack.top.push(["b", f]);
            break;
    }
};

names[42] = [">"];
args[42] = [2, "n", "n"];
cmd[42] = function (a, b) {
    stack.top.push(["b", a[1] > b[1]]);
};

names[43] = ["<"];
args[43] = [2, "n", "n"];
cmd[43] = function (a, b) {
    stack.top.push(["b", a[1] < b[1]]);
};

var stCom = names.length; // Количество стандартных команд

// Функция обработки процедур
function work(ind, curArgs, tScope) {
    variables.push([]);
    for (var i = 0; i < curArgs.length; i++)
        variables.top.push([argNames[ind - stCom][i], curArgs[i]]);
    pushAll(tScope, bodies[ind - stCom]);
}
