"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";

export default function DailySalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Fetch sales (today + yesterday)
  const fetchSales = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("quick_sales")
      .select("*")
      .order("sale_timestamp", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setSales(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Delete ONLY today's sale (DB enforces this)
  const deleteSale = async (id) => {
    const confirmDelete = confirm(
      "Delete this sale?\nOnly today's sales can be deleted."
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("quick_sales")
      .delete()
      .eq("id", id);

    if (error) {
      alert("This sale cannot be deleted.");
      return;
    }

    fetchSales();
  };

  // CSV Export (today only)
  const exportCSV = () => {
    const todaySales = sales.filter(
      (s) => s.sale_timestamp.slice(0, 10) === today
    );

    if (!todaySales.length) {
      alert("No sales for today");
      return;
    }

    const headers = [
      "SKU Name",
      "Quantity",
      "Price Per Unit",
      "Total Amount",
      "Timestamp",
    ];

    const rows = todaySales.map((s) => [
      s.sku_name,
      s.quantity,
      s.price_per_unit,
      s.total_amount,
      s.sale_timestamp,
    ]);

    const csv =
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_sales_${today}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto" }}>
      <Link href="/quick-sale">← Back to Quick Sale</Link>

      <h2 style={{ marginTop: "10px" }}>Daily Sales</h2>

      <button
        onClick={exportCSV}
        style={{ marginBottom: "15px" }}
      >
        Export Today CSV
      </button>

      {loading ? (
        <p>Loading sales...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th align="left">SKU</th>
              <th align="right">Qty</th>
              <th align="right">Price</th>
              <th align="right">Total</th>
              <th align="left">Date</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => {
              const saleDate =
                sale.sale_timestamp.slice(0, 10);
              const isToday = saleDate === today;

              return (
                <tr
                  key={sale.id}
                  style={{
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <td>{sale.sku_name}</td>
                  <td align="right">
                    {sale.quantity}
                  </td>
                  <td align="right">
                    ₹{sale.price_per_unit}
                  </td>
                  <td align="right">
                    ₹{sale.total_amount}
                  </td>
                  <td>{saleDate}</td>
                  <td>
                    {isToday && (
                      <button
                        onClick={() =>
                          deleteSale(sale.id)
                        }
                        style={{
                          background: "#ffe5e5",
                          border: "none",
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
