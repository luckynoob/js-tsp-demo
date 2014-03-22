function square(x) { return x * x; };
function distance(p, q) {
    return Math.sqrt(square(p.x - q.x) + square(p.y - q.y));
};

function path_length(p) {
    var len = 0;
    for(i = 1; i < num_points; i++) 
        len += distance(points[p[i-1]], points[p[i]]);
    len += distance(points[p[0]], points[p[num_points-1]]);
    return Math.floor(len)/mapsize;
};

function factorial(n) {
    var prod = 1;
    for(; n > 1; n--) prod *= n;
    return prod;
}

function reverse(p, i, j) {
    while(i < j) { var temp = p[j]; p[j] = p[i]; p[i] = temp; i++; j--;}
}

function nextpermut(p) {
    var j = p.length - 1;
    while(j > 0 && p[j-1] > p[j]) j--;
    if(j == 0) return false;
    var i = j - 1;
    j = p.length - 1;
    while(p[j] < p[i]) j--;
    var temp = p[j]; p[j] = p[i]; p[i] = temp;
    i++; j = p.length - 1;
    reverse(p, i, j);
    return true;
}

function mutate_path(p) {
    var np = p.slice(0);
    var i = Math.floor(Math.random() * num_points);
    var j = Math.floor(Math.random() * num_points);
    var temp = np[j]; np[j] = np[i]; np[i] = temp;
    return np;
};

function scramble_path(p) {
    var np = p.slice(0);
    var i = Math.floor(Math.random() * num_points);
    var j = Math.floor(Math.random() * num_points);
    var temp;
    if(i > j) {temp = j; j = i; i = temp}
    reverse(np, i, j);
    return np;
};

function draw(path) {
    var canvas = document.createElement('canvas');
    canvas.width=mapsize;
    canvas.height=mapsize;
    canvas.style.border = "1px solid";
    document.body.appendChild(canvas);
    var cts = canvas.getContext("2d");
    cts.moveTo(points[path[0]].x, points[path[0]].y);
    for(i = 1; i < num_points; i++)
        cts.lineTo(points[path[i]].x, points[path[i]].y);
    cts.lineTo(points[path[0]].x, points[path[0]].y);
    cts.stroke();
};

/* simulated annealing solution */
function sasolution(change_path, grain) {
    function prob(heat, len_old, len_new) {
        if(len_new < len_old) return true;
        else if(Math.random() < Math.exp((len_old - len_new) / heat))
            return true;
        else
            return false;
    };
    function temperature(x) {
        return x * best_length;
    };

    var path = []; for(i = 0; i < num_points; i++) path[i] = i;
    var length = path_length(path);
    var best_length = num_points;
    var k_step = 0.01 / square(num_points);
    if(typeof grain !== 'undefined') k_step /= grain;
    for(k = 1; k > 0; k -= k_step) {
        //var new_path = mutate_path(path);
        var new_path = change_path(path);
        var new_length = path_length(new_path);
        var temp = temperature(k);
        if(prob(temp, length, new_length)) { 
            path = new_path;
            length = new_length;
        };
        if(best_length > length) best_length = length;
    };
    document.write('<p>SA ' + change_path.name + ' ' + length + '<br>');
    document.write('steps = ' + Math.floor(1 / k_step) + '</p>');
    draw(path);
};

/* brutal force search */
var brutalforce_max = 10;
function tspexact() {
    if(num_points > brutalforce_max) return;
    var path = []; for(i = 0; i < num_points; i++) path[i] = i;
    var best_path = path.slice(0);
    var best_len = path_length(path);
    while(nextpermut(path)) {
        var length = path_length(path);
        if(length < best_len) {best_path = path.slice(); best_len = length; }
    }
    document.write('<p>Best Path: ' + best_len + '</p>');
    draw(best_path);
}

function generate() {
    points = [];
    for(i = 0; i < num_points; i++) {
        var x = Math.random() * mapsize;
        var y = Math.random() * mapsize;
        points[i] = { x: x, y: y };
    };
}

var mapsize = 400;
var num_points = 20;
var grain = 1;
var points;

click_refresh();

function click_refresh() {
    change_number();
    change_mapsize();
    change_grain();
    document.body.innerHTML = '';
    content();
    generate();
    sasolution(scramble_path, grain);
    sasolution(mutate_path, grain);
    tspexact();
}

function change_number() {
    var number = document.getElementById("num_points");
    if(number == null) return;
    if(number.value > 0 && number.value < 50) 
        num_points = Math.floor(number.value);
}

function change_mapsize() {
    var number = document.getElementById("mapsize");
    if(number == null) return;
    if(number.value >= 100 && number.value <= 600)
        mapsize = number.value;
}

function change_grain() {
    var number = document.getElementById("grain");
    if(number == null) return;
    if(number.value >= 0.1 && number.value <= 100)
        grain = number.value;
}

function content() {
    document.write('<h4>Travelling Salesman Demo</h4>');
    var element;
    ele = document.createElement('input');
    ele.setAttribute("type", "button");
    ele.setAttribute("value", "refresh");
    ele.setAttribute("id", "button1");
    ele.setAttribute("onclick", "click_refresh()");
    document.body.appendChild(ele);
    ele = document.createElement('input');
    ele.setAttribute("type", "number");
    ele.setAttribute("style", "width: 80px;");
    ele.setAttribute("value", num_points);
    ele.setAttribute("id", "num_points");
    document.write('<label>Cities:</label>');
    document.body.appendChild(ele);
    ele = document.createElement('input');
    ele.setAttribute("type", "number");
    ele.setAttribute("style", "width: 80px;");
    ele.setAttribute("value", mapsize);
    ele.setAttribute("id", "mapsize");
    document.write('<label>Mapsize:</label>');
    document.body.appendChild(ele);
    ele = document.createElement('input');
    ele.setAttribute("type", "number");
    ele.setAttribute("style", "width: 80px;");
    ele.setAttribute("value", grain);
    ele.setAttribute("id", "grain");
    document.write('<label>Steps:100*cities^2*</label>');
    document.body.appendChild(ele);
}

