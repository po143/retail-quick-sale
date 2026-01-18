"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabaseClient";
import Link from "next/link";

export default function RetailSkusPage() {
  const [skus, setSkus] = useState([]);
  const [skuName, setSkuName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [loading, setLoading] = useState(false);

  // Fetch SKUs
  const fetchSkus = async () => {
    const { data, error } = await supabase
      .from("retail_skus")
      .select("*")
      .order("sku_name", { ascending: true });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setSkus(data || []);
  };

  useEffect(() => {
    fetchSkus();
  }, []);

  // Add SKU
  const addSku = async (e) => {
    e.preventDefault();

    if (!skuName.trim()) {
      alert("SKU name cannot be empty");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("retail_skus")
      .insert([
        {
          sku_name: skuName.trim(),
          unit: unit,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setSkuName("");
    setUnit("pcs");
    fetchSkus();
  };

  // Toggle enable / disable
  const toggleSku = async (id, currentStatus) => {
    const { error } = await supabase
      .from("retail_skus")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    fetchSkus();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto" }}>
      <Link href="/quick-sale">← Back to Quick Sale</Link>

      <h2 style={{ marginTop: "10px" }}>
        Retail SKUs (Allowed to Sell)
      </h2>

      {/* Add SKU */}
      <form onSubmit={addSku} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="New SKU name"
          value={skuName}
          onChange={(e) => setSkuName(e.target.value)}
          style={{ padding: "8px", width: "55%", marginRight: "10px" }}
        />

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="pcs">pcs</option>
          <option value="kg">kg</option>
          <option value="gm">gm</option>
          <option value="ltr">ltr</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {/* SKU List */}
      <div style={{ marginTop: "30px" }}>
        {skus.map((sku) => (
          <div
            key={sku.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              marginBottom: "10px",
            }}
          >
            <div>
              <strong>{sku.sku_name}</strong>{" "}
              <span style={{ color: "#666" }}>
                ({sku.unit})
              </span>
              {!sku.is_active && (
                <span style={{ color: "#999" }}> — inactive</span>
              )}
            </div>

            <button
              onClick={() => toggleSku(sku.id, sku.is_active)}
              style={{
                background: sku.is_active ? "#ffe5e5" : "#e5ffe5",
                border: "none",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              {sku.is_active ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
