const async = require('async');
const { body, validationResult } = require("express-validator");

const Item = require('../models/item');
const Category = require('../models/category');

exports.index = (req, res) => {
    async.parallel(
        {
            item_count(callback) {
                Item.countDocuments({}, callback);
            },
            category_count(callback) {
                Category.countDocuments({}, callback);
            }
        },
        (err, results) => {
            res.render('index', {title: 'Inventory App Home', results, err});
        }
    );
};

exports.items_list = (req, res, next) => {
    Item.find({})
        .sort({name: 1})
        .exec((err, list_items) => {
            if (err) return next(err);

            res.render('items_list', {title: 'Items List', items_list: list_items});
        });
};

exports.item_details = (req, res, next) => {
    Item.findById(req.params.id)
        .populate('category')
        .exec((err, item) => {
            if (err) return next(err);

            if (item === null) {
                const err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }

            res.render('item_details', {item});
        });
};

exports.item_create_get = (req, res, next) => {
    Category.find({}).exec((err, categories) => {
        if (err) return next(err);

        console.log(categories);

        res.render('item_form', {
            title: 'Create Item',
            categories,
        });
    });
};

exports.item_create_post = [
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category.*", "Category must not be empty.")
        .escape(),
    body("price", "Price must not be empty")
        .trim()
        .isInt({ min: 0})
        .escape(),
    body("numberInStock", "Number In Stock must not be empty")
        .trim()
        .isInt({ min: 0})
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            numberInStock: req.body.numberInStock,
        });

        if (!errors.isEmpty()) {
            Category.find({}).exec((err, categories) => {
                if (err) return next(err);

                res.render('item_form', {
                    title: 'Create Item',
                    categories,
                    item,
                    errors: errors.array(),
                });
            })

            return;
        }

        item.save((err) => {
            if (err) return next(err);

            res.redirect(item.url);
        });
    }
];

exports.item_delete_get = (req, res, next) => {
    Item.findById(req.params.id).exec((err, item) => {
        if (err) return next(err);

        if (item === null) res.redirect('catalog/items');

        res.render('item_delete', {
            title: 'Delete Item',
            item
        })
    })
};

exports.item_delete_post = (req, res, next) => {
    Item.findByIdAndRemove(req.body.itemid, (err) => {
        if (err) return next(err);

        res.redirect('/catalog/items');
    })
}

exports.item_update_get = (req, res, next) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id).exec(callback);
            },
            categories(callback) {
                Category.find({}).exec(callback);
            }
        },
        (err, results) => {
            if (err) return next(err);

            if (results.item === null) {
                const err = new Error('Item not found');
                err.status = 404;
                return next(err);
            }

            res.render('item_form', {
                title: 'Update Item',
                item: results.item,
                categories: results.categories,
            });
        }
    )
};

exports.item_update_post = [
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("category.*", "Category must not be empty.")
        .escape(),
    body("price", "Price must not be empty")
        .trim()
        .isInt({ min: 0})
        .escape(),
    body("numberInStock", "Number In Stock must not be empty")
        .trim()
        .isInt({ min: 0})
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            numberInStock: req.body.numberInStock,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            Category.find({}).exec((err, categories) => {
                if (err) return next(err);

                res.render('item_form', {
                    title: 'Update Item',
                    categories,
                    item,
                    errors: errors.array(),
                });
            })

            return;
        }

        Item.findByIdAndUpdate(req.params.id, item, {}, (err, theItem) => {
            if (err) return next(err);

            res.redirect(theItem.url);
        })
    }
];