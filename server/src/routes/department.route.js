const express = require('express');
const { authenticateToken, authorizeRole } = require('../middlewares/middleware');
const { getDepartmentList, getDepartmentById } = require('../controllers/department.controller');
const router = express.Router();


router.get('/', authenticateToken, authorizeRole('admin'), getDepartmentList);
router.get('/:id', authenticateToken, authorizeRole('admin'), getDepartmentById)



module.exports = router;