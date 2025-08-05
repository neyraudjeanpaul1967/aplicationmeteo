import { loadStripe } from "@stripe/stripe-js";

// Initialiser Stripe avec votre clé publique
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function StripeLayout({ children }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Application Météo</title>
      </head>
      <body>
        {children}
        {/* Scripts Stripe si nécessaire */}
        <script async src="https://js.stripe.com/v3/"></script>
      </body>
    </html>
  );
}

// Export pour utilisation dans d'autres composants
export { stripePromise };
