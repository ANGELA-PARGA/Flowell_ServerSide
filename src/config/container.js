import {db, pgp} from './dbConnection.js';

import GeneralQueries from '../DBQueries/generalQueries.js';
import OrderQueries from '../DBQueries/orderQueries.js';
import OrderedItemsQueries from '../DBQueries/orderedItemsQueries.js';
import ProductQueries from '../DBQueries/productQueries.js';
import UserQueries from '../DBQueries/userQueries.js';
import CartQueries from '../DBQueries/cartQueries.js';
import CartItemsQueries from '../DBQueries/cartItemsQueries.js';


import OrderRepository from '../repositories/OrderRepository.js';
import OrderedItemsRepository from '../repositories/OrderedItemsRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import CartItemsRepository from '../repositories/CartItemsRepository.js';


import OrderService from '../services/OrderService.js';
import OrderedItemsService from '../services/OrderedItemsService.js';
import CartService from '../services/CartService.js';
import CartItemsService from '../services/CartItemsService.js';
import ProductService from '../services/ProductService.js';
import UserService from '../services/UserService.js';
import AuthService from '../services/AuthService.js';


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



const orderedItemsService = new OrderedItemsService(orderedItemsRepository);
const cartItemsService = new CartItemsService(cartItemsRepository);
const orderService = new OrderService(orderRepository, orderedItemsService);
const userService = new UserService(userRepository, orderRepository);
const cartService = new CartService(cartRepository, cartItemsService, orderService);
const productService = new ProductService(productRepository);
const authenticationService = new AuthService(userService)


export { 
    orderService, 
    orderedItemsService,
    productService,
    userService,
    cartService,
    cartItemsService,
    authenticationService 
};
