const STORAGE_KEY = "catalogo_digital_items_v1";

const seedData = [
  {
    id: crypto.randomUUID(),
    marca: "Toyota",
    modelo: "Corolla",
    modeloOriginal: "Corolla XEI",
    anio: "2021",
    descripcion: "Sedán compacto",
    codigo: "TY-COR-001",
    descripcionEstandarizada: "TOYOTA COROLLA XEI 2021 SEDAN"
  },
  {
    id: crypto.randomUUID(),
    marca: "Toyota",
    modelo: "Hilux",
    modeloOriginal: "Hilux SRV",
    anio: "2020",
    descripcion: "Pickup 4x4",
    codigo: "TY-HLX-002",
    descripcionEstandarizada: "TOYOTA HILUX SRV 2020 PICKUP"
  },
  {
    id: crypto.randomUUID(),
    marca: "Honda",
    modelo: "Civic",
    modeloOriginal: "Civic Touring",
    anio: "2022",
    descripcion: "Sedán mediano",
    codigo: "HD-CVC-003",
    descripcionEstandarizada: "HONDA CIVIC TOURING 2022 SEDAN"
  }
];

const state = {
  items: loadItems(),
  selectedBrand: "all",
  selectedModel: "all",
  textSearch: "",
  editingId: null
};

const form = document.getElementById("catalogForm");
const tableBody = document.getElementById("catalogTable");
const rowTemplate = document.getElementById("rowTemplate");
const brandFilters = document.getElementById("brandFilters");
const modelFilters = document.getElementById("modelFilters");
const textSearch = document.getElementById("textSearch");
const counter = document.getElementById("counter");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");

form.addEventListener("submit", onSubmit);
cancelEditBtn.addEventListener("click", resetFormMode);
textSearch.addEventListener("input", (event) => {
  state.textSearch = event.target.value.toLowerCase().trim();
  render();
});

render();

function loadItems() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (!cached) return seedData;

  try {
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : seedData;
  } catch {
    return seedData;
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function onSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  const item = {
    marca: String(formData.get("marca")).trim(),
    modelo: String(formData.get("modelo")).trim(),
    modeloOriginal: String(formData.get("modeloOriginal")).trim(),
    anio: String(formData.get("anio")).trim(),
    descripcion: String(formData.get("descripcion")).trim(),
    codigo: String(formData.get("codigo")).trim(),
    descripcionEstandarizada: String(formData.get("descripcionEstandarizada")).trim()
  };

  if (Object.values(item).some((value) => value.length === 0)) return;

  if (state.editingId) {
    state.items = state.items.map((entry) =>
      entry.id === state.editingId ? { ...entry, ...item } : entry
    );
  } else {
    state.items.push({ id: crypto.randomUUID(), ...item });
  }

  saveItems();
  form.reset();
  resetFormMode();
  render();
}

function resetFormMode() {
  state.editingId = null;
  submitBtn.textContent = "Guardar item";
  formTitle.textContent = "Agregar nuevo item";
  cancelEditBtn.classList.add("hidden");
}

function beginEdit(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;

  state.editingId = itemId;
  Object.entries(item).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) input.value = value;
  });

  submitBtn.textContent = "Actualizar item";
  formTitle.textContent = "Editar item";
  cancelEditBtn.classList.remove("hidden");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function removeItem(itemId) {
  state.items = state.items.filter((item) => item.id !== itemId);
  if (state.editingId === itemId) {
    form.reset();
    resetFormMode();
  }
  saveItems();

  const currentBrands = getUniqueValues("marca");
  if (!currentBrands.includes(state.selectedBrand)) {
    state.selectedBrand = "all";
    state.selectedModel = "all";
  }

  const currentModels = getModelsByBrand(state.selectedBrand);
  if (!currentModels.includes(state.selectedModel)) {
    state.selectedModel = "all";
  }

  render();
}

function getUniqueValues(key) {
  return [...new Set(state.items.map((item) => item[key]))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function getModelsByBrand(brand) {
  const source = brand === "all" ? state.items : state.items.filter((item) => item.marca === brand);
  return [...new Set(source.map((item) => item.modelo))].sort((a, b) => a.localeCompare(b));
}

function applyFilters() {
  return state.items.filter((item) => {
    const brandMatch = state.selectedBrand === "all" || item.marca === state.selectedBrand;
    const modelMatch = state.selectedModel === "all" || item.modelo === state.selectedModel;
    const query = state.textSearch;
    const haystack = [
      item.marca,
      item.modelo,
      item.modeloOriginal,
      item.anio,
      item.descripcion,
      item.codigo,
      item.descripcionEstandarizada
    ]
      .join(" ")
      .toLowerCase();
    const textMatch = query.length === 0 || haystack.includes(query);
    return brandMatch && modelMatch && textMatch;
  });
}

function renderFilters() {
  const brands = getUniqueValues("marca");
  const models = getModelsByBrand(state.selectedBrand);

  brandFilters.replaceChildren(
    createFilterButton("Todas", "all", state.selectedBrand, (value) => {
      state.selectedBrand = value;
      state.selectedModel = "all";
      render();
    }),
    ...brands.map((brand) =>
      createFilterButton(brand, brand, state.selectedBrand, (value) => {
        state.selectedBrand = value;
        state.selectedModel = "all";
        render();
      })
    )
  );

  modelFilters.replaceChildren(
    createFilterButton("Todos", "all", state.selectedModel, (value) => {
      state.selectedModel = value;
      render();
    }),
    ...models.map((model) =>
      createFilterButton(model, model, state.selectedModel, (value) => {
        state.selectedModel = value;
        render();
      })
    )
  );
}

function createFilterButton(label, value, activeValue, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = `filter-btn ${value === activeValue ? "active" : ""}`;
  button.addEventListener("click", () => onClick(value));
  return button;
}

function renderTable() {
  const filteredItems = applyFilters();
  tableBody.replaceChildren();

  filteredItems.forEach((item) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelectorAll("[data-key]").forEach((cell) => {
      const key = cell.dataset.key;
      cell.textContent = item[key];
    });

    row.querySelector("[data-action='edit']").addEventListener("click", () => beginEdit(item.id));
    row.querySelector("[data-action='delete']").addEventListener("click", () => removeItem(item.id));
    tableBody.appendChild(row);
  });

  counter.textContent = `${filteredItems.length} de ${state.items.length} items`;

  if (filteredItems.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = '<td colspan="8">No hay resultados con esos filtros.</td>';
    tableBody.appendChild(emptyRow);
  }
}

function render() {
  renderFilters();
  renderTable();
}
