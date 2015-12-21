/* "Оболочка" Logo */

//Глобальные переменные
// Получаем элементы страницы

function $(s) {
    return document.getElementById(s);
}
var text = $("text"); // Текстовое поле
var canvas = $("canvas");
var overcanvas = $("overlay");
var overlay = overcanvas.getContext("2d"); // Поле для черепашки
var field = canvas.getContext("2d"); // Поле для рисования
var backText = $("back-text"); // Код на изнанке

// Окна программы
var windows = [];
windows[0] = $("splash");
windows[1] = $("welcome");
windows[2] = $("face");
windows[3] = $("back");
windows[4] = $("help");
windows[5] = $("settings");
windows[6] = $("shp");
windows[7] = $("shpEdit");

var lastWindow = []; // Стек последних открытых окон (для esc)

var helpPages = []; // Страницы справки
helpPages[0] = $("1st");
helpPages[1] = $("2nd");
helpPages[2] = $("3rd");
helpPages[3] = $("4th");
helpPages[4] = $("5th");
helpPages[5] = $("6th");
helpPages[6] = $("7th");
var curHelpPage; // Номер страницы 
var nav = $("nav");
var navButtons = nav.children[1].children[0].children[0].children;

var caption = $("caption"); // Заголовок
var captions = ["", "Оглавление", "???", "???", "Справка", "Настройки", "Формы", "Формы"];

var textLayer = $("textlayer"); // Слой с текстом
var data = []; // Массив для хранения изображения
var curCmds = [];  //Список комманд для выполнения
var letsBreak; // Прерывание отрисовки по нажатию ctrl+c
var textFocus = false;
var curWindow = 0; // Текущее окно
var changed;
var loaded;
var tick; // Интервал
var activeTimer = false; // Запущен ли таймер
var correct; // Корректность введенных команд (для перевода в ОПН)
var range; // Сохранение выделения

//Обработчик нажатия клавиш
var readChar; // Считываем нажатие одной клавиши
var readList; // Считываем нажатие нескольких клавиш
var charLine = ""; // Считанные символы]
var selection = window.getSelection(); // Выделенная строка

// Символ неразрывного пробела
//var nbsp = $("nbsp").innerText;
text.children[0].n = 0;

/* Для имитации медленной работы процессора, я выполняю все команды
 * с задержкой. Из-за особенностей javascript-a нельзя сделать задержку 
 * в рекурсивном алгоритме. Поэтому я имитирую рекурсию с помощью стеков
 */

var scope; // Стек областей видимости
var line; // Стек выполняемых строк (Для поддержки repeat и иже с ними)
var cur; // Стек счетчиков в строках
var stack; // Стек стеков (Yo dawg!)
clearStacks();
function pushAll(tScope, tLine) {
    scope.push(tScope);
    line.push(tLine);
    cur.push(0);
    stack.push([]);
}
function popAll() {
    scope.length--;
    line.length--;
    cur.length--;
    stack.length--;
}
function clearStacks() {
    scope = [];
    line = [];
    cur = [];
    stack = [];
}

// Сменить окно (куда, откуда)
function changeWindow(e, s) {
    for (var i = 0; i < windows.length; i++)
        windows[i].style.zIndex = -1;
    windows[e].style.zIndex = 1;
    caption.innerHTML = captions[e];
    text.contentEditable = false;
    text.style.backgroundColor = "#000";
    switch (e) {
        case 2:
            if (!cur.top)
                text.contentEditable = true;
            if (!changed)
                initLogo();
            text.style.backgroundColor = defaultColor;
            break;
        case 3:
            backText.focus();
            showBackCaption();
            break;
        case 4:
            changeHelpWindow(0);
            break;
    }

    if (s > 3 && inList(e, 1, 2)) {
        oscillator.frequency.value = 1000;
        playTone();
        setTimeout(stopTone, 80);
    }

    if (inList(s, 1, 2))
        lastWindow.push(s);
    if (e == 1) {
        loaded = false;
        lastWindow = [];
    }

    switch (s) {
        case 0:
            $("input").style.zIndex = 1;
            break;
        case 3:
            getCommands(backText.value, "get");
            showBackCaption();
            break;
        case 6:
            if (cur.top)
                setTimeout(fastAnalyze, 82);
            break;
        case 7:
            shapes[curN] = [];
            for (var i = 0; i < 16; i++)
                shapes[curN].push(encodeNumber(curShape[i]));
            curN--;
            var t = list.children[Math.floor(curN / 6)].children[curN % 6].children[1].getContext("2d");
            curN++;
            drawShape(t, 8, 8);
            //makeAlert();
            break;
    }

    curWindow = e;
}

// Подсветка пунктов меню
function highlightText(e) {
    var range = document.createRange();
    var target = (e.target.tagName != "DIV") ? e.target.parentElement : e.target;
    range.selectNode(target);
    selection.removeAllRanges();
    selection.addRange(range);
}
function removeHighlight(e) {
    selection.removeAllRanges();
}
for (var i = 3; i < 7; i++) {
    if (i == 5)
        continue;
    windows[1].children[i].onmouseover = highlightText;
    windows[1].children[i].onmouseout = removeHighlight;
}


for (var i = 2; i < 8; i++) {
    helpPages[0].children[i].onmouseover = highlightText;
    helpPages[0].children[i].onmouseout = removeHighlight;
}

text.onmousedown = textClick;
// Возвращение в предыдущее окно по нажатию поля
function textClick(event) {
    if (!inList(curWindow, 2, 3)) {
        selection.removeAllRanges();
        event.preventDefault();
        return false;
    }
    if (curWindow == 3) {
        changeWindow(lastWindow.pop(), curWindow);
    }
}
// Обработка клавиш

// Тело программы
function getKeyBody(e) {
    var id = e.keyCode;
    if (curWindow == 0 && id == 13) {
        changeWindow(1, 0);
        e.preventDefault();
        return;
    }

    if (readList && id == 13) {
        stack.top.push(["a", [charLine]]);
        textLayer.value += "\n";
        readList = false;
        charLine = "";
        setTimeout(fastAnalyze, 4);
    }

    if (id == 27) {
        if (lastWindow.length == 0)
            return;
        if (curWindow == 2 && loaded) {
            saveFile.href = encodeFile();
            saveFile.download = captions[2] + ".log";
            saveFile.click();
            changeWindow(2, 1);
            e.preventDefault();
            return;
        }

        if (curWindow == 2 && changed) {
            for (var i = 0; i < text.childElementCount; i++)
                if (check(text.children[i]))
                    text.children[i].remove();
            sendError(12);
            return;
        }


        changeWindow(lastWindow.pop(), curWindow);
        e.preventDefault();
    }

    if (curWindow == 2 && e.ctrlKey && id == 83) {
        sendError(13);
        e.preventDefault();

    }

}
document.body.onkeydown = getKeyBody;
// Проверка строки на содержание ошибки
function check(t) {
    return t.children[0] && t.childNodes[0].tagName == "SPAN"
        && t.childNodes[0].style.color != "";
}

function selectPrevious(node) {
    range = document.createRange();
    if (node.previousElementSibling == null) {
        return;
    }
    var text1 = getTextNode(node.previousElementSibling);
    range.setEnd(text1, text1.length ? text1.length : 0);
    range.collapse();
    selection.removeAllRanges();
    selection.addRange(range);
    text.scrollTop = node.previousElementSibling.n * 15;
    range = void(0);
}

function selectNext(node) {
    range = document.createRange();
    if (node.nextElementSibling == null) {
        return;
    }
    var text = getTextNode(node.nextElementSibling);
    range.setStart(text, 0);
    range.collapse();
    selection.removeAllRanges();
    selection.addRange(range);
    text.scrollTop = node.nextElementSibling.n * 15;
    range = void(0);
}

function getLiNode(node) {
    while (node.parentElement != null && node.tagName != "LI") {
        node = node.parentElement;
    }
    return node;
}

function getTextNode(node) {
    while (node.firstChild != null) {
        node = node.firstChild;
    }
    return node;
}

// Поле команд
function getKeyText(e) {
    var id = e.keyCode;
    // Не даем стереть поле для ввода
    if (id == 8 && curWindow == 2) {
        var node = getLiNode(selection.baseNode);
        var position = selection.getRangeAt(0).endOffset;
        if (node.previousElementSibling == null && position == 0) {
            e.preventDefault();
            return false;
        }
        if (position == 0) {
            selectPrevious(node);
            if (node.innerText == "") {
                node.remove();
            }
            e.preventDefault();
        }
        return;
    }

    // Стрелка вверх
    if (id == 38 && curWindow == 2) {
        var node = getLiNode(selection.baseNode);
        selectPrevious(node);
        e.preventDefault();
        return;
    }

    // Стрелка вниз
    if (id == 40 && curWindow == 2) {
        var node = getLiNode(selection.baseNode);
        selectNext(node);
        e.preventDefault();
        return;
    }

    // Delete

    if (id == 46 && curWindow == 2) {
        var node = getLiNode(selection.baseNode);
        var pos = selection.getRangeAt(0).endOffset;
        if (pos == node.innerText.length) {
            selectNext(node);
        }
        if (node.innerText.length == 0) {
            node.remove();
        }
    }

    if (id == 13 && curWindow == 2) {
        var cur = getCurrent();
        // Проверка на содержание ошибки в строке

        // Удаляем ошибку из текущей строки
        if (check(cur)) {
            cur.children[0].remove();
            cur.innerHTML = "";
            e.preventDefault();
            return;
        }


        /* Если же строка содержит команду, то удаляем все строчки
         /* с ошибками */
        for (var i = 0; i < text.childElementCount; i++)
            if (check(text.children[i]))
                text.children[i].remove();

        // Обрабатываем команду
        getCommands(cur.innerText);
        e.preventDefault();
        return;

    }
    if (e.ctrlKey && id == 70) {
        changeWindow(3, 2);
        e.preventDefault();
        return;
    }
}
text.onkeydown = getKeyText;

// Обработка readchar и readlist отдельно
document.body.onkeypress = function (e) {
    var id = e.keyCode;
    if (readChar || readList) {
        if ((id > 47 && id < 58) || (id > 64 && id < 91) || (id > 94 && id < 123))
            charLine += String.fromCharCode(id);
        else charLine += " ";

        if (readChar) {
            stack.top.push(["s", charLine]);
            readChar = false;
        }
        if (readList && id != 13) {
            textLayer.value += charLine.top;
            return;
        }
        charLine = "";
        setTimeout(fastAnalyze, 0);
        return;
    }
};

backText.onkeydown = function (e) {
    if (e.ctrlKey && e.keyCode == 70) {
        changeWindow(2, 3);
        e.preventDefault();
        return;
    }
};

// Получаем текущую строку
function getCurrent() {
    var res = selection.baseNode;
    while (res.tagName != "LI")
        res = res.parentElement;
    return res;
}
function init() {
    splash.style.zIndex = 1;
    drawTable();
    var imgs = document.getElementsByClassName("image");
    var img = [];
    for (var i = 0; i < 4; i++) {
        imgs[i].n = 91 + i;
        img[i] = imgs[i].firstElementChild.getContext("2d");
        img[i].fillStyle = "#a8a8a8";
        drawShape(img[i], 8, 8, decodeShape(shapes[91 + i]));
    }
}

//Инициализация logo
function initLogo(name, x, y, an, col, def, p, e) {
    if (name == undefined) {
        changeName("???");
        data = cleanData();
    } else changeName(name);
    stX = x || 160;
    stY = y || 95;
    realX = stX;
    realY = stY;
    angle = an || 0;
    realAngle = (angle + 90) * Math.PI / 180;
    changeBasicShape(0);
    setColor(col || 1);
    setBgColor(def ? def : 0);
    pen = p || true;
    eraser = e ? e : false;
    changed = false;
}

function changeHelpWindow(s) {
    windows[4].scrollTop = 0;
    if (curHelpPage != undefined) {
        $("helpText").appendChild(windows[4].children[1]);
        $("helpText").appendChild(nav);
        nav.style.opacity = 1;
        navButtons[0].style.opacity = 1;
        navButtons[2].style.opacity = 1;
    }
    windows[4].appendChild(helpPages[s]);
    windows[4].appendChild(nav);
    switch (s) {
        case 0:
            nav.style.opacity = 0;
            break;
        case 1:
            navButtons[0].style.opacity = 0;
            break;
        case 6:
            navButtons[2].style.opacity = 0;
            break;
    }
    curHelpPage = s;
}

function navigation(e) {
    var trg = e.target;
    if (curHelpPage == 0)
        return false;
    if ((curHelpPage == 1 && trg == navButtons[0]) ||
        (curHelpPage == 6 && trg == navButtons[2]))
        return false;
    switch (trg) {
        case navButtons[0]:
            changeHelpWindow(curHelpPage - 1);
            break;
        case navButtons[1]:
            changeHelpWindow(0);
            break;
        default:
            changeHelpWindow(curHelpPage + 1);
    }
}

for (var i = 0; i < 3; i++)
    navButtons[i].addEventListener("click", navigation);
//Перевод строки с коммандами в список комманд

function getCommands(s, p) {
    //Разбиение на токены
    s = " " + s + " ";
    var commands = [];
    var signs = [" ", "\t", "\n", "[", "]", "(", ")"];
    var i = 0;
    while (i < s.length) {
        var sl = "";
        while (signs.indexOf(s[i]) == -1)
            sl += s[i++];
        if (sl != "")
            commands.push(sl);
        if (signs.indexOf(s[i]) > 2) //Добавляем скобки, знаки и \n
            commands.push(s[i]);
        i++;
    }
    //Если изнанка, то запоминаем процедуры:
    if (p == "get") {
        collect(commands);
        return;
    }
    commands = trainStation(commands, ""); // Переводим в ОПН
    letsBreak = false;
    clearStacks();
    pushAll("", commands);
    // Сохраняем выделение
    range = selection.getRangeAt(0);
    text.contentEditable = false;
    text.blur();
    activeTimer = true;
    tick = setTimeout(fastAnalyze, 0); // Обрабатываем команды
}

// Расшифровка типов данных
function makeMes(s) {
    var mes = "";
    switch (s[0]) {
        case "n":
        case "u":
        case "s":
        case "o":
            mes += s[1];
            break;
        case "b":
            mes += (s[1]) ? "ИСТИНА" : "ЛОЖЬ";
            break;
        case "a":
            var mes = "";
            for (var i = 0; i < s[1].length; i++)
                mes += s[1][i] + " ";
            mes = mes.substring(0, mes.length - 1);
            break;
    }
    return mes;
}

// Ловля ошибок
function sendError(n) {
    // Останавливаем выполнение программы
    letsBreak = true;
    correct = false;
    var mes = "";
    var a = arguments;
    switch (n) {
        case 0:
            mes = "Не могу разделить на 0";
            break;
        case 1:
            mes = a[1] + " не на месте";
            break;
        case 2:
            mes = a[1] + " не хватает входных данных";
            break;
        case 3:
            mes = a[1] + " не допускает " + makeMes(a[2]) + " на входе";
            break;
        case 4:
            mes = a[1] + " не присвоено значение";
            break;
        case 5:
            mes = "Не знаю, как выполнить " + a[1];
            break;
        case 6:
            mes = "Не знаю, что делать с " + makeMes(a[1]);
            break;
        case 7:
            mes = "Не могу использовать " + a[1] + " как команду";
            break;
        case 8:
            mes = a[1] + " является именем примитива";
            break;
        case 9:
            mes = "Слишком много рекурсии";
            break;
        case 10:
            mes = "Команда " + a[1] + " не реализована";
            break;
        case 11:
            mes = "Имя страницы должно содержать не более 8 символов";
            break;
        case 12:
            mes = "Назовите, пожалуйста, эту страницу";
            break;
        case 13:
            mes = "Прервана!!!";
            break;
    }
    if (scope != undefined && scope.top != "" && scope.top != undefined)
        mes += " в " + scope.top;
    showError(mes);
}

function showError(s) {
    var cur = (range) ? range.commonAncestorContainer : selection.baseNode;

    while (cur.parentElement != text) {
        cur = cur.parentElement;
        if (cur == null)
            return;
    }
    var line = document.createElement('li');
    line.contentEditable = true;
    line.n = cur.n + 1;
    var mes = document.createElement('span');
    mes.style.color = "#A800A8";
    mes.innerText = s;
    line.appendChild(mes);
    text.insertBefore(line, cur.nextElementSibling);
    text.scrollTop = line.n * 15
}

//Сборка подпрограмм пользователя
function collect(s) {
    names.length = stCom;
    args.length = stCom;
    cmd.length = stCom;
    argNames.length = 0;
    bodies.length = 0;
    // Собираем процедуры, начинающиеся с to
    for (var i = 0; i < s.length; i++)
        if (s[i] == "to") {
            correct = true;
            if (i++ == s.length) {
                continue;
            }
            var name = s[i++];
            if (indexOf(name, names) <= stCom) {
                sendError(8, "", name);
                return;
            }
            var varNames = []; // Список переменных
            var arguments = [0]; // Список аргументов

            // Собираем переменные
            while (s[i] != "\n" && i < s.length) {
                var st = (inList(s[i][0], '"', ":")) ? 1 : 0;
                varNames.push(s[i].slice(st));
                arguments.push("u");
                i++;
            }
            arguments[0] = varNames.length;

            /* Для поддержки рекурсивных подпрограмм
             /* Заношу имя и к-во аргументов до обработки команд */
            names.push([name]);
            args.push(arguments);


            // Собираем команды
            var commands = [];
            i++;
            while (s[i] != "end" && i < s.length)
                commands.push(s[i++]);
            commands = trainStation(commands, name); // Переводим в ОПН

            if (!correct) {
                names.length--;
                args.length--;
                continue;
            }
            // Запоминаем
            cmd.push(null);
            argNames.push(varNames);
            bodies.push(commands);
        }
}

// Запись информации о файле
function encodeFile() {
    // Текущие параметры черепашки
    var par = "" + stX + " " + stY + " " + angle + " " + curColorN +
        " " + defaultColorN + " " + pen + " " + eraser;

    var field = "";
    var k = 0;
    // Сжимаю данные о поле для рисования
    for (var i = 0; i < 60799; i++) {
        var cy = Math.floor(i / 320);
        var cx = i % 320;
        var ny = Math.floor((i + 1) / 320);
        var nx = (i + 1) % 320;
        if (data[cy][cx] == data[ny][nx]) {
            k++;
            continue;
        }
        if (k > 0) {
            field += "$" + (k + 1) + "%" + data[cy][cx];
            k = 0;
            continue;
        }
        field += data[cy][cx];
        k = 0;
    }
    if (k > 0)
        field += "$" + (k + 1) + "%" + data[ny][nx];
    else field += data[ny][nx];
    // Записываем команды пользователя
    var cmds = "";
    for (var i = 0; i < text.children.length; i++)
        if (!check(text.children[i]))
            cmds += text.children[i].innerHTML + "\n";
    console.log(cmds);
    // Запоминаем переменные
    var vars = "";
    for (var i = 0; i < variables[0].length; i++)
        vars += variables[0][i][0] + " " + variables[0][i][1][0] + " "
        + makeMes(variables[0][i][1]) + "\n";
    console.log(vars);
    var out = captions[2] + "\r" + field + "\r" + par + "\r" +
        cmds + "\r" + textLayer.innerHTML + "\r" + backText.value + "\r" +
        vars;
    var link = "data:application/octet-stream," + encodeURIComponent(out);
    return link;
}

function decodeFile(s) {
    var str = s.split("\r");
    var fd = str[1];
    var k = 0;
    // Восстанавливаем картинку
    data = cleanData();
    clean(field);
    for (var i = 0; i < fd.length; i++) {
        if (fd[i] == "$") {
            var t = "";
            i++;
            while (fd[i] != "%")
                t += fd[i++];
            var n = +t;
            i++;
            if (fd[i] == "a") {
                k += n;
                continue;
            }
            curColorN = +fd[i];
            curColor = colors[curColorN];
            field.fillStyle = curColor;
            for (var j = 0; j < n; j++) {
                var y = Math.floor(k / 320);
                var x = k % 320;
                makeDot[0](x, y);
                k++;
            }
            continue;
        }
        if (fd[i] == "a") {
            k++;
            continue;
        }
        var y = Math.floor(k / 320);
        var x = k % 320;
        curColorN = +fd[i];
        curColor = colors[curColorN];
        field.fillStyle = curColor;
        makeDot[0](x, y);
        k++;
    }
    // Возвращаем координаты
    var par = str[2].split(" ");
    // Восстанавливаем поле
    initLogo(str[0], +par[0], +par[1], +par[2], +par[3], +par[4],
        par[5] == "true", par[6] == "true");

    // Восстанавливаем текстовoe полe
    var lines = str[3].split("\n");
    text.innerHTML = "";
    for (var i = 0; i < lines.length; i++) {
        var l = document.createElement("li");
        l.innerHTML = lines[i] || "";
        l.n = i;
        text.appendChild(l);
    }
    text.scrollTop = lines.length * 15;
    textLayer.value = str[4];
    backText.value = str[5];
    getCommands(str[5], "get");
    var vars = str[6].split("\n");
    for (var i = 0; i < vars.length; i++)
        if (vars[i] != "") {
            var vals = vars[i].split(" ");
            var name = vals[0];
            var type = vals[1];
            var value;
            switch (type) {
                case "n":
                    value = +vals[2];
                    break;
                case "s":
                    value = vals[2];
                    break;
                case "b":
                    value = vals[2] == "ИСТИНА";
                    break;
                case "a":
                    value = [];
                    for (var j = 2; j < vals.length; j++)
                        if (vals[j] != "")
                            value.push(vals[j]);
                    break;
            }
            variables[0].push([name, [type, value]]);
        }
}

// Зaгрузка из файла
function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();
    if (curWindow == 0)
        return;
    var files = e.dataTransfer.files;
    var file = files[0];
    if ((file == undefined) || !(/log.*/).test(file.name))
        return;
    text.value = "Загрузка...";
    var reader = new FileReader();
    reader.onload = function (evt) {
        var s = evt.target.result;
        changeWindow(2, 1);
        decodeFile(s);
        loaded = true;
    };
    reader.readAsText(file);
}

function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

windows[1].addEventListener('dragover', handleDragOver, false);
windows[1].addEventListener('drop', handleFileSelect, false);

document.ondragover = function () {
    return false
};

document.ondrop = function () {
    return false
};

// Создание чистой матрицы
function cleanData() {
    var dat = [];
    for (var i = 0; i < 190; i++) {
        dat.push([]);
        for (var j = 0; j < 320; j++)
            dat[i].push("a");
    }
    return dat;
}

// Смена имени
function changeName(n) {
    captions[2] = n;
    captions[3] = n;
    caption.innerHTML = n;
}

function showBackCaption() {
    var backC = $("backC");
    if (backC.hidden) {
        backC.hidden = false;
        caption.style.backgroundColor = "transparent";
        caption.style.color = "#000";
    } else {
        backC.hidden = true;
        caption.style.color = "#a800a8";
    }
}
