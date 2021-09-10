//requirement
const _ = require('lodash')

module.exports = (querry) => {
    if (!querry) return null
    let city = querry.city
    let blood_type = querry.blood_type
    let tags = querry.tag
    let obj = {state:false}
    if (querry.city){
        obj = {...obj , city}
    }
    if (querry.blood_type){
        blood_type = changeBlood(blood_type)
        obj = {...obj , blood_type}
    }
    if (querry.tag){
        obj = {...obj , tags}
    }
    return obj
}

const changeBlood = (blood) => {
    switch(blood){
        case 'O0' : return 'O-' 
            break;
        case 'O1' : return 'O+' 
            break;
        case 'A0' : return 'A-' 
            break;
        case 'A1' : return 'A+' 
            break;
        case 'B0' : return 'B-' 
            break;
        case 'B1' : return 'B+' 
            break;
        case 'AB0' : return 'AB-' 
            break;
        case 'AB1' : return 'AB+' 
            break;
        default : return null 
            break;
    }
}