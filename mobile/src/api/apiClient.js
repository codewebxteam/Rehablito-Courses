// Railway Backend URL for Rehablito App
export const BACKEND_URL = 'https://rehablito-courses-production.up.railway.app';

export async function createPaymentOrder(amount, currency = 'INR', receipt = '') {
  const response = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, receipt }),
  });
  return await response.json();
}

export async function verifyPayment(paymentData) {
  const response = await fetch(`${BACKEND_URL}/api/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  return await response.json();
}
