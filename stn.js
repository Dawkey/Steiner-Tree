let size = 15;
let size_px = 35;
let radius_px = 7;

let axis_html = "";
for(let i=1; i<size-1; i++){
    axis_html += `<div>${i}</div>`
}

let $y_axis = document.querySelector(".y_axis");
let $x_axis = document.querySelector(".x_axis");
$y_axis.innerHTML = axis_html;
$x_axis.innerHTML = axis_html;

let $grid = document.getElementById("grid");
let $point = document.getElementById("point");
let $line = document.getElementById("line");


$grid.width = size * size_px;
$grid.height = size * size_px;

$point.width = size * size_px;
$point.height = size * size_px;

let grid_ctx = $grid.getContext("2d");
grid_ctx.strokeStyle = "#666";
grid_ctx.fillStyle = "#666";

let point_ctx = $point.getContext("2d");
point_ctx.strokeStyle = "#666";
point_ctx.fillStyle = "#666";

function draw_grid(){
    for(let i=1; i<size; i++){
        grid_ctx.moveTo(i * size_px, 1 * size_px);
        grid_ctx.lineTo(i * size_px, (size - 1) * size_px);
        grid_ctx.moveTo(1 * size_px, i * size_px);
        grid_ctx.lineTo((size - 1) * size_px, i * size_px);
        grid_ctx.stroke();
    }
    
    grid_ctx.moveTo(size_px, size_px);
    grid_ctx.lineTo(size_px, size_px/3);
    grid_ctx.lineTo(size_px - 4, size_px/3);
    grid_ctx.lineTo(size_px, size_px/3 - 12);
    grid_ctx.lineTo(size_px + 4, size_px/3);
    grid_ctx.lineTo(size_px, size_px/3);
    grid_ctx.fill();
    grid_ctx.stroke();
    
    grid_ctx.moveTo((size-1) * size_px, (size-1) * size_px);
    grid_ctx.lineTo(size * size_px - size_px/3, (size-1) * size_px);
    grid_ctx.lineTo(size * size_px - size_px/3, (size-1) * size_px - 4);
    grid_ctx.lineTo(size * size_px - size_px/3 + 12, (size-1) * size_px);
    grid_ctx.lineTo(size * size_px - size_px/3, (size-1) * size_px + 4);
    grid_ctx.lineTo(size * size_px - size_px/3, (size-1) * size_px);
    grid_ctx.fill();
    grid_ctx.stroke();
}

draw_grid();

function draw_point(arr){
    for(let i=0; i<arr.length; i++){
        let x = arr[i][0];
        let y = arr[i][1];
        let x_px = (x+1) * size_px;
        let y_px = (size - y - 1) * size_px;
        point_ctx.moveTo(x_px, y_px);
        point_ctx.arc(x_px, y_px, radius_px, 0, 2*Math.PI,true);
    }
    point_ctx.fill();
}

function wipe_point(x,y){
    let x_px = (x+1) * size_px;
    let y_px = (size - y - 1) * size_px;
    point_ctx.beginPath();
    point_ctx.clearRect(x_px - radius_px, y_px - radius_px, 2*radius_px, 2*radius_px);
}

//防抖函数
function debounce(fn, internal){

    let timer = null;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(()=>{
            fn.apply(this, arguments);
        }, internal);
    }

}

let prev_position = null;

let entry_arr = [];

$point.addEventListener("click", function(e){
    let x = e.offsetX / size_px - 1;
    let y = e.offsetY / size_px - 1;
    if( Math.abs(x - Math.round(x)) < 0.3 && Math.abs(y - Math.round(y)) < 0.3 ){
        x = Math.round(x);
        y = size - 2 - Math.round(y);
        draw_point([[x,y]]);
        entry_arr.push([x, y]);
    }

});


let $start = document.querySelector(".start");

$start.addEventListener("click", function(){
    let out_arr = entry(entry_arr);
    draw_point(out_arr);
});