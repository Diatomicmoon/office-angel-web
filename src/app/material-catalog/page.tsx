"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Camera, Loader2, RefreshCw } from "lucide-react";

type MaterialItem = {
  id: string;
  sku: string;
  item_name: string;
  unit_price: number;
  unit_of_measure: string;
  supplier: string;
  last_updated: string;
};

export default function MaterialCatalogPage() {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/material-catalog");
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanStatus("Compressing image...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            setScanning(false);
            setScanStatus("Compression failed.");
            return;
          }

          const formData = new FormData();
          formData.append("image", blob, "receipt.jpg");

          try {
            setScanStatus("AI parsing receipt...");
            const res = await fetch("/api/receipts/scan", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error("Failed to scan receipt");

            const data = await res.json();
            if (data.receipt) {
              setScanStatus("Catalog updated!");
              await fetchCatalog();
              setTimeout(() => setScanStatus(null), 3000);
            }
          } catch (err) {
            console.error(err);
            setScanStatus("Error scanning receipt");
            setTimeout(() => setScanStatus(null), 3000);
          } finally {
            setScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }, 'image/jpeg', 0.7);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/financials" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Back to Financials
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={28} className="text-blue-600" /> Material Cost Engine
          </h1>
          <p className="text-gray-500 mt-1">Live supply house pricing extracted from scanned receipts.</p>
        </div>
        
        <div>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleScan}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            {scanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            {scanStatus || "Scan Receipt to Update Prices"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <RefreshCw className="animate-spin w-8 h-8 mb-4 text-gray-300" />
            Loading catalog...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Your catalog is empty.</p>
            <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">Scan a supply house receipt to automatically build your live pricing database.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Item Name</th>
                <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                <th className="px-6 py-4 font-medium text-center">UOM</th>
                <th className="px-6 py-4 font-medium">Supplier</th>
                <th className="px-6 py-4 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.item_name}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-right">${item.unit_price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500 text-center">{item.unit_of_measure}</td>
                  <td className="px-6 py-4 text-gray-600">{item.supplier}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(item.last_updated).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
