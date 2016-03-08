/* Обработчик Logo */

// Глобальные переменные

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

// Анализирую 20 токенов подряд и делаю паузу, чтобы сымитировать медленную работу компьютера
function slowExecution() {
    for (var i = 0; i < 20; i++) {
        // Проверка на рекурсию
        if (scopes.length > 359) {
            sendError(new Exception(9));
        }
        // Проверка на выход
        if (getQueue().length == 0 || letsBreak) {
            if (letsBreak) {
                letsBreak = false;
                activeTimer = false;
                return;
            }
            // Remove clean command queues
            while (getScope().commands.length > 0 && getQueue().length == 0) {
                getScope().commands.pop();
            }

            if (getScope().commands.length == 0) {
                if (scopes.top.name == null) {
                    // We've executed every command on that line
                    var curLine = getCurrent();

                    // Переходим на следующую строку
                    if (curLine.nextElementSibling == null) {
                        var newLine = document.createElement("li");
                        newLine.innerHTML = "";
                        newLine.n = curLine.n + 1;
                        text.appendChild(newLine);
                    }

                    setContentEditable(true);
                    range = document.createRange();
                    range.setStart(curLine.nextElementSibling, 0);
                    range.collapse();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    text.scrollTop = curLine.nextSibling.n * 15;
                    range = void(0);

                    activeTimer = false;
                    return;
                }
                // Go out from scope
                scopes.pop();
                continue;
            }
        }

        var expr = getQueue().shift();
        try {
            expr(scopes);
        } catch (e) {
            sendError(e);
        }
    }
    setTimeout(slowExecution, 4); // Перезапуск с задержкой
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
    return (x > 0) ? 1 : (x == 0) ? 0 : -1;
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

// Более удобный аналог case
function inList(x) {
    for (var i = 1; i < arguments.length; i++) {
        if (x == arguments[i]) {
            return true;
        }
    }
    return false;
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
