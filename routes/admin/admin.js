
const express = require('express')
const authenticateUser = require('../../middleware/authentication')
const router = express.Router()
const {create, validate, getEmployees, modifyEmployee} = require('../../controllers/admin')

router.patch('/validate/:id', validate)
router.post('/register', authenticateUser, create)
router.get('/employees', authenticateUser, getEmployees)
router.patch('/modify', modifyEmployee)

module.exports = router