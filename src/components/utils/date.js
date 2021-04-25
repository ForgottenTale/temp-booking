
export function pushEvents(d,data){

    var temp = data.filter((Obj) => {

        if (Obj.date.toString() === d.toISOString()) {
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
