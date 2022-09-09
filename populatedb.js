#! /usr/bin/env node

console.log('This script populates some test items and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item');
var Category = require('./models/category');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []

function itemCreate(name, description, category, price, numberInStock, cb) {
    itemdetail = {
        name:name,
        description: description,
        category: category,
        price: price,
        numberInStock: numberInStock,
    }

    var item = new Item(itemdetail);

    item.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Item: ' + item);
        items.push(item)
        cb(null, item)
    }  );
}

function categoryCreate(name, description, cb) {
    var category = new Category({ name: name, description: description });

    category.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Category: ' + category);
        categories.push(category)
        cb(null, category);
    }   );
}

function createCategories(cb) {
    async.series(
        [
            function(callback) {
                categoryCreate('Fruits', 'Tasty fruits from local gardens', callback);
            },
            function(callback) {
                categoryCreate('Vegetables', 'Healthy vegetables. Locally grown', callback);
            },
            function(callback) {
                categoryCreate('Berries', 'Berries from the forest', callback);
            },
        ]
    )
}

function createItems(cb) {
    async.series(
        [
            function(callback) {
                itemCreate('Apple', 'Green apple', categories[0], 10, 30, callback);
            },
            function(callback) {
                itemCreate('Orange', 'Big orange', categories[0], 15, 20, callback);
            },
            function(callback) {
                itemCreate('Cucumber', 'Small green cucumber', categories[1], 6, 50, callback);
            },
            function(callback) {
                itemCreate('Tomato', 'Cherry tomato', categories[1], 3, 70, callback);
            },
            function(callback) {
                itemCreate('Blueberry', 'Nice little blueberries', categories[2], 5, 100, callback);
            },
        ]
    )
}

async.series([
        createItems,
    ],
// Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        // All done, disconnect from database
        mongoose.connection.close();
    }
);