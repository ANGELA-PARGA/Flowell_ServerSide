import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import { cartService } from './container.js'; // Import the instance from container.js

// 
const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET; // be careful this change if I delete the webhook in the stripe dashboard
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
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
        await cartService.checkoutCart(session.id);        
    } 
    
    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
        const session = event.data.object; 
        console.log('🚨 the checkout session expired', session)         
    }

    res.status(200).end();
});

export default router;