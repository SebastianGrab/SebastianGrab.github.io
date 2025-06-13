// src/pages/StrichlistePage.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchProducts, fetchNames, saveOrder } from '../api';
import '../styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function StrichlistePage() {
  const [products, setProducts]     = useState([]);
  const [names, setNames]           = useState([]);
  const [selectedName, setName]     = useState(null);
  const [quantities, setQty]        = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Daten (Names + Products) laden und Dropdown-Optionen bauen
  const loadData = () => {
    fetchNames()
      .then(raw => {
        const sorted = raw.sort((a,b) => a.localeCompare(b, 'de'));
        setNames(sorted.map(n => ({ value: n, label: n })));
      })
      .catch(console.error);
    fetchProducts().then(setProducts).catch(console.error);
    setQty({});
    setName(null);
  };
  useEffect(loadData, []);

  // Menge increment / decrement
  const adjustQty = (titel, delta) => {
    setQty(q => {
      const newVal = Math.max(0, (q[titel]||0) + delta);
      return { ...q, [titel]: newVal };
    });
  };

  // Gesamt berechnen
  const total = products.reduce(
    (sum, p) => sum + (quantities[p.titel] || 0) * p.preis,
    0
  );

  // Bestellung abschicken
  const handleSubmit = async () => {
    if (!selectedName) return toast.error('Bitte Name wählen');
    const items = products
      .filter(p => (quantities[p.titel] || 0) > 0)
      .map(p => ({
          titel: p.titel,
          preis: p.preis,
          menge: quantities[p.titel]
        }));
    if (!items.length) return toast.error('Mindestens ein Produkt wählen');

    setSubmitting(true);
    try {
      await saveOrder({ name: selectedName.value, items });
      toast.success('Bestellung gespeichert!');
      loadData();
    } catch (e) {
      console.error(e);
      toast.error('Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h2>Stricherlliste</h2>
        <button className="refresh-btn" onClick={loadData} title="Neu laden">
          ⟳
        </button>
      </header>

      <main>
        <div className="toolbar">
          <label className="name-label">Name:</label>
          <div className="name-select">
            <Select
              options={names}
              value={selectedName}
              onChange={setName}
              isSearchable
              isClearable
              placeholder="– Bitte wählen –"
              isDisabled={submitting || !names.length}
            />
          </div>
        </div>

        <div className="grid">
          {products.map(p => {
            const q = quantities[p.titel] || 0;
            return (
              <div className="card" key={p.titel}>
                <div className="icon-wrap">
                  <img src={p.bildUrl} alt={p.titel} />
                </div>
                <div className="title">{p.titel}</div>
                <div className="price">{p.preis.toFixed(2)} €</div>
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => adjustQty(p.titel, -1)}
                    disabled={submitting || q === 0}
                  >‹</button>
                  <span className="qty-value">{q}</span>
                  <button
                    className="qty-btn"
                    onClick={() => adjustQty(p.titel, +1)}
                    disabled={submitting}
                  >›</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer>
        <div className="summary">Summe: {total.toFixed(2)} €</div>
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '…speichern…' : 'Übermitteln'}
        </button>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}
