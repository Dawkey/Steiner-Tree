function steiner(arr, start_point){
    if(arr.length < 2){
        return;
    }

    let st = [];
    let dptree = [];
    let flag = [];
    
    let que = [];//spfa用到的队列
    let adj = [];//图。
    
    let edge = [];//用来存放求解出的斯坦纳树用到的边。
    

    //主程序
    function main(n,arr_k,arr){
        let k = arr_k.length;
        init(n,arr_k);
        graph(n,arr);
        start(n,k);
    
        let val_index = (1<<k) - 1;
        let min_index = 0;
        let min_val = dptree[0][val_index];
        for(let i=1; i<dptree.length; i++){
            if(min_val > dptree[i][val_index]){
                min_index = i;
                min_val = dptree[i][val_index];
            }
        }
    
        let min_edge = edge[min_index][val_index];

        let point_set = new Set();
        let temp_arr = min_edge.split("/");
        let edge_arr = [];
        temp_arr.forEach((val)=>{
            if(val !== ""){
                let value = val.split("-").map((str) => {
                    let num = Number(str);
                    point_set.add(num);
                    return num;
                });
                edge_arr.push(value);
            }
        });

        let point_arr = [...point_set];
        point_arr.sort((a,b) => a-b);

        return [min_val, point_arr, edge_arr];
    }
    

    //初始化相关变量（数组）。
    function init(n,arr_k){
        let k = arr_k.length;
        st = Array(k).fill(0);
    
        for(let i=0; i<n; i++){
            let temp = Array(1<<k).fill(-1);
            let flag_temp = Array(1<<k).fill(false);

            let edge_temp = Array(1<<k).fill("");
            dptree.push(temp);
            flag.push(flag_temp);
            edge.push(edge_temp);
    
            let index = arr_k.indexOf(i);
            if(index >= 0){
                st[i] = 1<<index;
                dptree[i][st[i]] = 0; //最关键的一步初始化，导火索。
            }
        }
    }
    
    
    //由给出的边集数组生成一个图的数据结构（数组）。
    function graph(n,arr){
        adj = Array(n).fill(null);
    
        for(let i=0; i<arr.length; i++){
            let val = arr[i];
            let temp = {};
            let u = val[0];
            temp.v = val[1];
            temp.w = val[2];
            temp.next = adj[u];
            adj[u] = temp;
    
            let temp_v = {};
            let v = val[1];
            temp_v.v = val[0];
            temp_v.w = val[2];
            temp_v.next = adj[v];
            adj[v] = temp_v;
        }
    }
    
    
    //真正求解斯坦纳树问题的函数。
    function start(n,k){
    
        for(let j=1; j < 1<<k; j++){
    
            for(let i=0; i<n; i++){
                if(st[i] && st[i]&j === 0) continue; 
                //跳过目标点和它本身不连通的矛盾情况。
    
                for(let sub=(j-1)&j;sub;sub=(sub-1)&j){
                    let x = st[i] | sub;
                    let y = st[i] | (j-sub);
                    //如果取的是目标点，
                    //保证拆分成的两颗子树也始终与目标点是连通的。
    
                    if(dptree[i][x] !== -1 && dptree[i][y] !== -1){
                        let temp = dptree[i][x] + dptree[i][y];
                        if(dptree[i][j] === -1 || dptree[i][j] > temp){
                            dptree[i][j] = temp;
                            edge[i][j] = edge[i][x] + "/" + edge[i][y];
                        }
                    }
                    //对树拆分后的比较
                }
    
                if(dptree[i][j] !== -1){
                     que.push(i);
                    flag[i][j] = true;
                }
    
            }
    
            spfa(j);
        }
    
    }
    
    
    //spfa算法对边进行松弛操作。
    function spfa(state){
        while(que.length){
            let u = que.shift();
            flag[u][state] = false;
            for(let i = adj[u]; i !== null; i = i.next){
                let v = i.v;
                //st[v]|state保证在v为目标点时，连通状态能够包含与v连通的情况，不矛盾。
                if(dptree[v][st[v]|state] === -1 ||
                   dptree[v][st[v]|state] > dptree[u][state] + i.w
                ){
                    dptree[v][st[v]|state] = dptree[u][state] + i.w;
                    edge[v][st[v]|state] = edge[u][state] + "/" + u + "-" + v;
    
                    //通过flag数组，让进行松弛操作时，不要加入重复的点。
                    if(st[v]|state !== state || flag[v][state]){
                        continue;
                    }
    
                    flag[v][state] = true;
                    que.push(v);
                }
            }
    
        }
    
    }
    
    
    //把得到的边集（数组）转为一颗树（对象）。
    function arr_to_tree(edge_arr){

        let out_edge = [];
        function find_node(val){
            let ret_arr = [];
            for(let i=0; i<edge_arr.length; i++){
                let edge = edge_arr[i];
                if(out_edge.includes(i)){
                    continue;
                }

                if(val.toString() === edge[0].toString()){
                    ret_arr.push(edge[1]);
                    out_edge.push(i);
                }else if(val.toString() === edge[1].toString()){
                    ret_arr.push(edge[0]);
                    out_edge.push(i);
                }
            }

            if(ret_arr.length === 0){
                ret_arr = null;
            }
            return ret_arr;
        }

        function generate_tree(node){
            let child_arr = find_node(node.value);
            if(child_arr === null){
                return;
            }

            let next_arr = child_arr.map((val)=>{
                let child_node = {value: val, next: null}
                generate_tree(child_node);
                return child_node;
            });

            node.next = next_arr;
        }
                
        let tree = {value: edge_arr[0][0], next: null};
        if(start_point){
            tree.value = start_point;
        }

        generate_tree(tree);
        return tree;
    }    


    
    //入口函数，根据输入的坐标点集（数组），给出斯坦纳树问题的解。
    function entry(arr){
        let x_arr = new Set();
        let y_arr = new Set();
    
        for(let i=0; i<arr.length; i++){
            x_arr.add(arr[i][0]);
            y_arr.add(arr[i][1]);
        }
    
        x_arr = [...x_arr];
        y_arr = [...y_arr];
        
        x_arr.sort((x,y) => x-y);
        y_arr.sort((x,y) => x-y);
    
        let xy_arr = [];
        for(let i=0; i<y_arr.length; i++){
            for(let j=0; j<x_arr.length; j++){
                xy_arr.push([x_arr[j],y_arr[i]]);
            }
        }
    
        let graph_arr = [];
        let x_width = x_arr.length;
    
        for(let i=0; i<xy_arr.length; i++){
            if((i + 1) % x_width === 0) continue;
    
            let w = xy_arr[i+1][0] - xy_arr[i][0];
            graph_arr.push([i, i+1, w]);
        }
    
        for(let i=0; i<xy_arr.length; i++){
            if(!xy_arr[i + x_width]) break;
    
            let u = i;
            let v = i + x_width;
            let w = xy_arr[v][1] - xy_arr[u][1];
            graph_arr.push([u, v, w]);
        }
    
        let arr_k = [];
        for(let i=0; i<xy_arr.length; i++){
            for(let j=0; j<arr.length; j++){
                if(arr[j][0] === xy_arr[i][0] &&
                   arr[j][1] === xy_arr[i][1]){
                    arr_k.push(i);
                }
            }
        }
    
        let start_time = new Date().getTime();

        let result = main(xy_arr.length,arr_k,graph_arr);

        let end_time = new Date().getTime();

        let min_val = result[0];
        let point_arr = result[1];
        let edge_arr = result[2];
        let time = end_time -start_time;

        point_arr = point_arr.map((val) => xy_arr[val]);

        edge_arr = edge_arr.map(function(val){
            return val.map((index) => xy_arr[index]);
        });
        
        let tree = arr_to_tree(edge_arr);

        return {cost: min_val, time: time, point: point_arr, edge: edge_arr, tree: tree};
    }   


    return entry(arr);
}

