const mongoose = require("mongoose");
 
const Schema = mongoose.Schema;
// установка схемы
const newsSchema = new Schema({
    name: String,
    age: Number
}, {
  collection: 'news',
});

module.exports = mongoose.model("News", newsSchema);