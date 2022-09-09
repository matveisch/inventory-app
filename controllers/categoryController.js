const async = require('async');
const { body, validationResult } = require("express-validator");

const Item = require('../models/item');
const Category = require('../models/category');

exports.categories_list = (req, res, next) => {
    Category.find({})
        .sort({name: 1})
        .exec((err, list_categories) => {
            if (err) return next(err);

            res.render('categories_list', {title: 'Categories List', categories_list: list_categories});
        });
};

exports.category_details = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items(callback) {
                Item.find({category: req.params.id}).exec(callback);
            }
        },
        (err, results) => {
            if (err) return next(err);

            if (results.category === null) {
                const err = new Error('Category not found');
                err.status = 404;
                return next(err);
            }

            res.render('category_details', {
                category: results.category,
                category_items: results.category_items,
            });
        }
    )
};

exports.category_create_get = (req, res) => {
    res.render('category_form', {title: 'Create Category'});
};

exports.category_create_post = [
    body("name", "Name must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("description", "Description must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
        });

        if (!errors.isEmpty()) {
            res.render('category_form', {
                title: 'Create Category',
                category,
                errors: errors.array(),
            });

            return;
        }

        category.save((err) => {
            if (err) return next(err);

            res.redirect(category.url);
        });
    }
];

exports.category_delete_get = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items(callback) {
                Item.find({category: req.params.id}).exec(callback);
            }
        },
        (err, results) => {
            if (err) return next(err);

            if (results.category === null) res.redirect('catalog/categories');

            res.render('category_delete', {
                title: 'Delete Category',
                category: results.category,
                category_items: results.category_items,
            })
        }
    )
};

exports.category_delete_post = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            category_items(callback) {
                Item.find({category: req.params.categoryid}).exec(callback);
            }
        },
        (err, results) => {
            if (err) return next(err);

            console.log(results.category_items);

            if (results.category_items.length > 0) {
                res.render('category_delete', {
                    title: 'Delete Category',
                    category: results.category,
                    category_items: results.category_items,
                });

                return;
            }

            Category.findByIdAndRemove(req.body.categoryid, (err) => {
                if (err) return next(err);

                res.redirect('/catalog/categories');
            })
        }
    )
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
                    title: 'Create Item',
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