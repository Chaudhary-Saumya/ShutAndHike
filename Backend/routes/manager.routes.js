const express = require('express')
const { CreateManager, ReadManager, UpdateManager, DeleteManager } = require('../controller/manager.controller')
const { apiLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router()

router.post('/create-manager',apiLimiter,CreateManager)
router.get('/get-manager',apiLimiter,ReadManager)
router.put('/update-manager/:id',apiLimiter,UpdateManager)
router.delete('/delete-manager/:id',apiLimiter,DeleteManager)

module.exports = router