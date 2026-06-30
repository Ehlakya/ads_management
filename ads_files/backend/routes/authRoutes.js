const express = require('express');
const router = express.Router();
const { login, register, loginTheatre, registerTheatre } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.post('/theatre/login', loginTheatre);
router.post('/theatre/register', registerTheatre);

module.exports = router;
