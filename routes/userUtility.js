const express = require('express')
const router = express.Router()
const {getUser} = require('../controllers/auth')

router.get('/', getUser)

module.exports = router