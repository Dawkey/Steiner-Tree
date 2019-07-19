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


$grid.width = size * size_px;
$grid.height = size * size_px;

$point.width = size * size_px;
$point.height = size * size_px;


let grid_ctx = $grid.getContext("2d");
grid_ctx.strokeStyle = "#b6b6b6";
grid_ctx.fillStyle = "#b6b6b6";
// grid_ctx.globalCompositeOperation = "source-over";

let point_ctx = $point.getContext("2d");
point_ctx.strokeStyle = "#666";
point_ctx.fillStyle = "#fff";



function draw_grid(){
    grid_ctx.beginPath();

    //绘制网格
    for(let i=1; i<size; i++){
        grid_ctx.moveTo(i * size_px, 1 * size_px);
        grid_ctx.lineTo(i * size_px, (size - 1) * size_px);
        grid_ctx.moveTo(1 * size_px, i * size_px);
        grid_ctx.lineTo((size - 1) * size_px, i * size_px);
    }
    
    //绘制坐标轴的箭头
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

    grid_ctx.closePath();

    grid_ctx.fill();
    grid_ctx.stroke();
}

draw_grid();

function draw_point(arr){
    point_ctx.beginPath();
    for(let i=0; i<arr.length; i++){
        let x = arr[i][0];
        let y = arr[i][1];
        let x_px = (x+1) * size_px;
        let y_px = (size - y - 1) * size_px;
        move_point(point_ctx, x_px, y_px, 0, radius_px, 1);
    }
    point_ctx.closePath();
    point_ctx.fill();
}

function wipe_point(x,y){
    let x_px = (x+1) * size_px;
    let y_px = (size - y - 1) * size_px;
    // point_ctx.beginPath();
    point_ctx.clearRect(x_px - radius_px, y_px - radius_px, 2*radius_px, 2*radius_px);
}

let prev_position = null;

let entry_arr = [];

$point.addEventListener("click", function(e){
    let x = e.offsetX / size_px - 1;
    let y = e.offsetY / size_px - 1;
    if(Math.abs(x - Math.round(x)) < 0.3 && Math.abs(y - Math.round(y)) < 0.3 ){
        x = Math.round(x);
        y = size - 2 - Math.round(y);
        draw_point([[x,y]]);
        entry_arr.push([x, y]);
    }
});


let $start = document.querySelector(".start");

let prev_tree = null;

$start.addEventListener("click", function(){
    let result = steiner(entry_arr);
    let point_arr = result.point;
    let edge_arr = result.edge;
    let tree = result.tree;

    // grid_ctx.clearRect(0, 0, 500, 500);
    // grid_ctx.beginPath();
    // grid_ctx.strokeStyle = "#b6b6b6";
    // draw_grid();

    let count = 0;

    if(prev_tree){
        grid_ctx.beginPath();
        grid_ctx.strokeStyle = "#b6b6b6";
        loop_tree(prev_tree, null, Promise.resolve(), function(){
            // grid_ctx.beginPath();
            // grid_ctx.strokeStyle = "red";

            // loop_tree(tree, null, Promise.resolve("first"));
            // grid_ctx.stroke();
            console.log("wwk");
        });    
        grid_ctx.stroke();
        prev_tree = tree;
        return;
    }

    prev_tree = tree;


    console.log("!!!!!!!!");
    grid_ctx.beginPath();
    grid_ctx.strokeStyle = "red";

    loop_tree(tree, null, Promise.resolve("first"));
    grid_ctx.stroke();

    function loop_tree(node, prev_node, line_promise, fn){
        if(prev_node){
            let now_point = node.value;
            let prev_point = prev_node.value;
            
            let x1 = prev_point[0];
            let y1 = prev_point[1];
            let x1_px = (x1 + 1) * size_px;
            let y1_px = (size - y1 - 1) * size_px;
            let x2 = now_point[0];
            let y2 = now_point[1];
            let x2_px = (x2 + 1) * size_px;
            let y2_px = (size - y2 - 1) * size_px;
            var temp_promise = line_promise.then(function(val){
                if(node.next !== null){
                    count++;
                }
                return move_line(grid_ctx, [x1_px, y1_px], [x2_px, y2_px], 1, 1);
            });
        }else{
            temp_promise = line_promise;
        }

        let next = node.next;
        if(next === null){
            temp_promise.then(function(){
                count++;
                if(count + 1 === point_arr.length){
                    if(fn){
                        fn();
                    }
                    console.log("RUA!");
                }
            });
            return;
        }
        for(let i=0; i<next.length; i++){
            let child_node = next[i];
            loop_tree(child_node, node, temp_promise, fn);
        }
    }
});


function arr_include(arr, val){
    let flag = arr.some(function(value){
        return val.toString() === value.toString();
    });

    return flag;
}


