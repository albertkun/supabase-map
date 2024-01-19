import { useEffect, useRef, useState } from "react";
import maplibre from "maplibre-gl";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://baaspecsqpmgittvdian.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYXNwZWNzcXBtZ2l0dHZkaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUxNzE5NTEsImV4cCI6MjAyMDc0Nzk1MX0.yvkgXVATqe79CSZnKPWWIN83pHM3-Q5buZJrao5BCsc");

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

    // Add geolocation control to the map
    map.current.addControl(new maplibre.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));
  }, []);
  useEffect(() => {
    if (!map.current || !places) return; // wait for map to initialize and places to be fetched
    places.forEach((place) => {
      const stars = '★'.repeat(place.walkable) + '☆'.repeat(5 - place.walkable);

      const popup = new maplibre.Popup({ offset: 25 }).setHTML(
        `<h3>${place.place.charAt(0).toUpperCase() + place.place.slice(1)} </h3> 
        Walkability: ${stars} <br/>
        <a href="https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}" target="_blank" rel="noopener noreferrer">More info on Google Maps</a> <br/>
        <button id="get-directions-${place.place}">Get Directions</button>`
      );

      // Add the marker with the popup
      const marker = new maplibre.Marker()
        .setLngLat([place.lon, place.lat])
        .setPopup(popup) // sets a popup on this marker
        .addTo(map.current);

      marker.getElement().addEventListener('click', () => {
        setTimeout(() => {
          const button = document.getElementById(`get-directions-${place.place}`);
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${place.lat},${place.lon}`, '_blank');
              });
            });
          }
        }, 0);
      });
    });
  }, [places]);
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new maplibre.Map({
      container: mapContainer.current,
      style: "https://wms.wheregroup.com/tileserver/style/osm-bright.json",
      center: [-118, 34],
      zoom: 9,
    });

    // Add geolocation control to the map
    map.current.addControl(new maplibre.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    // Add a marker for LAX
    new maplibre.Marker()
      .setLngLat([33.9416, -118.4085])
      .setPopup(new maplibre.Popup({ offset: 25 }).setText('LAX'))
      .addTo(map.current);
  }, []);

  async function getPlaces() {
    const { data, error } = await supabase.from("travel").select("place, walkable, lon, lat");
    if (error) {
      console.error("Error fetching places:", error);
      return;
    }
    setPlaces(data);
  }

  return <div ref={mapContainer} style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }} />;
}

export default App;