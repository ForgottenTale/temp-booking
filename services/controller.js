const utils = require('./utils.js');
const {convertSqlDateTimeToDate, convertDateToSqlDateTime} = require('./utils.js');

class Person{
    constructor(person){
        try{
            this.validate(person);
            this.id = person.id;
            this.role = person.role?person.role.toUpperCase():null;
            this.name = person.name?person.name.trim():null;
            this.email = person.email?person.email.trim():null;
            this.phone = person.phone?(person.phone+"").trim():null;
            this.groupAdmin = person.groupAdmin=='1'?true:false;
            if(person.ouIds)
                this.ouIds = person.ouIds.split(",").map(ouId=>parseInt(ouId));
            if(person.ous)
                this.ous = person.ous;
        }catch(err){
            throw err;
        }
    }

    static getValuesForEdit(params){
        let values = [];
        for(let key in params){
            switch(key){
                case 'name':    if(params.name.trim().length<1)
                                    throw new Error(key + " cannot be empty");
                                values.push("name='" + params.name.trim() + "'");
                                delete params.name;
                                break;
                case 'phone':   
                                if(!(params.phone.trim().match(/\d/g).length == 10))
                                    throw new Error("Invalid phone number");
                                values.push("phone='" + params.phone.trim() + "'");
                                delete params.phone;
                                break;
            }
        }
        return values;
    }

    validate(person){
        // if(person.role)
        //     switch(person.role){
        //         case "GLOBAL_ADMIN": break;
        //         case "GROUP_ADMIN": break;
        //         case "USER": break;
        //         case "REVIEWER": break;
        //         default: throw new Error("Invalid role");
        //     }
    }

    getPublicInfo(){
        return{
            name: this.name,
            email: this.email,
            phone: this.phone,
            ous: this.ous
        }
    }

    getAllNamesAndValues(){
        return({
            names: ['name', 'email', 'phone'],
            values: [
                this.name?("'" + this.name + "'"):"null",
                "'" + this.email + "'",
                "'" + this.phone + "'"
            ]
        })
    }
}


class User extends Person{
    constructor(user){
        try{
            super(user);
            this.id = user.id;
            this.personId = user.personId;
            this.password = user.password.trim();
            this.superAdmin = user.superAdmin;
        }catch(err){
            throw err;
        }
    }

    getAllNamesAndValues(){
        let {names, values} = super.getAllNamesAndValues();
        names.push("password");
        values.push("'" + this.password + "'");
        return {names, values};
    }

    static getValues(params){
        let values = [];
        for(let key in params){
            switch(key){
                case 'name':    values.push("name='" + params.name + "'");
                                break;
                case 'email':   values.push("email='" + params.email + "'");
                                break;
                case 'password':values.push("password='" + params.password + "'");
                                break;
                case 'phone':   values.push("phone='" + params.phone + "'");
                                break;
                case 'id'   :   break;
                default     :   console.error(new Error("Undefined parameter provided " + key));
            }
        }
        return values;
    }

    static getValuesForEdit(params){
        let values = super.getValuesForEdit(params);
        for(let key in params){
            switch(key){
                case 'password'  : values.push("password='" + params.password + "'");
                                    delete params[key];
                                    break;
                default     :   throw(new Error(key + " is not editable"));
            }
        }
        return values;
    }
}

class NewUser extends User{
    constructor(input){
        try{
            super(input);
            this.required = ["name", "email", "phone", "password", "confirmPassword"];
            this.checkRequired(input);
            this.confirmPassword = input.confirmPassword.trim();
            this.validate();
            if(this.confirmPassword != this.password)
                throw new Error("Passwords mismatch");
        }catch(err){
            throw err;
        }
    }

    checkRequired(input){
        this.required.forEach(param=>{
            if(!input[param])
                throw new Error(param + " is required");
            else if((input[param] + "").trim() < 1)
                throw new Error(param + " cannot be empty");
        })
    }

    validate(){
        //validate email
        if(!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.email))){
            throw new Error("Invalid email");
        }
        //validate phone
        if(!(this.phone.match(/\d/g).length == 10))
            throw new Error("Invalid phone number");
    }

}

class Service{
    constructor(input){
        try{
            this.required = ["type", "serviceName", "creatorId", "title", "ouId"];
            this.editable = ["description"];
            this._id = input._id;
            this.type = input.type.trim();
            this.serviceName = input.serviceName.trim().toLowerCase();
            this.creatorId = input.creatorId;
            this.title = input.title?input.title.trim():"null";
            this.ouId = input.ouId;
            this.description = input.description?input.description.trim():null;
            this.status = input.status?input.status:"PENDING";
            this.comments = input.comments?input.comments.trim():null;
            this.img = input.img?input.img.trim():null;
        }catch(err){
            throw err;
        }
    }

    static getValuesForEdit(params){
        let values = [];
        for(let key in params){
            switch(key){
                case 'description'  : values.push("description='" + params.description + "'");
                                    delete params[key];
                                    break;
                default             :   throw(new Error(key + " is not editable"));
            }
        }
        return values;
    }

    checkRequired(input){
        this.required.forEach(param=>{
            if(param=="express")
                if(input[param]===false)
                    return ;
            if(!input[param])
                throw new Error(param + " is required");
            else if((input[param] + "").trim() < 1)
                throw new Error(param + " cannot be empty");
        })
    }

    getAllNamesAndValues(){
        return({
            names: ['service_name', 'title', 'description', 'comments', 'img'],
            values: [
                this.serviceName?(`"${this.serviceName}"`):"null",
                this.title?(`"${this.title}"`):"null",
                this.description?(`"${this.description}"`):"null",
                this.comments?(`"${this.comments}"`):"null",
                this.img?(`"${this.img}"`):"null",
            ]
        })
    }

    getPrivateInfo(){
        return{
            serviceName: this.serviceName,
            description: this.description,
            speakerName: this.speakerName,
            status: this.status,
            comments: this.comments
        }
    }

    getPublicInfo(){
        return{
            serviceName: this.serviceName,
            description: this.description,
            speakerName: this.speakerName,
            status: this.status,
            comments: this.comments
        }
    }
}

class OnlineMeeting extends Service {
    constructor(input){
        super(input);
        this.required = ["speakerName", "speakerEmail", "startTime", "endTime"];
        this.speakerName = input.speakerName.trim();
        this.speakerEmail = input.speakerEmail.trim();
        this.startTime = new Date(input.startTime);
        this.endTime = new Date(input.endTime);
        if(typeof(input.coHosts)=="string"){
            input.coHosts = input.coHosts.trim()?JSON.parse(input.coHosts):null;
        }
        this.coHosts = input.coHosts?input.coHosts.map(coHost=>{
            return [coHost[0].trim(), coHost[1].trim()];
        }):null;
    }

    static validateTime(input, config, advance=false){
        if(input.startTime>input.endTime)
            throw new Error('End Date must be greater than Start Date');
        if(input.startTime<(new Date()))
            throw new Error('Time slot selected is past');
        let startOfAdvanceTime = new Date(input.startTime);
        startOfAdvanceTime.setHours(0, 0, 0);
        startOfAdvanceTime.setDate(startOfAdvanceTime.getDate() - config.advance_days);
        if(advance)
            if(startOfAdvanceTime<=(new Date())){
                throw new Error('Booking has to be done ' + config.advance_days + ' days in advance');
            }
    }

    static getValuesForEdit(params){
        let values = super.getValuesForEdit(params);
        for(let key in params){
            switch(key){
                case 'speakerName':    values.push("speaker_name='" + params.speakerName + "'");
                                break;
                case 'speakerEmail':    values.push("speaker_email='" + params.speakerName + "'");
                                break;
                default     :   throw(new Error(key + " is not editable"));
            }
        }
        return values;
    }

    static getTimeAvailQuery(input, config){
        let padding = config.padding_between_bookings_mins;
        let tempStartTime = input.startTime.getTime() - (padding*60000);
        let paddedStart = convertDateToSqlDateTime(new Date(tempStartTime));
        let paddedEnd = convertDateToSqlDateTime(new Date(input.endTime.getTime() + (padding*60000)));
        return (`SELECT * FROM ${input.type}
            INNER JOIN blt ON ${input.type}_id=${input.type}._id WHERE
            ((start_time>'${paddedStart}' AND start_time<'${paddedEnd}') OR 
            (end_time>'${paddedStart}' AND end_time<'${paddedEnd}') OR 
            (start_time='${paddedStart}' AND end_time='${paddedEnd}'))`
        )
    }

    static convertSqlTimesToDate(input){
        input.start_time = convertSqlDateTimeToDate(input.start_time).toISOString();
        input.end_time = convertSqlDateTimeToDate(input.end_time).toISOString();
        return input;
    }

    getAllNamesAndValues(){
        let namesAndValues = super.getAllNamesAndValues();
        namesAndValues.names.push('speaker_name', 'speaker_email', 'co_hosts', 'start_time', 'end_time');
        namesAndValues.values.push(this.speakerName?("'" + this.speakerName + "'"):"null");
        namesAndValues.values.push(this.speakerEmail?("'" + this.speakerEmail + "'"):"null");
        namesAndValues.values.push(this.coHosts?("'" + JSON.stringify(this.coHosts) + "'"):"null");
        namesAndValues.values.push(this.startTime?("'" + convertDateToSqlDateTime(this.startTime) + "'"):"null");
        namesAndValues.values.push(this.endTime?("'" + convertDateToSqlDateTime(this.endTime) + "'"):"null");
        return(namesAndValues);
    }

    getPublicInfo(){
        return Object.assign({
            startTime: this.startTime,
            endTime: this.endTime,
            speakerName: this.speakerName,
            speakerEmail: this.speakerEmail,
            coHosts: this.coHosts
        }, super.getPublicInfo());
    }
}

class InternSupport extends Service{
    constructor(input){
        super(input);
        this.required = ["startTime", "endTime"];
        this.startTime = new Date(input.startTime);
        this.endTime = new Date(input.endTime);
        this.wordsCount = input.wordsCount;
        this.purpose = input.purpose;
        this.dimensions = input.dimensions;
        this.url = input.url;
        this.img = input.img;
    }

    static validateTime(input, config, advance=false){
        if(input.startTime>input.endTime)
            throw new Error('End Date must be greater than Start Date');
        if(input.startTime<(new Date()))
            throw 'Time slot selected is past';
        let startOfAdvanceTime = new Date(input.startTime);
        startOfAdvanceTime.setHours(0, 0, 0);
        startOfAdvanceTime.setDate(startOfAdvanceTime.getDate() - config.advance_days);
        if(advance)
            if(startOfAdvanceTime<=(new Date())){
                throw new Error('Booking has to be done ' + config.advance_days + ' days in advance');
            }
    }

    static getTimeAvailQuery(input, config){
        let padding = config.padding_between_bookings_mins;
        let paddedStart = convertDateToSqlDateTime(new Date(input.startTime.getTime() - (padding*60000)));
        let paddedEnd = convertDateToSqlDateTime(new Date(input.endTime.getTime() + (padding*60000)));
        return (`SELECT * FROM ${input.type}
            INNER JOIN blt ON ${input.type}_id=${input.type}._id WHERE
            ((start_time>'${paddedStart}' AND start_time<'${paddedEnd}') OR 
            (end_time>'${paddedStart}' AND end_time<'${paddedEnd}') OR 
            (start_time='${paddedStart}' AND end_time='${paddedEnd}'))`
        )
    }

    getAllNamesAndValues(){
        let namesAndValues = super.getAllNamesAndValues();
        namesAndValues.names.push('start_time', 'end_time', 'words_count', 'purpose', 'dimensions', 'url');
        namesAndValues.values.push(this.startTime?("'" + convertDateToSqlDateTime(this.startTime) + "'"):"null");
        namesAndValues.values.push(this.endTime?("'" + convertDateToSqlDateTime(this.endTime) + "'"):"null");
        namesAndValues.values.push(this.wordsCount?(""+this.wordsCount+""):"null");
        namesAndValues.values.push(this.purpose?("'"+this.purpose+"'"):"null");
        namesAndValues.values.push(this.dimensions?("'"+this.dimensions+"'"):"null");
        namesAndValues.values.push(this.url?("'"+this.url+"'"):"null");
        return(namesAndValues);
    }

    getPublicInfo(){
        return Object.assign({
            wordsCount: this.wordsCount
        }, super.getPublicInfo());
    }

    static convertSqlTimesToDate(input){
        input.start_time = convertSqlDateTimeToDate(input.start_time).toISOString();
        input.end_time = convertSqlDateTimeToDate(input.end_time).toISOString();
        return input;
    }
}

class ENotice extends Service{
    constructor(input){
        super(input);
        this.required = ["express", "reminder", "publishTime"];
        this.editable = ["express"];
        this.express = input.express.toLowerCase()=="express"||(input.express+"")=="1"?true:false;
        this.reminder = new Date(input.reminder);
        this.publishTime = new Date(input.publishTime);
    }

    static validateTime(input, config, advance=false){
        let startOfAdvanceTime = new Date(input.publishTime);
        startOfAdvanceTime.setHours(0, 0, 0);
        startOfAdvanceTime.setDate(startOfAdvanceTime.getDate() - config.advance_days);
        if(advance)
            if(startOfAdvanceTime<=(new Date())){
                throw new Error('Booking has to be done ' + config.advance_days + ' days in advance');
            }
    }

    static getTimeAvailQuery(input, config){
        let padding = config.padding_between_bookings_mins;
        let paddedStart = convertDateToSqlDateTime(new Date(input.publishTime.getTime() - (padding*60000)));
        let paddedEnd = convertDateToSqlDateTime(new Date(input.publishTime.getTime() + (padding*60000)));
        return (`SELECT * FROM ${input.type}
                INNER JOIN blt ON blt.${input.type}_id=${input.type}._id WHERE
                ((publish_time>='${paddedStart}' AND publish_time<='${paddedEnd}'))`
        )
    }

    getAllNamesAndValues(){
        let namesAndValues = super.getAllNamesAndValues();
        namesAndValues.names.push('publish_time', 'express', 'reminder');
        namesAndValues.values.push(this.publishTime?("'" + convertDateToSqlDateTime(this.publishTime) + "'"):"null");
        namesAndValues.values.push(this.express);
        namesAndValues.values.push(this.reminder?("'" + convertDateToSqlDateTime(this.reminder) + "'"):"null");
        return(namesAndValues);
    }

    getPublicInfo(){
        return Object.assign({
            express: this.express,
            reminder: this.reminder
        }, super.getPublicInfo());
    }

    static convertSqlTimesToDate(input){
        input.publish_time = convertSqlDateTimeToDate(input.publish_time).toISOString();
        input.reminder = convertSqlDateTimeToDate(input.reminder).toISOString();
        return input;
    }
}

class Publicity extends Service{
    constructor(input){
        super(input);
        this.required = ["publishTime"];
        this.publishTime = new Date(input.publishTime);
        this.schedule = input.schedule;
    }

    static validateTime(input, config, advance=false){
        let startOfAdvanceTime = new Date(input.publishTime);
        startOfAdvanceTime.setHours(0, 0, 0);
        startOfAdvanceTime.setDate(startOfAdvanceTime.getDate() - config.advance_days);
        if(advance)
            if(startOfAdvanceTime<=(new Date())){
                throw new Error('Booking has to be done ' + config.advance_days + ' days in advance');
            }
    }

    static getTimeAvailQuery(input, config){
        let padding = config.padding_between_bookings_mins;
        let paddedStart = convertDateToSqlDateTime(new Date(input.publishTime.getTime() - (padding*60000)));
        let paddedEnd = convertDateToSqlDateTime(new Date(input.publishTime.getTime() + (padding*60000)));
        return (`SELECT * FROM ${input.type}
                INNER JOIN blt ON blt.${input.type}_id=${input.type}._id WHERE
                ((publish_time>='${paddedStart}' AND publish_time<='${paddedEnd}'))`
        )
    }

    getAllNamesAndValues(){
        let namesAndValues = super.getAllNamesAndValues();
        namesAndValues.names.push('publish_time', 'schedule');
        namesAndValues.values.push(this.publishTime?("'" + convertDateToSqlDateTime(this.publishTime) + "'"):"null");
        namesAndValues.values.push(this.schedule?("'" + this.schedule + "'"):"null");
        return(namesAndValues);
    }
    
    getPublicInfo(){
        return Object.assign({
            express: this.express,
            reminder: this.reminder
        }, super.getPublicInfo());
    }
    
    static convertSqlTimesToDate(input){
        input.publish_time = convertSqlDateTimeToDate(input.publish_time).toISOString();
        return input;
    }
};


function getClass(type){
    switch(type){
        case "online_meeting":  return OnlineMeeting;  
        case "intern_support":  return InternSupport;
        case "e_notice":        return ENotice;
        case "publicity":       return Publicity;
        default:                throw new Error("Class not found");
    }
}

module.exports = {
    Person: Person,
    User: User,
    NewUser: NewUser,
    OnlineMeeting: OnlineMeeting,
    InternSupport: InternSupport,
    ENotice: ENotice,
    Publicity: Publicity,
    getClass: getClass,
    convertDateToSqlDateTime: convertDateToSqlDateTime,
    convertSqlDateTimeToDate: convertSqlDateTimeToDate
}