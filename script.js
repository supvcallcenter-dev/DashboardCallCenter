const STORAGE_KEY = "catalogo_web_v2";

const seedData = [
  { id: crypto.randomUUID(), marca: "Toyota", modelo: "Corolla", modeloOriginal: "Corolla XEI", anio: "2021", descripcion: "Sedán compacto", codigo: "TY-COR-001", descripcionEstandarizada: "TOYOTA COROLLA XEI 2021 SEDAN" },
  { id: crypto.randomUUID(), marca: "Toyota", modelo: "Hilux", modeloOriginal: "Hilux SRV", anio: "2020", descripcion: "Pickup 4x4", codigo: "TY-HLX-002", descripcionEstandarizada: "TOYOTA HILUX SRV 2020 PICKUP" },
  { id: crypto.randomUUID(), marca: "Honda", modelo: "Civic", modeloOriginal: "Civic Touring", anio: "2022", descripcion: "Sedán mediano", codigo: "HN-CVC-003", descripcionEstandarizada: "HONDA CIVIC TOURING 2022 SEDAN" }
];

const state = {
  items: loadItems(),
  selectedBrand: "all",
  selectedModel: "all",
  textQuery: "",
  editingId: null
};

const form = document.getElementById("catalogForm");
const rowTemplate = document.getElementById("rowTemplate");
const tableBody = document.getElementById("catalogTable");
const brandFilters = document.getElementById("brandFilters");
const modelFilters = document.getElementById("modelFilters");
const textSearch = document.getElementById("textSearch");
const counter = document.getElementById("counter");
const totalItems = document.getElementById("totalItems");
const totalBrands = document.getElementById("totalBrands");
const totalModels = document.getElementById("totalModels");
const modal = document.getElementById("itemModal");
const openCreateModalBtn = document.getElementById("openCreateModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitle = document.getElementById("formTitle");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

openCreateModalBtn.addEventListener("click", () => openModalForCreate());
closeModalBtn.addEventListener("click", () => modal.close());
cancelEditBtn.addEventListener("click", () => resetFormMode(true));
textSearch.addEventListener("input", (event) => {
  state.textQuery = event.target.value.toLowerCase().trim();
  render();
});
form.addEventListener("submit", handleSubmit);
exportBtn.addEventListener("click", exportData);
importFile.addEventListener("change", importData);

render();

function loadItems() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return seedData;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? parsed : seedData;
  } catch {
    return seedData;
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function sanitizeValue(value) {
  return String(value ?? "").trim();
}

function extractFormData() {
  const data = new FormData(form);
  const payload = {
    marca: sanitizeValue(data.get("marca")),
    modelo: sanitizeValue(data.get("modelo")),
    modeloOriginal: sanitizeValue(data.get("modeloOriginal")),
    anio: sanitizeValue(data.get("anio")),
    descripcion: sanitizeValue(data.get("descripcion")),
    codigo: sanitizeValue(data.get("codigo")),
    descripcionEstandarizada: sanitizeValue(data.get("descripcionEstandarizada"))
  };
  return Object.values(payload).every(Boolean) ? payload : null;
}

function handleSubmit(event) {
  event.preventDefault();
  const payload = extractFormData();
  if (!payload) return;

  if (state.editingId) {
    state.items = state.items.map((item) => item.id === state.editingId ? { ...item, ...payload } : item);
  } else {
    state.items.push({ id: crypto.randomUUID(), ...payload });
  }

  saveItems();
  resetFormMode();
  modal.close();
  render();
}

function openModalForCreate() {
  resetFormMode();
  modal.showModal();
}

function beginEdit(id) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;

  state.editingId = id;
  Object.entries(item).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) input.value = value;
  });

  formTitle.textContent = "Editar ítem";
  submitBtn.textContent = "Actualizar";
  cancelEditBtn.classList.remove("hidden");
  modal.showModal();
}

function removeItem(id) {
  state.items = state.items.filter((item) => item.id !== id);
  saveItems();

  const brands = uniqueByKey("marca");
  if (!brands.includes(state.selectedBrand)) {
    state.selectedBrand = "all";
    state.selectedModel = "all";
  }

  const models = modelsByBrand(state.selectedBrand);
  if (!models.includes(state.selectedModel)) {
    state.selectedModel = "all";
  }

  render();
}

function resetFormMode(keepOpen = false) {
  state.editingId = null;
  form.reset();
  formTitle.textContent = "Nuevo ítem";
  submitBtn.textContent = "Guardar";
  cancelEditBtn.classList.add("hidden");
  if (keepOpen) modal.showModal();
}

function uniqueByKey(key) {
  return [...new Set(state.items.map((item) => item[key]))].sort((a, b) => a.localeCompare(b));
}

function modelsByBrand(brand) {
  const source = brand === "all" ? state.items : state.items.filter((item) => item.marca === brand);
  return [...new Set(source.map((item) => item.modelo))].sort((a, b) => a.localeCompare(b));
}

function createFilterButton(label, value, activeValue, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = `filter-btn ${value === activeValue ? "active" : ""}`;
  button.addEventListener("click", () => onClick(value));
  return button;
}

function renderFilters() {
  const brands = uniqueByKey("marca");
  const models = modelsByBrand(state.selectedBrand);

  brandFilters.replaceChildren(
    createFilterButton("Todas", "all", state.selectedBrand, (brand) => {
      state.selectedBrand = brand;
      state.selectedModel = "all";
      render();
    }),
    ...brands.map((brand) => createFilterButton(brand, brand, state.selectedBrand, (value) => {
      state.selectedBrand = value;
      state.selectedModel = "all";
      render();
    }))
  );

  modelFilters.replaceChildren(
    createFilterButton("Todos", "all", state.selectedModel, (model) => {
      state.selectedModel = model;
      render();
    }),
    ...models.map((model) => createFilterButton(model, model, state.selectedModel, (value) => {
      state.selectedModel = value;
      render();
    }))
  );
}

function filteredItems() {
  return state.items.filter((item) => {
    const brandMatch = state.selectedBrand === "all" || item.marca === state.selectedBrand;
    const modelMatch = state.selectedModel === "all" || item.modelo === state.selectedModel;
    const haystack = Object.values(item).join(" ").toLowerCase();
    const textMatch = !state.textQuery || haystack.includes(state.textQuery);
    return brandMatch && modelMatch && textMatch;
  });
}

function renderMetrics() {
  totalItems.textContent = String(state.items.length);
  totalBrands.textContent = String(uniqueByKey("marca").length);
  totalModels.textContent = String(uniqueByKey("modelo").length);
}

function renderTable() {
  const items = filteredItems();
  tableBody.replaceChildren();

  if (items.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="8">No se encontraron resultados con los filtros actuales.</td>';
    tableBody.appendChild(tr);
  }

  for (const item of items) {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);

    row.querySelectorAll("[data-key]").forEach((cell) => {
      const key = cell.dataset.key;
      cell.textContent = item[key];
    });

    row.querySelector("[data-action='edit']").addEventListener("click", () => beginEdit(item.id));
    row.querySelector("[data-action='delete']").addEventListener("click", () => removeItem(item.id));
    tableBody.appendChild(row);
  }

  counter.textContent = `${items.length} de ${state.items.length} registros`;
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.items, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "catalogo-digital.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return;

    state.items = parsed
      .map((item) => ({
        id: sanitizeValue(item.id) || crypto.randomUUID(),
        marca: sanitizeValue(item.marca),
        modelo: sanitizeValue(item.modelo),
        modeloOriginal: sanitizeValue(item.modeloOriginal),
        anio: sanitizeValue(item.anio),
        descripcion: sanitizeValue(item.descripcion),
        codigo: sanitizeValue(item.codigo),
        descripcionEstandarizada: sanitizeValue(item.descripcionEstandarizada)
      }))
      .filter((item) => Object.values(item).every(Boolean));

    saveItems();
    state.selectedBrand = "all";
    state.selectedModel = "all";
    state.textQuery = "";
    textSearch.value = "";
    render();
  } catch {
    // keep silent for invalid files
  } finally {
    event.target.value = "";
  }
}

function render() {
  renderFilters();
  renderMetrics();
  renderTable();
}
