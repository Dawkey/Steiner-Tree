var move_line, move_point;

(function(){    
    
    function animate_line(ctx, start, end, x_speed, y_speed, resolve){
    
        if(start[0] >= end[0] && start[1] >= end[1]) {
            resolve("done");
            return;
        }
    
        let temp_x = start[0] + x_speed;
        let temp_y = start[1] + y_speed;
        if(temp_x > end[0]) temp_x = end[0];
        if(temp_y > end[1]) temp_y = end[1];
        let new_start = [temp_x, temp_y];
    
        ctx.beginPath();
        ctx.moveTo(...start);
        ctx.lineTo(...new_start);
        ctx.stroke();
    
        requestAnimationFrame(function(){
            animate_line(ctx, new_start, end, x_speed, y_speed, resolve);
        });
    }
    
    
    function animate_point(ctx, x, y, start_r ,end_r, speed){
    
        if(start_r >= end_r) return;
    
        ctx.clearRect(0, 0, 500, 500);
        let new_r = start_r + speed;
        if(new_r > end_r) new_r = end_r;
        ctx.beginPath();
        ctx.arc(x, y, new_r, 0, 2*Math.PI,true);
        ctx.stroke();
    
        requestAnimationFrame(function(){
            animate_point(ctx, x, y, new_r ,end_r, speed);
        });
    
    }    


    move_line = function(ctx, start, end, x_speed, y_speed){
        return new Promise(function(resolve){
            animate_line(ctx, start, end, x_speed, y_speed, resolve);
        });
    }

    

})();


