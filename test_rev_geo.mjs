import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const lat = 44.8548;
  const lng = -93.4707;
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.results && data.results.length > 0) {
      const best = data.results[0];
      console.log("Formatted:", best.formatted_address);
      
      let streetNum = "";
      let route = "";
      let zip = "";
      for (const comp of best.address_components) {
          if (comp.types.includes('street_number')) streetNum = comp.short_name;
          if (comp.types.includes('route')) route = comp.short_name;
          if (comp.types.includes('postal_code')) zip = comp.short_name;
      }
      const street = `${streetNum} ${route}`.trim();
      console.log("Street:", street, "Zip:", zip);
  } else {
      console.log("No results", data);
  }
}
run();
