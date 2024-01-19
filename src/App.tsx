import { useEffect, useRef, useState } from "react";
import maplibre from "maplibre-gl";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://albertmaps.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYXNwZWNzcXBtZ2l0dHZkaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUxNzE5NTEsImV4cCI6MjAyMDc0Nzk1MX0.yvkgXVATqe79CSZnKPWWIN83pHM3-Q5buZJrao5BCsc");

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    getPlaces();
  }, []);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new maplibre.Map({
      container: mapContainer.current,
      style: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      center: [-118, 34],
      zoom: 9,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    places.forEach((place) => {
      new maplibre.Marker().setLngLat([place.lon, place.lat]).addTo(map.current);
    });
  }, [places]);

  async function getPlaces() {
    const { data } = await supabase.from("travel").select("place, lon, lat");
    setPlaces(data);
  }

  return <div ref={mapContainer} style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} />;
}

export default App;