const async = require('async');

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