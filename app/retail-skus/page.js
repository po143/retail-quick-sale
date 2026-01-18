"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

export default function RetailSkusPage() {
  const [skus, setSkus] = useState([]);
  const [newSku, setNewSku] = useState("");

  /* ---------------- FETCH SKUS ---------------- */
  const fetchSkus = async () => {
    const { data, error } = await supabase
      .from("retail_skus")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setSkus(data || []);
    }
  };

  useEffect(() => {
    fetchSkus();
  }, []);

  /* ---------------- ADD SKU ---------------- */
  const addSku = async () => {
    if (!newSku.trim()) return;

    const { error } = await supabase.from("retail_skus").insert({
      sku_name: newSku.trim(),
    });

    if (!error) {
      setNewSku("");
      fetchSkus();
    }
  };

  /* ---------------- ENABLE / DISABLE SKU ---------------- */
  const toggleSku = async (id, is_active) => {
    await supabase
      .from("retail_skus")
      .update({ is_active: !is_active })
      .eq("id", id);

    fetchSkus();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* BACK */}
      <Link
        href="/quick-sale"
        className="inline-block mb-4 text-sm underline text-blue-600"
      >
        ← Back to Quick Sale
      </Link>

      <h1 className="text-xl font-bold mb-4">
        Retail SKUs (Allowed to Sell)
      </h1>

      {/* ADD SKU */}
      <div className="flex gap-2 mb-6">
        <input
          value={newSku}
          onChange={(e) => setNewSku(e.target.value)}
          placeholder="New SKU name"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={addSku}
          className="bg-black text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {/* SKU LIST */}
      <div className="space-y-3">
        {skus.map((sku) => (
          <div
            key={sku.id}
            className="flex justify-between items-center border p-3 rounded"
          >
            <span
              className={`font-medium ${
                sku.is_active ? "" : "line-through text-gray-400"
              }`}
            >
              {sku.sku_name}
            </span>

            <button
              onClick={() => toggleSku(sku.id, sku.is_active)}
              className={`px-3 py-1 rounded text-sm ${
                sku.is_active
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {sku.is_active ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
