import { fetchNames as fetchNamesCsv, fetchProducts as fetchProductsCsv } from './utils/sheet';

const BASE = process.env.REACT_APP_GOOGLE_SHEET_DEPLOYMENT_URL;

export async function fetchProducts() {
  return fetchProductsCsv();
}

export async function fetchNames() {
  return fetchNamesCsv();
}

export async function saveOrder(order) {
  const res = await fetch(BASE, {
    method: 'POST',
    mode:   'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  console.log('⟵ Got response:', res);
  
  // if (!res.ok) {
  //   const text = await res.text();
  //   throw new Error(`Save failed: ${res.status} ${text}`);
  // }
  // return res.json();

  return true;
}