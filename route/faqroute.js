// routes/faqRoute.js

const express = require('express');
const { getFaq,addFaq,deleteFaq } = require('../controller/faqcontroller');

const router = express.Router();

router.get('/faq', getFaq);
router.post('/faq', addFaq);
router.delete('/faq',deleteFaq)

module.exports = router;
