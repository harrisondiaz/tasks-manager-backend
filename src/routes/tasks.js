const express = require('express');
const router = express.Router();
const { getTasks, createTask, deleteTask, updateTask, toggleTaskComplete } = require('../controllers/taskController');
const authenticate = require('../middleware/auth');

router.use(authenticate);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/:id/toggle', toggleTaskComplete);
router.delete('/:id', deleteTask);

module.exports = router;