var entry;

(function(){

    let st = [];
    let dptree = [];
    let flag = [];
    
    let que = [];
    let adj = [];
    
    let path = [];
    
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
    
        let min_path = path[min_index][val_index];
        let set = new Set();
        let path_arr = min_path.split("-");
        path_arr.forEach((val)=>{
            if(val !== ""){
                val = Number(val);
                set.add(val);
            }
        });
    
        path_arr = [...set];
    
        path_arr.sort((a,b) => a-b);
        return [min_val,path_arr];
    }
    
    function init(n,arr_k){
        let k = arr_k.length;
        st = Array(k).fill(0);
    
        for(let i=0; i<n; i++){
            let temp = Array(1<<k).fill(-1);
            let flag_temp = Array(1<<k).fill(false);
            let path_temp = Array(1<<k).fill("");
            dptree.push(temp);
            flag.push(flag_temp);
            path.push(path_temp);
    
            let index = arr_k.indexOf(i);
            if(index >= 0){
                st[i] = 1<<index;
                dptree[i][st[i]] = 0; //最关键的一步初始化，导火索。
            }
        }
    }
    
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
                            path[i][j] = i + "-" + path[i][x] + "-" + path[i][y];
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
                    path[v][st[v]|state] = u + "-" + path[u][state] + "-" + v;
    
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
    
    
    
    entry = function(arr){
    
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
    
        let result = main(xy_arr.length,arr_k,graph_arr);
        let min_val = result[0];
        let path_arr = result[1];
    
        let point_arr = path_arr.map((val) => xy_arr[val]);
        // console.log("min_val: " + min_val);
        // console.log("point_arr: ");
        // console.log(point_arr);
        return point_arr;
    }
    
    let date_start = new Date().getTime();
    let date_end = new Date().getTime();

})();

