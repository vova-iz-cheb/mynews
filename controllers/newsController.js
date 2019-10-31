const News = require("../models/News");

module.exports.create = (req, res) => {
  if(req.session.userName) {
    res.render("formnews.hbs", {
      title: 'Создать новость',
      submit: 'Создать',
      url: '/news/create',
    });
  } else {
    res.redirect('/');
  }
}

module.exports.postCreate = (req, res) => {
  if(req.session.userName) {
    let error = '';
    if(!req.body.title || !req.body.content) error = 'Все поля должны быть заполнены';
    else if(!/^[a-zA-Zа-яйА-ЯЙ0-9!\.,\s:;-]{2,50}$/.test(req.body.title)) error = 'Заголовок должен состоять от 2 до 50 символов. Разрешены русские и латинские буквы, цифры и ! , . : - ;';
    else if(!/^[a-zA-Zа-яйА-ЯЙ0-9!\.,\s:;-]{10,1500}$/.test(req.body.content)) error = 'Содержимое статьи должено состоять от 10 до 1500 символов. Разрешены русские и латинские буквы, цифры и ! , . : - ;';
    else {
      let news = new News({
        title: req.body.title,
        content: req.body.content,
        author: req.session.userName,
      });

      news.save()
      .then(() => {
          res.redirect('/');
      })
      .catch(err => {
        console.log(err);
        res.status(503).send('Что то пошло не так!');
      });
      return;
    }
    res.render("formnews.hbs", {
      title: 'Создать новость',
      submit: 'Создать',
      error,
      titlenews: req.body.title,
      content: req.body.content,
      url: '/news/create',
    });
  } else {
    res.redirect('/');
  }
}

module.exports.delete = (req, res) => {
  if(req.session.userName || !req.query.id) {
    const id = req.query.id;
    News.findByIdAndDelete(id, (err, news) => {
      if(err) return console.log(err);
      res.redirect('/');
    })
  } else {
    res.redirect('/');
  }
}

module.exports.change = (req, res) => {
  if(req.session.userName || !req.query.id) {
    const id = req.query.id;
    
    News.findById(id, (err, news) => {
      if(err) return console.log(err);
      res.render("formnews.hbs", {
        title: 'Изменить новость',
        submit: 'Изменить',
        titlenews: news.title,
        content: news.content,
        url: '/news/change?id=' + news._id,
      });
    })
  } else {
    res.redirect('/');
  }
}

module.exports.postChange = (req, res) => {
  if(req.session.userName || !req.query.id) {
    const id = req.query.id;

    if(!req.body.title || !req.body.content) error = 'Все поля должны быть заполнены';
    else if(!/^[a-zA-Zа-яйА-ЯЙ0-9!\.,\s:;-]{2,50}$/.test(req.body.title)) error = 'Заголовок должен состоять от 2 до 50 символов. Разрешены русские и латинские буквы, цифры и ! , . : - ;';
    else if(!/^[a-zA-Zа-яйА-ЯЙ0-9!\.,\s:;-]{10,1500}$/.test(req.body.content)) error = 'Содержимое статьи должено состоять от 10 до 1500 символов. Разрешены русские и латинские буквы, цифры и ! , . : - ;';
    else {
      News.findByIdAndUpdate(id, {
        title: req.body.title,
        content: req.body.content,
        changed_date: new Date(),
      }, (err, result) => {
        if(err) return console.log(err);
        res.redirect('/');
      })
      return;
    }

    console.log(req.body.title);

    res.render("formnews.hbs", {
      title: 'Изменить новость',
      submit: 'Изменить',
      error,
      titlenews: req.body.title,
      content: req.body.content,
      url: '/news/change?id=' + req.query.id,
    });
    
  } else {
    res.redirect('/');
  }
}