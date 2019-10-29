const express = require('express');
const homeController = require('../controllers/homeController');
const homeRouter = express.Router();

homeRouter.get('/login', homeController.login);
homeRouter.post('/login', homeController.postLogin);
homeRouter.get('/logout', homeController.logout);
homeRouter.get('/registration', homeController.reg);
homeRouter.post('/registration', homeController.postReg);
homeRouter.get('/', homeController.index);

module.exports = homeRouter;