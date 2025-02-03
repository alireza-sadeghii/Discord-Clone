var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/about', function(req, res, next) {
  res.render('about');
});

router.get('/faq', function(req, res, next) {
  res.render('faq');
});

router.get('/privacy', function(req, res, next) {
  res.render('privacy');
});

router.get('/terms', function(req, res, next) {
  res.render('terms');
});

router.get('/guideline', function(req, res, next) {
  res.render('guideline');
});

router.get('/app', function(req, res, next) {
  res.render('discord');
});

module.exports = router;