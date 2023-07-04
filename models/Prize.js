const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Prize = new Schema({
    Prize: {
        type: String
    },
   
});


module.exports = mongoose.model('prize', Prize);