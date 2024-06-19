const mongoose = require("mongoose");
const { type } = require("os");
const { setThePassword } = require("whatwg-url");
const Schema  = mongoose.Schema;

const userSchema = new Schema({
    name :{
        type:String,
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    username:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    }

})

module.exports = mongoose.model("userModel",userSchema);