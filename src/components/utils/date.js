
export function pushEvents(d,data){

    var temp = data.filter((Obj) => {

        if (new Date(Obj.date).toUTCString() === d._d.toUTCString()) {
            return Obj
        }
        else {
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
