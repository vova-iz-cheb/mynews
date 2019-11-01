const News = require("../models/News");
const User = require("../models/User");
const generateSalt = require('../utils/generateSalt');
const createHash = require('../utils/createHash');
const getStringFromDate = require('../utils/getStringFromDate');

module.exports.reg = (req, res) => {
  res.render("reg.hbs", {
    title: 'Регистрация',
  });
}

module.exports.postReg = (req, res) => {
  let p = new Promise((resolve, reject) => {
    if(!req.body.login || !req.body.password || !req.body.password2) reject('Все поля должны быть заполнены!');
    if(req.body.password !== req.body.password2) reject('Пароли не совпадают!');
    if(! /^[\w\d]{3,20}$/i.test(req.body.login)) reject('Логин должен содержать буквы латинского алфавита, _ и цифры. Колличество символов от 3 до 20!');
    if(! /^[\w\d]{5,20}$/i.test(req.body.password)) reject('Пароль должен содержать буквы латинского алфавита, _ и цифры. Колличество символов от 5 до 20!');

    User.findOne({login: req.body.login}, (err, user) => {
      if(err) return console.log(err);
      if(user) reject('Такой пользователь уже зарегистрирован!!');
      resolve(user);
    });
  });

  p
  .then(user => {
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
  })
  .catch(error => {
    res.render("reg.hbs", {
      title: 'Регистрация',
      error,
      login: req.body.login,
      pass: req.body.password,
      pass2: req.body.password2,
    });
  });
}

module.exports.login = (req, res) => {
  res.render("login.hbs", {
    title: 'Авторизация'
  });
};

module.exports.postLogin = (req, res) => {
  let p = new Promise((resolve, reject) => {
    if(!req.body.login || !req.body.password) reject('Все поля должны быть заполнены!');
    User.findOne({login: req.body.login}, (err, user) => {
      if(err) return console.log(err);
      if(!user) reject('Нет такого пользователя!');
      resolve(user);
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

module.exports.profile = (req, res) => {
  if(req.session.userName) {
    User.findOne({login: req.session.userName}, (err, user) => {
      if(err) return console.log(err);
      res.render('profile.hbs', {
        title: 'Profile',
        date: getStringFromDate(user.reg_date),
      })
    })
  } else {
    res.redirect('/');
  }
}

module.exports.changepassword = (req, res) => {
  if(req.session.userName) {
    let date = '';

    let p = new Promise((resolve, reject) => {
      User.findOne({login: req.session.userName}, (err, user) => {
        if(err) return console.log(err);
        if(!user) res.redirect('/logout');
        date = getStringFromDate(user.reg_date);
        if(!req.body.oldpass || !req.body.pass || !req.body.pass2) reject('Все поля должны быть заполнены!');
        if(req.body.pass !== req.body.pass2) reject('Пароли не верны!');
        if(! /^[\w\d]{5,20}$/i.test(req.body.pass)) {
         reject('Пароль должен содержать буквы латинского алфавита, _ и цифры. Колличество символов от 5 до 20!');
        }
        resolve(user);
      });
    });
  
    p
    .then(user => {
      const hash = createHash(req.body.oldpass, user.salt);
      if(hash === user.hash) {
        return user;
      } else {
        return Promise.reject('Пароль не верен!');
      }
    })
    .then(user => {
      const newSalt = generateSalt(20);
      const newHash = createHash(req.body.pass, newSalt);

      User.updateOne({login: req.session.userName}, {salt: newSalt, hash: newHash}, (err, result) => {
        if(err) return console.log(err);
        res.render('profile.hbs', {
          title: 'Profile',
          success: 'Пароль изменен!',
          date: getStringFromDate(user.reg_date),
        });
      });
    })
    .catch(error => {
      
      res.render('profile.hbs', {
        title: 'Profile',
        error,
        date,
        oldpass: req.body.oldpass,
        pass: req.body.pass,
        pass2: req.body.pass2,
      });
    });
  } else {
    res.redirect('/');
  }
}

module.exports.deleteuser = (req, res) => {
  if(req.session.userName) {
    let date = '';

    let p = new Promise((resolve, reject) => {
      User.findOne({login: req.session.userName}, (err, user) => {
        if(err) return console.log(err);
        if(!user) res.redirect('/logout');
        date = getStringFromDate(user.reg_date);
        if(!req.body.oldpassword) reject('Все поля должны быть заполнены!');
        resolve(user);
      });
    });
  
    p
    .then(user => {
      const hash = createHash(req.body.oldpassword, user.salt);
      if(hash === user.hash) {
        return user.id;
      } else {
        return Promise.reject('Пароль не верен!');
      }
    })
    .then(id => {
      User.findByIdAndDelete(id, (err, user) => {
        if(err) return console.log(err);
        req.session.destroy(() => {
          res.redirect('/');
        });
      });
    })
    .catch(error2 => {
      
      res.render('profile.hbs', {
        title: 'Profile',
        error2,
        date,
        oldpassword: req.body.oldpassword,
      });
    });
  } else {
    res.redirect('/');
  }
}

module.exports.about = (req, res) => {
  res.render("about.hbs", {
    title: 'О сайте',
  });
};

module.exports.index = (req, res) => {
  let news;

  News.find({}, null, {sort: {created_date: -1}}, (err, news) => {
    if(err) return console.log(err);
    news.forEach( item => {
      let createdDateStr = getStringFromDate(item.created_date);
      item.createdDateStr = createdDateStr;
      if(item.changed_date) {
        let changedDateStr = getStringFromDate(item.changed_date);
        item.changedDateStr = changedDateStr;
      }
    })
    res.render("home.hbs", {
      title: 'Добро пожаловать!',
      news,
    });
  });
};