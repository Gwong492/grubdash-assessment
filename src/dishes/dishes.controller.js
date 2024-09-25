const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


// Middleware functions

function namePropertyIsValid(req, res, next) {
    const { name } = req.body.data;
    if (name.length <= 0 || !name) {
        next({
            status: 404,
            message: "Dish must include a name"
        });
    } else {
        next();
    };
};

function descriptionPropertyIsValid(req, res, next) {
    const { description } = req.body.data;
    if (description.length <= 0 || !description) {
        next({
            status: 400,
            message: "Dish must include a description",
        });
    } else {
        next();
    };
};

function pricePropertyIsValid(req, res, next) {
    const { price } = req.body.data;
    if (!Number.isInteger(price) || Number(price) <= 0 || !price) {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        });
    } else {
        next();
    };
};

function img_urlPropertyIsValid(req, res, next) {
    const { image_url } = req.body.data;
    if (image_url.length <= 0 || !image_url) {
        next({
            status: 400,
            message: "Dish must include a image_url"
        })
    } else {
        next();
    };
};

function dishExisits(req, res, next) {
    const { dishId } = req.params;
    const dishFound = dishes.find((dish) => dish.id === dishId);
    if (dishFound) {
        res.locals.dish = dishFound;
        next();
    } else {
        next({
            status: 404,
            message: `Dish not found with ID ${dishId}`
        });
    };
};

function dishIdMatches(req, res, next) {
    const { id } = req.body.data;
    if (id) {
        if (id === res.locals.dish.id) {
            next();
        } else {
            next({
                status: 404,
                message: `Dish id not needed but if present must match dish's current id`,
            });
        };
    } else {
        next();
    };
};

// API endpoint functions

function list(req, res) {
    res.json({data: dishes});
};

function create(req, res) {
    const { name, description, price, image_url } = req.body.data;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish});
};

function read(req, res) {
    res.json({data: res.locals.dish});
};

function update(req, res) {
    const { name, description, price, image_url } = req.body.data;
    const updatedDish = res.locals.dish;

    updatedDish.name = name;
    updatedDish.description = description;
    updatedDish.price = price;
    updatedDish.image_url = image_url;

    dishes.push(updatedDish);
    res.json({data: updatedDish});
};

// Export API endpoint functions and middleware checks
module.exports = {
    list,
    create: [
        namePropertyIsValid,
        descriptionPropertyIsValid,
        pricePropertyIsValid,
        img_urlPropertyIsValid,
        create,
    ],
    read: [dishExisits, read],
    update: [
        dishExisits, 
        dishIdMatches, 
        namePropertyIsValid,
        descriptionPropertyIsValid,
        pricePropertyIsValid,
        img_urlPropertyIsValid,
        update
    ],
};