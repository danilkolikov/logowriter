// Функции для работы с формами
var shapes = [];
shapes[0] = []; // Черепашка - единственная форма с поворотом (14 * 14)
// I четверть
shapes[0][0] = [0, 384, 960, 960, 384, 13260, 8184, 4080, 8184, 8184, 8184, 4080, 6120, 12684, 0, 0]; // 0 градусов
shapes[0][1] = [0, 112, 1648, 624, 994, 2038, 4088, 4088, 4088, 12280, 16368, 2016, 800, 48, 0, 0]; // 15
shapes[0][2] = [0, 112, 3184, 1136, 2016, 4064, 4080, 8188, 24564, 32736, 4064, 1984, 128, 192, 0, 0]; // 30
shapes[0][3] = [0, 128, 156, 220, 2044, 4080, 4088, 12286, 16368, 4080, 4080, 2016, 128, 192, 0, 0]; // 45
shapes[0][4] = [0, 384, 128, 462, 2046, 12286, 16368, 4080, 4080, 4092, 2020, 896, 512, 768, 0, 0]; // 60
shapes[0][5] = [0, 48, 32, 960, 10222, 16382, 4094, 4080, 8176, 8188, 4068, 1984, 1024, 1536, 0, 0]; // 75
shapes[0][6] = [0, 0, 16416, 28512, 8128, 16320, 16364, 32766, 32766, 16364, 16320, 8128, 28512, 16416, 0, 0]; // 90 

// IV четверть
for (var i = 0; i < 6; i++) {
    shapes[0][7 + i] = shapes[0][5 - i].concat();
    shapes[0][7 + i].reverse();
}

// III четверть
for (var i = 0; i < 6; i++) {
    shapes[0][13 + i] = [];
    for (var j = 0; j < 14; j++) {
        var t = decodeNumber(shapes[0][11 - i][j]);
        t.reverse();
        shapes[0][13 + i].push(encodeNumber(t));
    }
}

// II четверть
for (var i = 0; i < 5; i++) {
    shapes[0][19 + i] = shapes[0][17 - i].concat();
    shapes[0][19 + i].reverse();
}

shapes[1] = [0, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0];
for (var i = 2; i < 11; i++)
    shapes[i] = shapes[1];
shapes[11] = [];
shapes[12] = [2016, 8184, 16380, 32766, 32766, 65535, 65535, 65535, 65535, 65535, 65535, 32766, 32766, 16380, 8184, 2016];
shapes[13] = [0, 0, 0, 16, 32, 64, 128, 256, 16383, 256, 128, 64, 32, 16, 0, 0];
shapes[14] = [0, 0, 0, 7740, 16254, 32767, 32767, 32767, 16382, 8188, 2032, 448, 128, 0, 0, 0];
shapes[15] = [2016, 8184, 16380, 32766, 32766, 61455, 61047, 49155, 50787, 50787, 49539, 51219, 51171, 28686, 7800, 960];
shapes[16] = [384, 960, 2016, 2016, 2016, 2016, 2016, 960, 960, 960, 960, 960, 960, 960, 4032, 0];
shapes[17] = [384, 960, 2016, 2032, 2000, 3016, 5064, 960, 960, 384, 864, 1592, 1560, 7704, 0, 0];
shapes[18] = [0, 14, 14, 14, 2, 15, 511, 286, 824, 512, 1024, 1024, 2048, 0, 8192, 8192];
shapes[19] = [0, 896, 896, 896, 128, 65472, 33728, 25024, 6592, 0, 1536, 384, 96, 0, 12, 3];
shapes[20] = [56, 56, 0, 65535, 65535, 65535, 65535, 65535, 65535, 0, 32764, 17156, 23300, 23300, 23548, 23548];
shapes[21] = [0, 0, 14336, 24705, 49347, 52479, 56985, 65433, 32743, 32638, 29464, 25344, 31616, 31616, 0, 0];
shapes[22] = [1792, 3808, 7648, 7136, 14278, 16271, 32575, 59135, 59391, 65534, 32766, 8190, 8190, 32764, 32760, 15608];
shapes[23] = [3432, 12870, 52728, 23767, 61276, 12918, 32229, 12118, 62168, 10666, 20214, 10124, 778, 768, 1792, 3968];
shapes[24] = [768, 1920, 4032, 4032, 14256, 31992, 63612, 63612, 31992, 14256, 4064, 4054, 1943, 813, 116, 100];
shapes[25] = [0, 0, 32767, 128, 8320, 29168, 57096, 30468, 8703, 508, 136, 137, 1022, 0, 0, 0];
shapes[26] = [0, 0, 224, 49376, 65400, 65352, 65352, 65359, 65407, 65407, 112, 61047, 60935, 60935, 0, 0];
shapes[27] = [0, 0, 0, 0, 7936, 12416, 28736, 61472, 65528, 65534, 59367, 10215, 15420, 6168, 0, 0];
shapes[28] = [37376, 17600, 4096, 48, 64632, 64632, 9264, 9648, 10232, 32764, 65532, 65528, 15356, 15238, 15287, 0];
shapes[29] = [65535, 257, 257, 257, 65535, 4112, 4112, 4112, 65535, 257, 257, 257, 65535, 4112, 4112, 4112];
shapes[30] = [43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690, 43690];
shapes[31] = [];

for (var i = 0; i < 16; i++) {
    shapes[11].push(65535);
    shapes[31].push(0);
}

for (var i = 32; i < 91; i++)
    shapes[i] = shapes[31];

// Формы для заглавной страницы
shapes[91] = shapes[0][0];
shapes[92] = shapes[21];
shapes[93] = [0, 16368, 8200, 12260, 8196, 12260, 8196, 12260, 8196, 8196, 8196, 8244, 8244, 8196, 16380, 0];
shapes[94] = [0, 2032, 3096, 6152, 6152, 3096, 48, 96, 192, 384, 384, 384, 0, 384, 384, 0];

var curShape; // Текущая форма
var curShapeN; // Номер формы

// Расшифровка числа
function decodeNumber(x) {
    var t = [];
    t.length = 16;
    for (var i = 15; i > -1; i--) {
        t[i] = x % 2;
        x = Math.floor(x / 2);
    }
    return t;
}
// Шифрование
function encodeNumber(a) {
    var t = 0;
    for (var i = 0; i < a.length; i++)
        t = t * 2 + a[i];
    return t;
}

function decodeShape(a) {
    var t = [];
    for (var i = 0; i < 16; i++)
        t.push(decodeNumber(a[i]));
    return t;
}

function changeBasicShape(n) {
    curShapeN = 0;
    curShape = decodeShape(shapes[0][n]);
}

function changeShape(n) {
    curShapeN = n;
    curShape = decodeShape(shapes[n]);
}

function drawShape(c, x, y, s) {
    if (c)
        clean(c);
    var f = (c) ? false : true;
    c = c || field;
    x = x || stX;
    y = y || stY;
    s = s || curShape;
    var left = limitX(x) - 8;
    var top = limitY(y) - 8;
    for (var i = 0; i < 16; i++)
        for (var j = 0; j < 16; j++)
            if (s[i][j] == 1) {
                var x = limitX(left + j);
                var y = limitY(top + i);
                c.fillRect(2 * x, 2 * y, 2, 2);
                if (f)
                    data[y][x] = curColorN;
            }
}

function rotateShape() {
    if (curShapeN != 0)
        return;
    changeBasicShape(Math.round(angle / 15) % 24);
}
