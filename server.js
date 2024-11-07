const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const app = express();
app.use(bodyParser.json());

const razorpay = new Razorpay({
    key_id: 'your_key_id',
    key_secret: 'your_key_secret'
});

// Route to create order
app.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;
    const options = {
        amount: amount,
        currency: currency,
        receipt: "order_rcptid_11"
    };
    try {
        const order = await razorpay.orders.create(options);
        res.send(order);
    } catch (error) {
        res.status(500).send({ error: 'Error creating order' });
    }
});

// Route to verify payment
app.post('/payment/verify', (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const generatedSignature = crypto
        .createHmac('sha256', razorpay.key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (generatedSignature === razorpay_signature) {
        res.send({ status: "success", message: "Payment verified successfully" });
    } else {
        res.status(400).send({ status: "failure", message: "Payment verification failed" });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
