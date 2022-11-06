const express = require('express')
const router = express.Router()
const {login, register, resetUserPassword, newUserPassword, modifyUser} = require('../controllers/auth')
const authenticateUser = require('../middleware/authentication')


router.post('/register', register)
router.post('/login', login)
router.post('/forgot', resetUserPassword)
router.patch('/reset/:id', newUserPassword)
router.patch('/', authenticateUser, modifyUser);
module.exports = router