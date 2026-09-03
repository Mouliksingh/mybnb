// High-Accuracy Client-Side Geolocation & Map Centering
function getUserLocation(callback) {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by your browser.");
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      console.log("Accurate user coordinates:", userCoords);
      if (callback) callback(userCoords);
    },
    (error) => {
      console.warn(`Geolocation error (${error.code}): ${error.message}`);
    },
    options
  );
}

// Example Mapbox / Leaflet Map Initialization
function initMap(coordinates, listingTitle) {
  if (typeof mapboxgl !== "undefined" && typeof mapToken !== "undefined") {
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates, // [lng, lat]
      zoom: 12,
    });

    new mapboxgl.Marker({ color: "#ff385c" })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h6>${listingTitle}</h6><p>Exact location provided after booking</p>`
        )
      )
      .addTo(map);
  }
}