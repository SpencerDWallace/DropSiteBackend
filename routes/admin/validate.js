
const express = require('express')
const router = express.Router()
const {validate} = require('../../controllers/admin')

router.patch('/employee/:id', validate)
module.exports = router