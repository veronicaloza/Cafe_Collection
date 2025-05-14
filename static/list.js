// static/list.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cafe-list-container");
  const searchInput = document.getElementById("cafe-search");
  const statusFilter = document.getElementById("status-filter");

  let cafeNames = [];           // the master list of names
  const checkedSet = new Set(); // tracks which are checked

  function slugify(name) {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
  }

  // build one checkbox+label wrapper for a given cafe name
  function makeItem(name) {
    const wrap = document.createElement("div");
    wrap.className = "cafe-item";

    const id = `cafe-${slugify(name)}`;
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = id;
    cb.value = name;
    cb.checked = checkedSet.has(name);

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = name;

    cb.addEventListener("change", () => {
      if (cb.checked) checkedSet.add(name);
      else checkedSet.delete(name);
      updateDisplay(); // re-render filtered list
      // optional map hook:
      if (window.updateCafeHighlightOnMap) {
        window.updateCafeHighlightOnMap(name, cb.checked);
      }
    });

    wrap.append(cb, label);
    return wrap;
  }

  // filter by text AND by status, then render into the single container
  function updateDisplay() {
    const q = searchInput.value.trim().toLowerCase();
    const mode = statusFilter.value; // "all" | "checked" | "unchecked"

    let filtered = cafeNames.filter(name =>
      name.toLowerCase().includes(q)
    );

    if (mode === "checked") {
      filtered = filtered.filter(name => checkedSet.has(name));
    } else if (mode === "unchecked") {
      filtered = filtered.filter(name => !checkedSet.has(name));
    }

    container.innerHTML = "";
    filtered.forEach(name =>
      container.appendChild(makeItem(name))
    );
  }

  // fetch JSON → build master list → initial render
  fetch("static/cafes.json")
    .then(r => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(cafes => {
      cafeNames = Array.from(new Set(cafes.map(c => c.name)))
        .sort((a, b) => a.localeCompare(b));
      updateDisplay();
    })
    .catch(err => {
      console.error(err);
      container.textContent = "Failed to load cafés.";
    });

  // re-run when the user types or changes the filter
  searchInput.addEventListener("input", updateDisplay);
  statusFilter.addEventListener("change", updateDisplay);
});
