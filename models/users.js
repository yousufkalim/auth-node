//init
const mongoose = require('mongoose');


//Mode Schema
const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    message : [{
        type : String
    }]
});


//Model Export
module.exports = mongoose.model('users', userSchema);