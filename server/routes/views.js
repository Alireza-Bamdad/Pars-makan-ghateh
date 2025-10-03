
const express = require('express');
const router = express.Router();

// صفحه اصلی
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/login', (req, res) => res.render('login'));
router.get('/dashboard', (req, res) => res.render('dashboard'));
router.get('/products', (req, res) => res.render('products'));
router.get('/categories', (req, res) => res.render('categories'));
router.get('/change-password', (req, res) => res.render('change-password'));
router.get('/contact', (req, res) => {
  const phoneNumbers = [
    { number: '09173271310', label: 'پشتیبانی' },
    { number: '09173271316', label: 'فروش' },
    { number: '09173271317', label: 'فروش' },
    { number: '09173271318', label: 'فروش' },
    { number: '09351981918', label: 'فروش' },
  ];
  res.render('contact', { phoneNumbers });
});

module.exports = router;

