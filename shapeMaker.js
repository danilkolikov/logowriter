var list = $("shapeList");

// Рисуем таблицу
function drawTable() {
    for (var i = 0; i < 15; i++) {
        var line = document.createElement('tr');
        for (var j = 0; j < 6; j++) {
            var cell = document.createElement('td');
            var div = document.createElement('div');
            div.style.width = 32;
            div.style.height = 32;
            div.style.textAlign = "center";
            div.innerText = "" + (i * 6 + j + 1);
            var can = document.createElement('canvas');
            can.className = "cellCanvas";
            can.height = 32;
            can.width = 32;
            cell.appendChild(div);
            cell.appendChild(can);
            cell.n = i * 6 + j + 1;
            line.appendChild(cell);
            changeShape(cell.n);

            var cont = can.getContext("2d");
            cont.fillStyle = "#a8a8a8";
            drawShape(cont, 8, 8);

            cell.onmouseover = function (e) {
                var t = e.target;
                if (t.tagName != "TD")
                    t = t.parentElement;
                t.style.color = "#a800a8";
                var c = t.children[1].getContext("2d");
                c.fillStyle = "#a800a8";
                changeShape(+t.children[0].innerText);
                drawShape(c, 8, 8);
            };

            cell.onmouseout = function (e) {
                var t = e.target;
                if (t.tagName != "TD")
                    t = t.parentElement;
                t.style.color = "inherit";
                var c = t.children[1].getContext("2d");
                c.fillStyle = "#a8a8a8";
                drawShape(c, 8, 8);
            };

            cell.onclick = function (e) {
                var t = e.target;
                if (t.tagName != "TD")
                    t = t.parentElement;
                lastWindow.push(6);
                changeWindow(7, 6);
                load(t.n);
            };
        }
        list.appendChild(line);
    }
}

var table = $("shapeMaker");
var grid;
var littleCanvas = $("littleCanvas").getContext("2d");
var curN;
function load(n) {
    curN = n;
    littleCanvas.fillStyle = "#a8a8a8";
    table.onselectstart = function () {
        return false
    };
    table.innerHTML = "";
    grid = [];
    for (var i = 0; i < 16; i++) {
        var line = document.createElement("tr");
        grid.push([]);
        for (var j = 0; j < 16; j++) {
            var cell = document.createElement("td");
            cell.i = i;
            cell.j = j;
            grid.top.push(cell);
            cell.style.backgroundColor = (curShape[i][j] == 1) ? "#a8a8a8" : "#000";
            cell.style.borderColor = (curShape[i][j] == 1) ? "#000" : "#a8a8a8";
            cell.onclick = fillCell;
            line.appendChild(cell);
        }
        table.appendChild(line);
    }
    drawShape(littleCanvas, 8, 8);
    windows[7].children[1].children[0].innerText = curN;
}

function fillCell(e) {
    var target = e.target;
    var f = target.style.backgroundColor.toString() == "rgb(0, 0, 0)";
    target.style.backgroundColor = (f) ? "#a8a8a8" : "#000";
    target.style.borderColor = (f) ? "#000" : "#a8a8a8";
    // Обновляем форму
    curShape[target.i][target.j] = 1 - curShape[target.i][target.j];
    // Перерисовываем
    clean(littleCanvas);
    drawShape(littleCanvas, 8, 8);
}

function makeAlert() {
    var res = "";
    for (var i = 0; i < 16; i++) {
        var t = [];
        for (var j = 0; j < 16; j++)
            t.push(
                (grid[i][j].style.backgroundColor.toString() == "rgb(0, 0, 0)")
                    ? 0 : 1);
        res += encodeNumber(t) + ", ";
    }
    prompt("Форма " + curN + ": ", res.substring(0, res.length - 2));
}

