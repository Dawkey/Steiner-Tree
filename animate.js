var move_line, move_point;

(function(){    
    
    function animate_line(ctx, start, end, x_speed, y_speed, resolve){
    
        let x_flag = x_speed > 0 ? 1 : -1;
        let y_flag = y_speed > 0 ? 1 : -1;

        if(x_flag * start[0] >= x_flag * end[0] && y_flag * start[1] >= y_flag * end[1]) {
            resolve("done");
            return;
        }
    
        let temp_x = start[0] + x_speed;
        let temp_y = start[1] + y_speed;
        if(x_flag * temp_x > x_flag * end[0]) temp_x = end[0];
        if(y_flag * temp_y > y_flag * end[1]) temp_y = end[1];

        let new_start = [temp_x, temp_y];
    
        ctx.beginPath();
        ctx.moveTo(...start);
        ctx.lineTo(...new_start);
        ctx.stroke();
    
        requestAnimationFrame(function(){
            animate_line(ctx, new_start, end, x_speed, y_speed, resolve);
        });
    }
    

    function animate_point(ctx, x, y, start_r ,end_r, speed, resolve){
    
        if(start_r >= end_r){
            resolve("done");
            return;
        }
    
        let new_r = start_r + speed;
        if(new_r > end_r) new_r = end_r;
        ctx.beginPath();
        ctx.arc(x, y, new_r, 0, 2*Math.PI,true);
        ctx.fill();
        ctx.stroke();
    
        requestAnimationFrame(function(){
            animate_point(ctx, x, y, new_r ,end_r, speed, resolve);
        });
    
    }    


    move_line = function(ctx, start, end, x_speed, y_speed){
        if(start[0] > end[0]) x_speed = -x_speed;
        if(start[1] > end[1]) y_speed = -y_speed;
        return new Promise(function(resolve){
            animate_line(ctx, start, end, x_speed, y_speed, resolve);
        });
    }

    move_point = function(ctx, x, y, start_r ,end_r, speed){
        return new Promise(function(resolve){
            animate_point(ctx, x, y, start_r, end_r, speed, resolve);
        });
    }

})();


