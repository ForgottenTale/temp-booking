
export function pushEvents(d,data){

    var temp = data.filter((Obj) => {
       var dataObj = new Date(Obj.date).toLocaleDateString();
       var dMoment = d._d.toLocaleDateString()
        if (dataObj === dMoment) {
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


