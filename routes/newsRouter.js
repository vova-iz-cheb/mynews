const express = require('express');
const newsController = require('../controllers/newsController');
const newsRouter = express.Router();

newsRouter.get('/create', newsController.create);
newsRouter.post('/create', newsController.postCreate);
newsRouter.get('/delete', newsController.delete);
newsRouter.get('/change', newsController.change);
newsRouter.post('/change', newsController.postChange);

module.exports = newsRouter;