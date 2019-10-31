const mongoose = require("mongoose");
 
const Schema = mongoose.Schema;
// установка схемы
const newsSchema = new Schema({
    title: String,
    content: String,
    author: String,
    created_date: {
      type: Date,
      default: new Date(),
    },
    changed_date: Date,
}, {
  collection: 'news',
});

module.exports = mongoose.model("News", newsSchema);