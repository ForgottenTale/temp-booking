
export function pushEvents(d,data){
    // var start = new Date(d._d);
    // var end = new Date(d._d);
    // start.setHours(0,0,0,0);
    // end.setHours(24,0,0,0);
    var dMoment = d._d.toDateString();
    
    var temp = data.filter((Obj) => {
       var dataObj = new Date(Obj.date).toDateString();
     
      
     
        if (dataObj===dMoment) {
            return dataObj
        }
        else{
            return null
        }
    

    });

    if (temp.length !== 0) {
        return temp[0].events;
    }
    else {
        return null
    }
 

}


