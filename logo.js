/* Обработчик Logo */

// Глобальные переменные

// Описываю свойство top для объекта Array
Object.defineProperty(Object.prototype, "top", {
    get: function () {
        if (this.length != 0)
            return this[this.length - 1];
    },
    set: function (value) {
        if (this.length != 0)
            this[this.length - 1] = value;
    }
});

var stX, stY; // Начальные координаты
var realX, realY; // Текущие координаты
var angle, realAngle; // Угол поворота
var curColor, curColorN; // Цвет черепашки
var defaultColor, defaultColorN; // Цвет фона
var pen, eraser; // Ручка / ластик

// Цвета
var colors = ["#000", "#a8a8a8", "#00a8a8", "#a800a8"];
var bgColors = ["#000", "#fff", "#00a8a8", "#a800a8", "#a80000", "#0000a8",
    "#a85400", "#00a800", "#545454", "#a8a8a8", "#54fcfc", "#fc54fc",
    "#fc5454", "#5454fc", "#fcfc54", "#54fc54"];

/* Список переменных должен быть стеком, 
 * чтобы поддерживать области видимости процедур */

var variables = [];
variables.push([]);

var infinity = Number.POSITIVE_INFINITY;

//Основная функция для обработки комманд (использует ОПН)

var ops = []; //Операторы
ops[0] = ['"', ':'];
ops[1] = ["*", "/"];
ops[2] = ["+", "-"];
ops[3] = [">", "<", "="];

/* После долгих размышления я понял, 
 * что команда в лого являет собой что-то наподобие пары скобок: 
 * она начинается со следующей за командой токена 
 * и идет до тех пор, пока не встретит следующую команду
 * или конец строки 

 * Также в моем лого будет четкая типизация:
 * n - число
 * с - команда
 * s - строка
 * а - список
 * b - логические значения */

function trainStation(s) {
    var opn = []; // Выходная строка
    var stack = [];
    var brackets = []; // Стек скобок
    correct = true;
    /* Счетчик аргументов команд:
     * [0] - счетчик аргументов
     * [1] - необходимое количество */
    var argsCount = [];

    // Добавление новой записи в список аргументов
    var newArg = function (n) {
        argsCount.push([]);
        argsCount.top = [];
        argsCount.top[0] = 0;
        argsCount.top[1] = n;
    };

    var cont = true; // Аргумент продолжается?
    // Заплатка на случай строки без верных команд
    newArg(infinity);

    for (var i = 0; i < s.length; i++) {

        // Символы новых строк пропускаем
        if (s[i] == "\n")
            continue;

        // Если токен - закрывающая скобка
        if (s[i] == ")") {
            //Открывающая скобка
            if (stack.length == 0) {
                opn.push(["error", 1, s[i]]);
                correct = false;
                break;
            }
            while (stack.top[1] != "(") {
                if (stack.top[1] == brackets.top) {
                    brackets.length--;
                    argsCount.length--;
                }
                opn.push(stack.pop());
                // Если не хватает скобочек
                if (stack.length == 0) {
                    opn.push(["error", 1, s[i]]);
                    correct = false;
                    break;
                }
            }
            if (!correct)
                continue;
            argsCount.length--;	// Убираем запись со скобкой
            stack.length--;
            brackets.length--;
            cont = false;
            continue;
        }
        // Одна квадратная скобочка - ошибка
        if (s[i] == "]") {
            opn.push(["error", 1, s[i]]);
            break;
        }
        // Если оператор
        var ind = indexOf(s[i], ops);
        if (ind != infinity && ind != 0) {
            while (stack.length != 0 && ind >= indexOf(stack.top[1], ops))
                opn.push(stack.pop());
            stack.push(["c", s[i]]);
            cont = true; // Оператор расширяет аргумент
            continue;
        }
        // Если аргумент закончился, то увеличиваем счетчик аргументов
        if (!cont) {
            argsCount.top[0]++;

            /* Если в аргументе использовались операторы или команды
             /* То выгружаем их в строку */
            while (stack.top != undefined &&
            stack.top[1] != brackets.top)
                opn.push(stack.pop());
        }
        /* Пока аргументов команды столько, сколько нужно,
         выгружаем команды в выходную строку */

        while (argsCount.top[0] == argsCount.top[1]) {
            while (stack.top != undefined &&
            stack.top[1] != brackets.top)
                opn.push(stack.pop());
            opn.push(stack.pop());
            brackets.length--;
            argsCount.length--;
            if (argsCount.length != 0)
                argsCount.top[0]++;
        }
        // Обработка строковых констант
        if (inList(s[i][0], '"', ':')) {
            opn.push(["u", s[i].slice(1)]);
            opn.push(["c", s[i][0]]);
            cont = false;
            continue;
        }
        if (isFinite(+s[i])) { //Если токен - число
            opn.push(["n", +s[i]]);   //Записываем его в строку
            cont = false; // Число - конец аргумента
            continue;
        }
        // Логические значения
        if (inList(s[i].toLowerCase(), "истина", "ложь")) {
            opn.push(["b", (s[i].toLowerCase() == "истина") ? true : false]);
            continue;
        }
        // Квадратную скобку обрабатываем в лоб
        if (s[i] == "[") {
            var a = [];
            var k = 1; // Количество скобочек
            i++; // Пропускаем первую скобочку
            while (k != 0 && i < s.length) {
                if (s[i] == "[")
                    k++;
                if (s[i] == "]")
                    k--;
                // Не записываем последнюю скобку
                if (k != 0)
                    a.push(s[i++]);
            }
            opn.push(["a", a]);
            cont = false;
            continue;
        }
        // Если не оператор и не число, то это команда или скобка
        var ind = indexOf(s[i].toLowerCase(), names);

        // Если токен не команда или скобка, то это неверная команда
        if (ind == infinity && s[i] != "(") {
            opn.push(["error", 5, s[i]]);
            break;
        }
        // Количество аргументов
        n = (s[i] == "(") ? infinity : args[ind][0];

        // Команды без аргументов обрабатываем отдельно

        if (n == 0) {
            opn.push(["c", s[i]]);
            cont = false;
            continue;
        }
        stack.push(["c", s[i]]);
        brackets.push(s[i]);
        cont = true;
        newArg(n);

    }
    // Опустошаем стек
    while (stack.length != 0) {
        // Круглые скобки не учитываются
        if (stack.top[1] == "(") {
            stack.length--;
            continue;
        }
        opn.push(stack.pop());
    }
    return opn;
}
// Анализирую токен

function analyzeToken() {
    // Получаю токен
    var t = line.top[cur.top++];
    // Ошибка
    if (t[0] == "error") {
        sendError(t[1], t[2]);
        return;
    }
    // Анализируем
    // Цифры, списки, логические значения - в стек
    if (inList(t[0], "n", "u", "a", "b")) {
        stack.top.push(t);
        return;
    }
    // Обработка команд

    var ind = indexOf(t[1].toLowerCase(), names);
    var n = args[ind][0]; // К-во аргументов

    // to не обрабатываем
    if (ind == 14) {
        sendError(7, t[1]);
        return;
    }
    // Считываем аргументы
    var curArgs = [];
    for (var k = 0; k < n; k++) {
        if (stack.top.length == 0) {
            sendError(2, t[1]);
            return;
        }
        curArgs.push(stack.top.pop());
    }
    curArgs.reverse();

    // Проверка на несовпадение типов ("u" - без разницы)
    for (var k = 0; k < n; k++)
        if (curArgs[k][0] != args[ind][k + 1] && args[ind][k + 1] != "u") {
            sendError(3, t[1], curArgs[k]);
            return;
        }
    // Пользовательские команды обрабатываем отдельно
    if (ind >= stCom) {
        work(ind, curArgs, t[1]);
        return;
    }
    cmd[ind].apply(window, curArgs);
}
// Анализирую 20 токенов подряд
function fastAnalyze() {
    for (var i = 0; i < 20; i++) {
        // Проверка на рекурсию
        if (line.length > 359)
            sendError(9);
        // Проверка на выход
        if (line.length == 0 || cur.top == line.top.length || letsBreak) {
            if (scope.length == 0 || !correct) {
                //text.contentEditable = false;
                activeTimer = true;
                // Переходим на следующую строку
                var curE = range.commonAncestorContainer.parentElement;
                if (curE.nextElementSibling == null) {
                    var newLine = document.createElement("li");
                    newLine.innerHTML = "";
                    newLine.contentEditable = true;
                    newLine.n = curE.n + 1;
                    text.appendChild(newLine);
                }
                range = document.createRange();
                range.setStart(curE.nextElementSibling, 0);
                range.collapse();
                selection.removeAllRanges();
                selection.addRange(range);
                text.scrollTop = curE.nextSibling.n * 15;
                range = void(0);
                clearStacks();
            }
            if (letsBreak || line.length == 0) {
                letsBreak = false;
                return;
            }
            if (cur.length != 0) {
                // Если подошли к концу процедуры, то убираем её переменные
                if (scope.top != "")
                    variables.length--;
                if (stack.top.length != 0)
                    sendError(6, stack.top[0]);
                popAll();
                continue;
            }
        }
        analyzeToken();
    }
    setTimeout(fastAnalyze, 4); // Перезапуск с задержкой
}
function drawLine(l) {
    changed = true;
    //Алгоритм Брезенхема, взят из Википедии

    realX += l * Math.cos(realAngle);
    realY -= l * Math.sin(realAngle);
    var endX = Math.round(realX);
    var endY = Math.round(realY);

    var dX = endX - stX;
    var dY = endY - stY;
    var sgnX = Math.sgn(dX);
    var sgnY = Math.sgn(dY);

    dX = Math.abs(dX);
    dY = Math.abs(dY);

    var error = dX - dY;

    /* Пусть f - операция, которую нужно провести с текущим пикселем -
     * Закрасить, очистить или ничего не делать */

    var ind = 2;
    if (pen) ind = 0;
    if (eraser) ind = 1;

    var f = makeDot[ind];

    var x, y; //Текущие координаты точки
    while (stX != endX || stY != endY) {
        x = limitX(stX);
        y = limitY(stY);
        f(x, y);

        if (sgnX == 0) {
            stY += sgnY;
            continue;
        }
        if (sgnY == 0) {
            stX += sgnX;
            continue;
        }
        var error2 = error * 2;
        if (error2 > -dY) {
            error -= dY;
            stX += sgnX;
        }
        ;
        if (error2 < dX) {
            error += dX;
            stY += sgnY;
        }
    }
    f(limitX(stX), limitY(stY));
    drawShape(overlay);
}

//Поворот
function rotate(an) {
    changed = true;
    angle += an;
    angle %= 360;
    if (angle < 0)
        angle += 360;
    realAngle = Math.PI / 2 - angle * Math.PI / 180;
    rotateShape();
    drawShape(overlay);
}

//Очистка экрана
function clean(c) {
    c.clearRect(0, 0, 640, 380);
}

function setColor(x) {
    changed = true;
    x %= 4;
    curColorN = x;
    curColor = colors[x];
    field.fillStyle = curColor;
    overlay.fillStyle = curColor;
    drawShape(overlay);
}
function setBgColor(x) {
    changed = true;
    x %= 16;
    defaultColorN = x;
    defaultColor = bgColors[x];
    canvas.style.backgroundColor = defaultColor;
    text.style.backgroundColor = defaultColor;
    caption.style.backgroundColor = defaultColor;
}
//Вспомогательные функции
//Рисование / Стирание / Перенос точки

var makeDot = [];
// Нарисовать точку
makeDot[0] = function (x, y) {
    data[y][x] = curColorN;
    field.fillRect(2 * x, 2 * y, 2, 2);
};
// Стереть точку
makeDot[1] = function (x, y) {
    data[y][x] = "a";
    field.clearRect(2 * x, 2 * y, 2, 2);
};
// Перенести точку (Ничего не делать)
makeDot[2] = function (x, y) {
};

//Sgn(x)
Math.sgn = function (x) {
    return (x == 0) ? 0 : x / Math.abs(x)
};

//Ограничение Х и У
function limitX(x) {
    x %= 320;
    if (x < 0) x += 320;
    return x;
}
function limitY(y) {
    y %= 190;
    if (y < 0) y += 190;
    return y;
}
/* Индекс строки матрицы, содержащей искомый элемент */

function indexOf(x, c) {
    var ind = infinity;
    for (var i = 0; i < c.length; i++)
        if (c[i].indexOf(x) > -1) {
            ind = i;
            break;
        }
    return ind;
}
// Более удобный аналог case
function inList(x) {
    var temp = false;
    for (var i = 1; i < arguments.length; i++)
        temp = temp || (x == arguments[i]);
    return temp;
}

// Аргумент продолжается?
function checkCont(x) {
    /* Команды, продолжающие расширение строки аргумента функции */
    var cont = ["+", "-", "*", "/", ">", "=", "<", "un-",];
    return cont.indexOf(x) != -1 || isFinite(+x);
}

// Генератор звуков
var context = new AudioContext();
var oscillator = context.createOscillator();
oscillator.type = 'square';
oscillator.start(0);

function playTone() {
    oscillator.connect(context.destination);
}
function stopTone() {
    oscillator.disconnect();
}
