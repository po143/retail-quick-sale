"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

/* ---------------- CSV HELPER ---------------- */
const downloadCSV = (rows) => {
  if (!rows.length) return;

  const headers = [
    "SKU Name",
    "Quantity",
    "Price Per Unit",
    "Total Amount",
    "Time",
  ];

  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.sku_name,
        r.quantity,
        r.price_per_unit,
        r.total_amount,
        new Date(r.sale_timestamp).toLocaleTimeString(),
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "today_sales.csv";
  a.click();

  window.URL.revokeObjectURL(url);
};

export default function DailySalesPage() {
  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTodaySales = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("quick_sales")
        .select("*")
        .gte("sale_timestamp", today.toISOString())
        .order("sale_timestamp", { ascending: false });

      if (!error) {
        setSales(data || []);
        setTotal(
          data?.reduce(
            (sum, r) => sum + Number(r.total_amount),
            0
          ) || 0
        );
      }
    };

    fetchTodaySales();
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* BACK */}
      <Link
        href="/quick-sale"
        className="inline-block mb-4 text-sm underline text-blue-600"
      >
        ← Back to Quick Sale
      </Link>

      <h1 className="text-xl font-bold mb-2">Today’s Sales</h1>

      <div className="text-lg font-semibold mb-4">
        Total: ₹ {total.toFixed(2)}
      </div>

      <button
        onClick={() => downloadCSV(sales)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download CSV
      </button>

      <div className="space-y-2">
        {sales.map((s, i) => (
          <div
            key={i}
            className="flex justify-between items-center border p-3 rounded"
          >
            <div>
              <div className="font-medium">{s.sku_name}</div>
              <div className="text-xs text-gray-500">
                Qty: {s.quantity}
              </div>
            </div>
            <div className="font-semibold">
              ₹ {s.total_amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
