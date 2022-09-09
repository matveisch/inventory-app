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
    Item.find({}, 'name')
        .sort({name: 1})
        .exec((err, list_items) => {
            if (err) {return next(err)}
            res.render('items_list', {title: 'Items List', items_list: list_items});
        });
};