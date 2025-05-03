const express = require('express');
const router = express.Router();
require('dotenv').config({ path: 'variables.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET; // be careful this change if I delete the webhook in the stripe dashboard
const bodyParser =  require('body-parser');
const CartService = require('../services/client/CartService');

/*remember download ngrok, open the command line, paste the SECRET ID from ngrok, and use it, 
plus '/webhook' inside the stripe webhook dashboard to open the connection. This webhook requires raw data */
router.post('/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {   
    let event;

    try {
        const sig = req.headers['stripe-signature'];
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`🚨 Webhook signature verification failed.`, err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed or async_payment_succeeded event
    if (event.type === 'checkout.session.completed') {        
        const session = event.data.object;        
        await CartService.checkoutCart(session.id);        
    } 
    
    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
        const session = event.data.object; 
        console.log('🚨 the checkout session expired', session)         
    }

    res.status(200).end();
});

module.exports = router;