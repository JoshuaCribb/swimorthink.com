import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  try {
    const { items } = JSON.parse(event.body);

    // Map items for Stripe and include public image URLs
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { 
          name: item.name,
          images: [
            `https://musical-semifreddo-762614.netlify.app/assets/full-zip01/${item.color.toLowerCase()}.png`
          ]
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.URL}/success.html`,
      cancel_url: `${process.env.URL}/cancel.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
