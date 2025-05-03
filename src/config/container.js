const { db, pgp } = require('./dbConnection');

const GeneralQueries = require('../DBQueries/generalQueries');
const OrderQueries = require('../DBQueries/orderQueries');
const OrderedItemsQueries = require('../DBQueries/orderedItemsQueries');
const ProductQueries = require('../DBQueries/productQueries');
const UserQueries = require('../DBQueries/userQueries');
const CartQueries = require('../DBQueries/cartQueries');
const CartItemsQueries = require('../DBQueries/cartItemsQueries');


const OrderRepository = require('../repositories/OrderRepository');
const OrderedItemsRepository = require('../repositories/OrderedItemsRepository');
const ProductRepository = require('../repositories/ProductRepository');
const UserRepository = require('../repositories/UserRepository');
const CartRepository = require('../repositories/CartRepository');
const CartItemsRepository = require('../repositories/CartItemsRepository');


const OrderService = require('../services/client/OrderService')
const OrderedItemsService = require('../services/client/OrderedItemsService');
const CartService = require('../services/client/CartService')
const CartItemsService = require('../services/client/CartItemsService');
const ProductService = require('../services/client/ProductService')
const UserService = require('../services/client/UserService')


/*
 * This file is responsible for setting up the dependency injection container for the application.
 * It initializes the database connection, creates instances of the Queries classes that will be used on the repositories,
 * and exports the repositories instances for use in other parts of the application.
 * 
 * @module container
 */

const generalQueries = new GeneralQueries(db, pgp);
const orderQueries = new OrderQueries(db, pgp);
const orderedItemsQueries = new OrderedItemsQueries(db, pgp);
const productQueries = new ProductQueries(db, pgp);
const userQueries = new UserQueries(db, pgp);
const cartQueries = new CartQueries(db, pgp);
const cartItemsQueries = new CartItemsQueries(db, pgp);


const orderRepository = new OrderRepository(generalQueries, orderQueries);
const orderedItemsRepository = new OrderedItemsRepository(generalQueries, orderedItemsQueries);
const productRepository = new ProductRepository(generalQueries, productQueries);
const userRepository = new UserRepository(generalQueries, userQueries);
const cartRepository = new CartRepository(generalQueries, cartQueries);
const cartItemsRepository = new CartItemsRepository(generalQueries, cartItemsQueries);


const orderService = new OrderService(orderRepository);
const orderedItemsService = new OrderedItemsService(orderedItemsRepository);
const productService = new ProductService(productRepository);
const userService = new UserService(userRepository, orderRepository);
const cartService = new CartService(cartRepository);
const cartItemsService = new CartItemsService(cartItemsRepository);


module.exports = { 
    orderService, 
    orderedItemsService,
    productService,
    userService,
    cartService,
    cartItemsService 
};
