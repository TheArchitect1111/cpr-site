export const CPR_PAYPAL_RECIPIENT = 'dhjarngbo@gmail.com';

export function paypalCheckoutUrl(input: {
  amountCents: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  const url = new URL('https://www.paypal.com/cgi-bin/webscr');
  url.searchParams.set('cmd', '_xclick');
  url.searchParams.set('business', CPR_PAYPAL_RECIPIENT);
  url.searchParams.set('item_name', input.description);
  url.searchParams.set('amount', (input.amountCents / 100).toFixed(2));
  url.searchParams.set('currency_code', process.env.PAYPAL_CURRENCY || process.env.STRIPE_CURRENCY || 'CAD');
  url.searchParams.set('no_shipping', '1');
  url.searchParams.set('return', input.returnUrl);
  url.searchParams.set('cancel_return', input.cancelUrl);
  return url.toString();
}
