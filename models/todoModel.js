const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let todoSchema = new Schema({
    todo : {
        type: String,
        required:true
    },
    username :{
        type:String,
        required:true
    }
},
{
    timestamps:true
}
)

module.exports = mongoose.model("todoSchema",todoSchema);