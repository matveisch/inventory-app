const express = require('express');
const router = express.Router();

const item_controller = require('../controllers/itemController');

router.get('/', item_controller.index);

router.get('/items', item_controller.items_list);
router.get('/item/create', item_controller.item_create_get);
router.post('/item/create', item_controller.item_create_post);
router.get('/item/:id', item_controller.item_details);
router.get('/item/:id/delete', item_controller.item_delete_get);
router.post('/item/:id/delete', item_controller.item_delete_post);


module.exports = router;