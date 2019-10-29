const mongoose = require("mongoose");
 
const Schema = mongoose.Schema;
// установка схемы
const userSchema = new Schema({
    login: String,
    salt: String,
    hash: String,
    reg_date: {
      type: Date,
      default: new Date(),
    }
});

module.exports = mongoose.model("User", userSchema);