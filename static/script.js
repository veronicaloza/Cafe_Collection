// static/script.js

// ... (imgWidth, imgHeight, anchorPx, etc. - all initial map setup code remains the same) ...
const imgWidth = 6583,
  imgHeight = 16838;
const anchorPx = [3048, 11835];
const anchorLatLng = [40.735863, -73.991084];
const totalLonSpan = 0.12,
  totalLatSpan = 0.182;

const degPerPxLon = totalLonSpan / imgWidth;
const degPerPxLat = totalLatSpan / imgHeight;
const [ax, ay] = anchorPx;
const [alat, alon] = anchorLatLng;
const latNorth = alat + ay * degPerPxLat;
const lonWest = alon - ax * degPerPxLon;
const latSouth = latNorth - totalLatSpan;
const lonEast = lonWest + totalLonSpan;
const imgBounds = L.latLngBounds(
  L.latLng(latSouth, lonWest),
  L.latLng(latNorth, lonEast),
);

const BASE_FONT_SIZE = 2;
let REFERENCE_ZOOM;

const map = L.map("map", {
  center: imgBounds.getCenter(),
  attributionControl: false,
  zoom: 12,
  minZoom: 14,
  maxZoom: 24,
  maxBounds: imgBounds.pad(0.05),
  maxBoundsViscosity: 1.0,
});

L.imageOverlay("static/map.svg", imgBounds).addTo(map);

map.createPane("svgLabels");
map.getPane("svgLabels").style.pointerEvents = "none";

L.svg({ pane: "svgLabels" }).addTo(map);
const svgMapRoot = map.getPanes().svgLabels.querySelector("svg");
const gSvgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
svgMapRoot.appendChild(gSvgGroup);

// Helper function to generate slugs (if needed for other parts of script.js)
// function generateCafeSlug(name) { ... } // Keep if used elsewhere in this file

fetch("static/cafes.json")
  .then((r) => r.json())
  .then((cafes) => {
    cafes.forEach((cafe, index) => { // We still iterate all cafes to put them on the map
      const point = map.latLngToLayerPoint([cafe.lat, cafe.lng]);
      const txt = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      txt.setAttribute("x", point.x);
      txt.setAttribute("y", point.y);
      txt.setAttribute("dy", "-0.6em");
      txt.setAttribute("text-anchor", "middle");
      txt.textContent = cafe.name;

      // Add data-cafe-name attribute for group selection
      txt.setAttribute("data-cafe-name", cafe.name);

      // Optional: keep unique instance ID if needed for other features
      // const cafeSlug = generateCafeSlug(cafe.name); // Assuming generateCafeSlug is defined
      // const uniqueMapId = `${cafeSlug}-${index}`;
      // txt.setAttribute("data-map-id", uniqueMapId);

      txt.classList.add(
        cafe.status === "OPERATIONAL" ? "cafe-ok" : "cafe-down",
      );
      txt.setAttribute("font-size", BASE_FONT_SIZE);
      gSvgGroup.appendChild(txt);
    });

    if (REFERENCE_ZOOM === undefined) {
      REFERENCE_ZOOM = map.getZoom();
    }

    function updateLabelPositions() {
      // This function might need adjustment if you were relying on the 'i' index
      // to directly map to the 'cafes' array and now want to update based on 'data-cafe-name'
      // For now, assuming 'cafes' array order matches the order of 'text' elements in gSvgGroup
      gSvgGroup.querySelectorAll("text").forEach((txt, i) => {
        if (cafes && cafes[i]) { // This assumes the order of text elements matches the cafes array
          const cafe = cafes[i];
          const pt = map.latLngToLayerPoint([cafe.lat, cafe.lng]);
          txt.setAttribute("x", pt.x);
          txt.setAttribute("y", pt.y);
        }
      });
    }

    function updateLabelStyles() {
      if (typeof REFERENCE_ZOOM === "undefined") {
        console.warn("REFERENCE_ZOOM for label scaling is not set.");
        return;
      }
      const currentZoom = map.getZoom();
      const scale = map.getZoomScale(currentZoom, REFERENCE_ZOOM);
      gSvgGroup.querySelectorAll("text").forEach((txt) => {
        const newFontSize = BASE_FONT_SIZE * scale;
        txt.setAttribute("font-size", newFontSize);
      });
    }

    updateLabelPositions();
    updateLabelStyles();

    map.on("zoomend viewreset", () => {
      updateLabelPositions();
      updateLabelStyles();
    });
    map.on("moveend", updateLabelPositions);
  })
  .catch(console.error);

// MODIFIED: Function to be called by checkbox event listeners
// It now accepts cafeName instead of mapId
window.updateCafeHighlightOnMap = function (cafeName, isChecked) {
  if (!gSvgGroup) {
    console.error(
      "SVG group 'gSvgGroup' not found for updating cafe highlight.",
    );
    return;
  }

  // Find all text elements with the matching data-cafe-name
  // Note: If cafeName can contain quotes, this selector might need escaping.
  // A more robust way is to iterate and check dataset.cafeName.
  const cafeTextElements = gSvgGroup.querySelectorAll(
    `text[data-cafe-name="${cafeName.replace(/"/g, '\\"')}"]`, // Basic escaping for double quotes
  );


  if (cafeTextElements.length > 0) {
    cafeTextElements.forEach(textElement => {
      if (isChecked) {
        textElement.classList.add("cafe-selected-highlight");
        // If you changed to red, ensure the class name matches your CSS
        // textElement.classList.add("cafe-selected-red");
      } else {
        textElement.classList.remove("cafe-selected-highlight");
        // textElement.classList.remove("cafe-selected-red");
      }
    });
  } else {
    console.warn(`No cafe text elements found on map for name: "${cafeName}"`);
  }
};

// ... rest of your map script (userIcon, userMarker, geolocation, etc.) ...
const userIcon = L.icon({
  iconUrl: "static/media/bagel-sticker.png",
  iconSize: [60, 60],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const userMarker = L.marker([0, 0], { icon: userIcon }).addTo(map);

function onInitialPosition(pos) {
  const ll = [pos.coords.latitude, pos.coords.longitude];
  if (imgBounds.contains(ll)) {
    map.setView(ll, 17);
    userMarker.setLatLng(ll);
  } else {
    map.fitBounds(imgBounds);
  }
  navigator.geolocation.watchPosition(onUpdatePosition, onPosError, {
    enableHighAccuracy: true,
    maximumAge: 1000,
    timeout: 5000,
  });
}

function onUpdatePosition(pos) {
  const ll = [pos.coords.latitude, pos.coords.longitude];
  if (imgBounds.contains(ll)) {
    userMarker.setLatLng(ll);
    map.panTo(ll);
  }
}

function onPosError(err) {
  console.error("Geolocation error:", err);
  map.fitBounds(imgBounds);
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(onInitialPosition, onPosError, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000,
  });
} else {
  alert("Geolocation not supported, showing full map.");
  map.fitBounds(imgBounds);
}
