"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const MapPreview = dynamic(() => import("./MapPreview"), { ssr: false });

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export function AddressAutocomplete({
  value,
  onChange
}: {
  value: string;
  onChange: (val: string, lat?: number, lng?: number) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  const searchAddress = async (q: string) => {
    if (!q || q.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setSelectedLocation(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(val);
    }, 600);
  };

  const handleSelect = (s: Suggestion) => {
    const parts = s.display_name.split(",");
    const shortAddress = parts.slice(0, 3).join(",").trim();
    
    setQuery(shortAddress);
    setShowDropdown(false);
    
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    
    setSelectedLocation({ lat, lng });
    onChange(shortAddress, lat, lng);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input 
          type="text" 
          value={query} 
          onChange={handleInputChange} 
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="123 Main St..." 
          className="mt-1 w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <div 
              key={i} 
              onMouseDown={() => handleSelect(s)}
              className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm flex items-start gap-2 border-b last:border-0"
            >
              <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-700 line-clamp-2">{s.display_name}</span>
            </div>
          ))}
        </div>
      )}

      {selectedLocation && (
        <div className="mt-3 h-32 w-full rounded-lg overflow-hidden border border-gray-200 relative z-0">
          <MapPreview lat={selectedLocation.lat} lng={selectedLocation.lng} />
        </div>
      )}
    </div>
  );
}
