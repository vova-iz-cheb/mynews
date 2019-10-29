const News = require("../models/News");
const User = require("../models/User");
const generateSalt = require('../utils/generateSalt');
const createHash = require('../utils/createHash');

module.exports.reg = (req, res) => {
  res.render("reg.hbs", {
    title: 'Регистрация',
  });
}

module.exports.postReg = (req, res) => {
  let error = '';
  if(!req.body.login || !req.body.password || !req.body.password2) {
    error = 'Все поля должны быть заполнены!';
  }
  else if(req.body.password !== req.body.password2) {
    error = 'Пароли не совпадают!';
  }
  else if(! /^[\w\d]{3,20}$/i.test(req.body.login)) {
    error = 'Логин должен содержать буквы латинского алфавита, _ и цифры. Колличество символов от 3 до 20!';
  }
  else if(! /^[\w\d]{5,20}$/i.test(req.body.password)) {
    error = 'Пароль должен содержать буквы латинского алфавита, _ и цифры. Колличество символов от 5 до 20!';
  }
  else {
    User.find({login: req.body.login}, (err, user) => {
      if(err) console.log(err);
      if(user.length) error = 'Такой пользователь уже зарегистрирован!'; // [] расценивается как true
      
      // пришлось засунуть условие внутри колбэка
      if(error) { // отправляем пользователю представление с ошибкой
        res.render("reg.hbs", {
          title: 'Регистрация',
          error,
          login: req.body.login,
          pass: req.body.password,
          pass2: req.body.password2,
        });
      } else { //добавляем пользователя
        const salt = generateSalt(20);
        const hash = createHash(req.body.password, salt);
    
        const newUser = new User({
          login: req.body.login,
          salt,
          hash
        });
    
        newUser.save()
        .then(user => {
          req.session.userName = user.login; // записываем в сессию login
          res.redirect('/');
        })
        .catch(err => {
          console.log(err);
          res.status(503).send('Что то пошло не так!');
        });
      }
    });
  }
}

module.exports.login = (req, res) => {
  res.render("login.hbs", {
    title: 'Авторизация'
  });
};

module.exports.postLogin = (req, res) => {
  let p = new Promise((resolve, reject) => {
    if(!req.body.login || !req.body.password) reject('Все поля должны быть заполнены!');
    User.find({login: req.body.login}, (err, user) => {
      if(err) console.log(err);
      if(!user.length) reject('Нет такого пользователя!');
      resolve(user[0]); // объект юзера находится в массиве
    });
  });

  p
  .then(user => {
    const hash = createHash(req.body.password, user.salt);
    if(hash === user.hash) {
      req.session.userName = user.login; // записываем в сессию login
      res.redirect('/');
    } else {
      return Promise.reject('Пароли не совпадают!');
      // throw new Error('Пароли не совпадают!');
    }
  })
  .catch(error => {
    res.render("login.hbs", {
      title: 'Авторизация',
      error,
      login: req.body.login,
      pass: req.body.password,
    });
  });
};

module.exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports.index = (req, res) => {
  res.render("home.hbs");
};