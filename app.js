const express = require('express');
const expressHbs = require("express-handlebars");
const hbs = require("hbs");
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
const session = require('express-session');

const mongoose = require("mongoose");
const MongoStore = require('connect-mongo')(session);

const app = express();

//config
const config = require('config');
const appPort = config.get('app.port');
const appHost = config.get('app.host');
const mongooseUri = config.get('mongoose.uri');
const mongooseOpt = config.get('mongoose.options');
const secret = config.get('secret');

// устанавливаем настройки для файлов layout
app.engine("hbs", expressHbs(
  {
      layoutsDir: "views/layouts", 
      defaultLayout: "layout",
      extname: "hbs"
  }
));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");

// cookie and session
app.use(cookieParser(secret));
app.use(session({
  secret,
  store: new MongoStore({
    url: mongooseUri,
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000*60*60*24*7, // 1 week
  }
}));

//Routers 
const homeRouter = require("./routes/homeRouter.js");
const newsRouter = require("./routes/newsRouter.js");

//Парсер для форм
app.use(bodyParser.urlencoded({ extended: false }));
//Стили, картинки, скрипты в папке public
app.use('/', express.static(__dirname + '/public'));

app.use((req, res, next) => {
  if(req.session.userName) {
    res.locals.userName = req.session.userName;
  }
  next();
});

app.use('/news', newsRouter);
app.use('/', homeRouter);

app.use((req, res, next) => {
  res.status(400).send('Not found');
})

// подключение к БД mongoose
mongoose.connect(mongooseUri, mongooseOpt, err => {
  if(err) return console.log(err);
  console.log('Mongoose подключен.');
  // запуск сервера
  app.listen(appPort, () => console.log(`Server is running on port ${appPort}`));
});