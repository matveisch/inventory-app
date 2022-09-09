const express = require('express');
const router = express.Router();

const item_controller = require('../controllers/itemController');

router.get('/', item_controller.index);
router.get('/items', item_controller.items_list);
router.get('/item/:id', item_controller.item_details);

module.exports = router;