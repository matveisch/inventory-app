const express = require('express');
const router = express.Router();

const item_controller = require('../controllers/itemController');
const category_controller = require("../controllers/categoryController");

router.get('/', item_controller.index);

// item routes
router.get('/items', item_controller.items_list);
router.get('/item/create', item_controller.item_create_get);
router.post('/item/create', item_controller.item_create_post);
router.get('/item/:id', item_controller.item_details);
router.get('/item/:id/delete', item_controller.item_delete_get);
router.post('/item/:id/delete', item_controller.item_delete_post);
router.get('/item/:id/update', item_controller.item_update_get);
router.post('/item/:id/update', item_controller.item_update_post);

// category routes
router.get('/categories', category_controller.categories_list);
router.get('/category/create', category_controller.category_create_get);
router.post('/category/create', category_controller.category_create_post);
router.get('/category/:id', category_controller.category_details);
router.get('/category/:id/delete', category_controller.category_delete_get);
router.post('/category/:id/delete', category_controller.category_delete_post);
router.get('/category/:id/update', category_controller.category_update_get);
router.post('/category/:id/update', category_controller.category_update_post);

module.exports = router;