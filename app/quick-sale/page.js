"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

export default function QuickSalePage() {
  /* ---------------- STATE ---------------- */
  const [skus, setSkus] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");

  /* ---------------- FETCH RETAIL SKUs ---------------- */
  useEffect(() => {
    const fetchSkus = async () => {
      const { data, error } = await supabase
        .from("retail_skus")
        .select("*")
        .eq("is_active", true)
        .order("sku_name");

      if (!error) {
        setSkus(data || []);
      }
    };

    fetchSkus();
  }, []);

  /* ---------------- HELPERS ---------------- */
  const total =
    qty && price ? (Number(qty) * Number(price)).toFixed(2) : "0.00";

  const reset = () => {
    setSelectedSku(null);
    setQty(1);
    setPrice("");
  };

  /* ---------------- CONFIRM SALE ---------------- */
  const confirmSale = async () => {
    if (!selectedSku || !qty || !price) return;

    const { error } = await supabase.from("quick_sales").insert({
      sku_name: selectedSku,
      quantity: Number(qty),
      price_per_unit: Number(price),
      total_amount: Number(total),
    });

    if (error) {
      alert("❌ Sale not recorded. Check internet connection.");
      return;
    }

    reset(); // ready for next sale
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-4xl mx-auto">
      {/* HEADER + NAV */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">⚡ Quick Sale</h1>

        <div className="flex gap-2">
          <Link
            href="/retail-skus"
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Retail SKUs
          </Link>

          <Link
            href="/daily-sales"
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            Today’s Sales
          </Link>
        </div>
      </div>

      {/* SKU GRID */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {skus.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSku(s.sku_name)}
            className={`p-4 rounded-xl font-semibold ${
              selectedSku === s.sku_name
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {s.sku_name}
          </button>
        ))}
      </div>

      {/* ACTION PANEL */}
      {selectedSku && (
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="font-semibold mb-3">{selectedSku}</div>

          {/* QUANTITY */}
          <div className="mb-4">
            <label className="text-xs block mb-1">
              Quantity (decimal allowed)
            </label>

            <input
              type="number"
              step="0.001"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full border rounded p-2 text-lg mb-2"
            />

            <div className="grid grid-cols-4 gap-2">
              {[0.25, 0.5, 1, 2].map((v) => (
                <button
                  key={v}
                  onClick={() => setQty((prev) => Number(prev) + v)}
                  className="bg-gray-200 rounded py-2 font-semibold"
                >
                  +{v}
                </button>
              ))}
            </div>
          </div>

          {/* PRICE */}
          <div className="mb-4">
            <label className="text-xs block mb-1">Price per unit</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded p-2 text-lg"
            />
          </div>

          {/* TOTAL */}
          <div className="text-xl font-bold mb-4">
            Total ₹ {total}
          </div>

          {/* CONFIRM */}
          <button
            onClick={confirmSale}
            className="w-full bg-green-600 text-white py-3 rounded-xl text-lg font-semibold"
          >
            ✅ Confirm Sale
          </button>
        </div>
      )}
    </div>
  );
}
