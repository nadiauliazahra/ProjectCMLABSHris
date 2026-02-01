"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import axios from "axios"; 

/* 1. SEARCH BAR WITH SUGGESTIONS */
function SearchField() {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: { 'accept-language': 'id', countrycodes: 'id' },
    });

    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      
      // --- GOOGLE MAPS BEHAVIOR ---
      autoComplete: true,       
      autoCompleteDelay: 250,   
      showMarker: false,        
      showPopup: false,         
      marker: { icon: null },   
      
      autoClose: true,          
      retainZoomLevel: true,    
      animateZoom: true,
      keepResult: true,         
      searchLabel: 'Cari lokasi...',
    });

    map.addControl(searchControl);
    return () => { map.removeControl(searchControl); };
  }, [map]);
  return null;
}

/* 2. MAP CONTROLLER */
function MapController({ lat, lng, onChange, onAddressFound }: any) {
  const map = useMap();
  const isUserDragging = useRef(false);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`;
      const res = await axios.get(url);
      if (res.data && res.data.display_name) {
        if (onAddressFound) onAddressFound(res.data.display_name);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  useMapEvents({
    movestart: () => { isUserDragging.current = true; },
    moveend: () => {
      const center = map.getCenter();
      if (onChange) onChange(center.lat, center.lng);
      fetchAddress(center.lat, center.lng);
      setTimeout(() => { isUserDragging.current = false; }, 100);
    },
  });

  useEffect(() => {
    if (isUserDragging.current) return;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const current = map.getCenter();
      const dist = Math.sqrt(Math.pow(current.lat - lat, 2) + Math.pow(current.lng - lng, 2));
      if (dist > 0.0005) { 
        map.setView([lat, lng], map.getZoom(), { animate: true });
        fetchAddress(lat, lng);
      }
    }
  }, [lat, lng, map]);

  return null;
}

/* 3. MAIN COMPONENT */
export default function MapPicker({ lat, lng, onChange, onAddressFound, readonly = false }: any) {
  const initialCenter = useMemo(() => {
    const safeLat = lat && !isNaN(parseFloat(lat)) ? parseFloat(lat) : -6.1754;
    const safeLng = lng && !isNaN(parseFloat(lng)) ? parseFloat(lng) : 106.8272;
    return [safeLat, safeLng] as [number, number];
  }, []);

  return (
    // NOTE: removed overflow-hidden from here to let dropdown overflow if needed
    <div className="w-full h-full relative isolate rounded-lg border border-gray-300">
      <MapContainer
        center={initialCenter}
        zoom={15}
        scrollWheelZoom={!readonly}
        dragging={!readonly}
        style={{ height: "100%", width: "100%", zIndex: 0, borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readonly && <SearchField />}
        <MapController 
            lat={parseFloat(lat)} 
            lng={parseFloat(lng)} 
            onChange={onChange} 
            onAddressFound={onAddressFound} 
        />
      </MapContainer>

      {/* CENTER PIN */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none pb-[20px]">
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-10 h-10 ${readonly ? 'text-gray-500' : 'text-red-600'} drop-shadow-xl`}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <div className="w-1.5 h-1.5 bg-black/40 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[18px] blur-[1.5px]"></div>
      </div>


      {/* --- CSS FIXES --- */}
      <style jsx global>{`
        /* 1. Ensure the search FORM allows the results to spill out */
        .leaflet-control-geosearch form {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: relative;
            overflow: visible !important; /* CRITICAL FIX */
            z-index: 10000;
        }

        /* 2. Input Styling */
        .leaflet-control-geosearch form input {
            color: #000 !important;
            font-size: 14px;
            width: 100%;
            min-width: 250px; 
            padding: 8px;
            outline: none;
        }

        /* 3. The Results Dropdown Container */
        .leaflet-control-geosearch .results {
            background: white;
            margin-top: 4px; /* Slight gap */
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border: 1px solid #eee;
            width: 100%; 
            max-height: 200px; /* Prevent it from being too long */
            overflow-y: auto;  /* Scroll if too many results */
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 10001 !important; /* On top of everything */
        }
        
        /* 4. Suggestion Items */
        .leaflet-control-geosearch .results > div {
            padding: 10px 12px;
            font-size: 13px;
            color: #1f2937; /* Dark Grey */
            cursor: pointer;
            border-bottom: 1px solid #f3f3f3;
            background: white;
            text-align: left;
        }
        
        /* 5. Hover & Active States */
        .leaflet-control-geosearch .results > div:hover {
            background-color: #f3f4f6; 
            color: #000;
        }
        .leaflet-control-geosearch .results > .active {
            background-color: #e5e7eb;
        }

        /* 6. Map Cursors */
        .leaflet-container { cursor: ${readonly ? 'default' : 'grab'} !important; }
        .leaflet-container:active { cursor: ${readonly ? 'default' : 'grabbing'} !important; }
      `}</style>
    </div>
  );
}