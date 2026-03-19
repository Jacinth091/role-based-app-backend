const express = require("express");
const { getEmployeeList, getEmployeeById, addNewEmployee, editEmployee, deleteEmployee } = require('../controllers/employee.controller.js');
const { authenticateToken, authorizeRole } = require('../middlewares/middleware.js');

const router = express.Router();


router.get('/', authenticateToken, authorizeRole('admin'), getEmployeeList);
router.post('/', authenticateToken, authorizeRole('admin'), addNewEmployee);
router.get('/:id', authenticateToken, authorizeRole('admin'), getEmployeeById);
router.patch('/:id', authenticateToken, authorizeRole('admin'), editEmployee);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteEmployee);



module.exports = router;
