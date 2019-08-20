let size = 17;
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

let $main = document.getElementsByClassName("main")[0];

$grid.width = size * size_px;
$grid.height = size * size_px;

$point.width = size * size_px;
$point.height = size * size_px;

$line.width = size * size_px;
$line.height = size * size_px;

let grid_ctx = $grid.getContext("2d");
grid_ctx.strokeStyle = "#b6b6b6";

let point_ctx = $point.getContext("2d");
point_ctx.strokeStyle = "#666";
point_ctx.fillStyle = "#fff";

let line_ctx = $line.getContext("2d");
line_ctx.strokeStyle = "red";


//绘制坐标系
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


//绘制坐标点
function draw_point(x, y){
    let x_px = (x+1) * size_px;
    let y_px = (size - y - 1) * size_px;
    return move_point(point_ctx, x_px, y_px, 0, radius_px, 1);
}

//擦拭坐标点
function wipe_point(x, y){
    let x_px = (x+1) * size_px;
    let y_px = (size - y - 1) * size_px;
    return move_point(point_ctx, x_px, y_px, radius_px, 0, -1);
}


//控制整个进程的flag变量（三种值：true, false, 'always'），避免绘制过程中，继续操作，导致程序出错。
let process_flag = true;
//控制清除画布的flag变量（两种值：true, false），避免在绘制过程中执行清除操作，导致画布清理不干净。
let wipe_flag = true;

//存放输入点坐标的数组
let entry_arr = [];
//左边区域显示输入点坐标的DOM元素
let $entry = document.getElementsByClassName("entry")[0];


//点画布点击事件
$point.addEventListener("click", function(e){
    if(process_flag === false){
        return;
    }

    let x = e.offsetX / size_px - 1;
    let y = e.offsetY / size_px - 1;    
    if(Math.abs(x - Math.round(x)) < 0.3 && Math.abs(y - Math.round(y)) < 0.3 ){
        x = Math.round(x);
        y = size - 2 - Math.round(y);

        if(x < 0 || x > 15 || y < 0 || y > 15){
            return;
        }

        let index = arr_include(entry_arr, [x,y]);
        let promise = Promise.resolve();
        if(index !== -1){
            promise = wipe_point(x, y);
            entry_arr.splice(index, 1);
        }else{
            //限制点的个数最多为 15 个
            if(entry_arr.length === 15){
                return;
            }
            promise = draw_point(x, y);
            entry_arr.push([x, y]);
        }
        
        let html = "";
        for(let i=0; i<entry_arr.length; i++){
            html += `<div>[${entry_arr[i].join(", ")}]</div>`;
        }        

        $entry.innerHTML = html;

        result_show("--", "--");

        if(process_flag === "always"){
            if(entry_arr.length > 11){
                $main.classList.add("loading");
            }

            let distance = size * size_px;
            line_ctx.clearRect(0, 0, distance, distance);
            promise.then(function(){
                prev_tree = null;
                if(index === -1){
                    draw_line([x, y]);
                }else{
                    draw_line();
                }
            });
        }        
    }    
});


//draw按钮
let $draw = document.querySelector(".draw");
//wipe按钮
let $wipe = document.querySelector(".wipe");


//使用worker创建一个额外进程来专门进行steiner的计算，避免计算量较大时，阻塞主进程。
//创建一个worker进程
let worker = new Worker("./js/worker.js");

//递归时，指代前一颗树的临时变量
let prev_tree = null;
//绘制路径
function draw_line(start_point){
    if(entry_arr.length < 2){
        return;
    }

    //在线条绘制期间，禁止相关操作的触发
    process_flag = false;
    wipe_flag = false;

    worker.postMessage({entry_arr: entry_arr, start_point: start_point});
    worker.onmessage = (function(event){
        $main.classList.remove("loading");

        let result = event.data.result;
        let point_arr = result.point;
        // let edge_arr = result.edge;
        let tree = result.tree;

        let time = result.time + " ms";
        let cost = result.cost;    

        //count是一个用来判断绘制动画是否结束的 flag。
        let count = 0;        

        line_ctx.beginPath();
        line_ctx.strokeStyle = "red";

        loop_tree(tree, null, Promise.resolve(), function(){
            result_show(time, cost);
        });
        line_ctx.stroke();

        //由树的数据结构，广度遍历树的每一个节点，绘制父节点到子节点的路径（使用move_line达到动画效果）。
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
                var temp_promise = line_promise.then(function(){
                    if(node.next !== null){
                        //每次树有新的分支时，对count进行加一。
                        count++;
                    }
                    return move_line(line_ctx, [x1_px, y1_px], [x2_px, y2_px], 5, 5);
                });
            }else{
                temp_promise = line_promise;
            }

            let next = node.next;
            if(next === null){
                temp_promise.then(function(){
                    count++;
                    //最终count + 1的值等于树上节点总数，代表斯坦纳树绘制完成，执行回调函数，结束。
                    if(count + 1 === point_arr.length){
                        wipe_flag = true;
                        process_flag = "always";
                        if(fn){
                            fn();
                        }
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
}


$draw.addEventListener("click", function(){
    if(process_flag !== true || entry_arr.length < 2){
        return;
    }
    if(entry_arr.length > 11){
        $main.classList.add("loading");
    }
    draw_line();
});

$wipe.addEventListener("click", function(){    
    if(wipe_flag === false || entry_arr.length < 2){
        return;
    }

    let distance = size * size_px;
    point_ctx.clearRect(0, 0, distance, distance);
    line_ctx.clearRect(0, 0, distance, distance);

    entry_arr = [];
    prev_tree = null;
    process_flag = true;

    $entry.innerHTML = "";
    $result.innerHTML = "";
});


let $result = document.querySelector(".result");

//用文字显示最终的输出结果
function result_show(time, cost){
    let html = `
        <div class="time">time: ${time}</div>
        <div class="cost">cost: ${cost}</div>
    `;
    $result.innerHTML = html;
}

//查找二维数组中是否有传入的坐标点
function arr_include(arr, val){
    let ret_index = -1;

    arr.some(function(value, index){
        let flag = val.toString() === value.toString();
        if(flag){
            ret_index = index;
        }
        return flag;
    });

    return ret_index;
}