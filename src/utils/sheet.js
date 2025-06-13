// utils/sheet.js
const SHEET_ID = process.env.REACT_APP_GOOGLE_SHEET_ID
const GID_NAMES = process.env.REACT_APP_GOOGLE_SHEET_NAMES_GRID
const GID_PRODUCTS = process.env.REACT_APP_GOOGLE_SHEET_PRODUCTS_GRID

if (!SHEET_ID) {
  console.log('Env var REACT_APP_GOOGLE_SHEET_ID: ', SHEET_ID)
  throw new Error("Missing env var REACT_APP_GOOGLE_SHEET_ID");
}

// Returns 2D array of your sheet (first row is headers)
export async function fetchSheetAsCsv(gid) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  const text = await res.text();
  // simple CSV → array parse
  return text.split('\n').map(line => line.split(','));
}

// map into objects
export async function fetchNames() {
  const rows = await fetchSheetAsCsv(GID_NAMES);
  return rows.slice(1).map(r => r[0]).filter(n => n);
}
export async function fetchProducts() {
  const rows = await fetchSheetAsCsv(GID_PRODUCTS);
  return rows.slice(1).map(r => ({
    titel:   r[0],
    preis:   parseFloat(r[1]),
    bildUrl: r[2],
  }));
}
