const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getTasks, createTask, deleteTask } = require('../controllers/taskController');

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.delete('/:id', deleteTask);

module.exports = router;