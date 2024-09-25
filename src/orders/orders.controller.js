const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


// Middleware functions

function deliverToPropertyIsValid(req, res, next) {
    const { deliverTo } = req.body.data;
    if (deliverTo === "" || !deliverTo) {
        next({
            status: 400,
            message: "Order must include a deliverTo",
        });
    } else {
        next();
    };
};

function mobileNumberPropertyIsValid(req, res, next) {
    const { mobileNumber } = req.body.data;
    if (mobileNumber === "" || !mobileNumber) {
        next({
            status: 400, 
            message: "Order must include a mobileNumber",
        });
    } else {
        next();
    };
};

function dishesPropertyIsValid(req, res, next) {
    const { dishes } = req.body.data;
    if (!Array.isArray(dishes) || dishes.length <= 0 || !dishes) {
        next({
            status: 400,
            message: "Order must include at least one dish"
        });
    } else {
        next();
    };
};

function statusPropertyIsValid(req, res, next) {
    const { status } = req.body.data;
    const validStaus = ["out-for-delivery", "delivered", "pending"];
    if (status === "" || !status || !validStaus.includes(status)) {
        next({
            status: 400,
            message: "Order must include one of these statuses ('out-for-delivery', 'delivered', 'pending')",
        });
    } else {
        next();
    };
};

function quantityPropertyIsValid(req, res, next) {
    const { dishes } = req.body.data;
    dishes.forEach((dish, index) => {
        if (dish.quantity === "" || !Number.isInteger(dish.quantity) || dish.quantity <= 0 ) {
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`,
            });
        };
    });
    next()
};

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const orderFound = orders.find((order) => order.id === orderId);
    if (orderFound) {
        res.locals.order = orderFound;
        next();
    } else {
        next({
            status: 404,
            message: `Order not found for order id ${orderId}`,
        });
    };
};

function orderIdMatches(req, res, next) {
    const { id } = req.body.data;
    if (id) {
        if (id === res.locals.order.id) {
            next();
        } else {
            next({
                status: 400,
                message: `id ${id}`,
            });
        };
    } else {
        next();
    };
};

function isStatusPending(req, res, next) {
    const status = res.locals.order.status;
    if (status !== "pending") {
        next({
            status: 400,
            message: "An order cannot be deleted unless it is pending"
        });
    } else {
        next();
    };
};

// API endpoint functions

function list(req, res,) {
    res.json({data: orders});
};

function create(req, res) {
    const { deliverTo, mobileNumber, status, dishes } = req.body.data;
    const newOrder = {
        id: nextId(),
        deliverTo: deliverTo,
        mobileNumber: mobileNumber,
        status: status,
        dishes: [dishes]
    }
    orders.push(newOrder);
    res.status(201).json({data: newOrder});
};

function read(req, res) {
    res.json({data: res.locals.order});
};

function update(req, res) {
    const { deliverTo, mobileNumber, status, dishes } = req.body.data;
    const updatedOrder = res.locals.order;

    updatedOrder.deliverTo = deliverTo;
    updatedOrder.mobileNumber = mobileNumber;
    updatedOrder.status = status;
    updatedOrder.dishes = [...dishes];
    res.json({data: updatedOrder});
};

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => res.locals.order.id === orderId);
    const deletedOrder = orders.splice(index, 1);
    res.sendStatus(204);
};

// Export API endpoint functions with middleware checks

module.exports = {
    list,
    create: [
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        dishesPropertyIsValid,
        quantityPropertyIsValid,
        create,
    ],
    read: [orderExists, read],
    update: [
        orderExists, 
        orderIdMatches,
        deliverToPropertyIsValid,
        mobileNumberPropertyIsValid,
        statusPropertyIsValid,
        dishesPropertyIsValid,
        quantityPropertyIsValid,
        update],
    delete: [orderExists, isStatusPending, destroy],
};