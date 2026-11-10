const STORAGE_KEYS = {
  tires: "tire-receiving.tires.v1",
  records: "tire-receiving.records.v1",
};

const COLOR_LABELS = { blue: "Blue", orange: "Orange" };
const STATUS_LABELS = { complete: "완료", in_progress: "검수 중", pending: "Pending", partial: "부분 입고" };
const STRIPE_COLORS = ["", "red", "yellow", "green", "white", "blue", "orange", "purple"];
const STRIPE_LABELS = { "": "없음", red: "빨강", yellow: "노랑", green: "초록", white: "흰색", blue: "파랑", orange: "주황", purple: "보라" };
const DEFAULT_STRIPES = {
  "myp-19": ["red", "red", "", ""],
  "bridgestone-20": ["yellow", "", "", ""],
};

const SEED_TIRES = [
  {
    id: "myp-19",
    name: 'MYP 19"',
    aliases: ["MY P", "MYP"],
    expectedQty: 975,
    stripeColors: ["red", "red", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 25 }, orange: { qtyPerRack: 20 } },
  },
  {
    id: "bridgestone-20",
    name: 'Bridgestone 20"',
    aliases: ["브리지스톤", "브릿지스톤"],
    expectedQty: 966,
    stripeColors: ["yellow", "", "", ""],
    defaultColor: "orange",
    presets: { blue: { qtyPerRack: 25 }, orange: { qtyPerRack: 20 } },
  },
  {
    id: "e80-hk-front-20",
    name: 'E80 HK Front 20"',
    aliases: ["한국 프런트", "한국 front", "HK F"],
    expectedQty: 756,
    stripeColors: ["", "", "", ""],
    defaultColor: "orange",
    presets: { orange: { qtyPerRack: 20 } },
  },
  {
    id: "e80-hk-rear-20",
    name: 'E80 HK Rear 20"',
    aliases: ["한국 레어", "한국 rear", "HK R"],
    expectedQty: 756,
    stripeColors: ["", "", "", ""],
    defaultColor: "orange",
    presets: { orange: { qtyPerRack: 16 } },
  },
  {
    id: "hk-performance-front-21",
    name: 'HK Performance Front 21"',
    aliases: ["HK Perf Front", "퍼포먼스 프런트"],
    expectedQty: 500,
    stripeColors: ["", "", "", ""],
    defaultColor: "orange",
    presets: { orange: { qtyPerRack: 20 } },
  },
  {
    id: "hk-performance-rear-21",
    name: 'HK Performance Rear 21"',
    aliases: ["HK Perf Rear", "퍼포먼스 레어"],
    expectedQty: 500,
    stripeColors: ["", "", "", ""],
    defaultColor: "orange",
    presets: { orange: { qtyPerRack: 16 } },
  },
  {
    id: "ct-p-20",
    name: 'CT P 20"',
    aliases: ["CTP", "CT P"],
    expectedQty: 420,
    stripeColors: ["", "", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 20 } },
  },
  {
    id: "e80-continental-front-19",
    name: 'E80 Continental Front 19"',
    aliases: ["E80 Conti Front", "콘티 프런트"],
    expectedQty: 400,
    stripeColors: ["", "", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 25 }, orange: { qtyPerRack: 20 } },
  },
  {
    id: "e80-continental-rear-19",
    name: 'E80 Continental Rear 19"',
    aliases: ["E80 Conti Rear", "콘티 레어"],
    expectedQty: 400,
    stripeColors: ["", "", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 25 }, orange: { qtyPerRack: 16 } },
  },
  {
    id: "goodyear-18",
    name: 'Goodyear 18"',
    aliases: ["GY 18", "굿이어 18"],
    expectedQty: 270,
    stripeColors: ["", "", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 16 } },
  },
  {
    id: "goodyear-20",
    name: 'Goodyear 20"',
    aliases: ["GY 20", "굿이어 20"],
    expectedQty: 595,
    stripeColors: ["", "", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 20 } },
  },
  {
    id: "e41-18-hk",
    name: 'E41 18" HK',
    aliases: ["E41", "E41 HK"],
    expectedQty: 900,
    stripeColors: ["", "", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 25 } },
  },
  {
    id: "w68-front-18-rt",
    name: 'W68 Front 18" RT',
    aliases: ["W68 Front", "W68 프런트"],
    expectedQty: 352,
    stripeColors: ["", "", "", ""],
    defaultColor: "orange",
    presets: { blue: { qtyPerRack: 20 }, orange: { qtyPerRack: 16 } },
  },
  {
    id: "w68-rear-18-rt",
    name: 'W68 Rear 18" RT',
    aliases: ["W68 Rear", "W68 레어"],
    expectedQty: 352,
    stripeColors: ["", "", "", ""],
    defaultColor: "blue",
    presets: { blue: { qtyPerRack: 20 } },
  },
];

let tires = loadJson(STORAGE_KEYS.tires, null);
let records = loadJson(STORAGE_KEYS.records, []);
let currentRecordFilter = "all";
let activeRecordId = null;
let editingRecordId = null;
let lastFocusedElement = null;
let toastTimer = null;
let toastReady = false;
let storageWarningPending = false;
let inspection = createEmptyInspection();

if (tires === null) {
  tires = structuredCloneSafe(SEED_TIRES);
  persistTires();
}
if (!Array.isArray(tires)) {
  tires = structuredCloneSafe(SEED_TIRES);
  persistTires();
}
if (!Array.isArray(records)) {
  records = [];
  persistRecords();
}
const tiresWithStripes = tires.map(withNormalizedStripes);
if (JSON.stringify(tiresWithStripes) !== JSON.stringify(tires)) {
  tires = tiresWithStripes;
  persistTires();
}

const elements = {
  appMain: document.querySelector("#appMain"),
  todayLabel: document.querySelector("#todayLabel"),
  todayCompleteCount: document.querySelector("#todayCompleteCount"),
  todayAttentionCount: document.querySelector("#todayAttentionCount"),
  todayActualTotal: document.querySelector("#todayActualTotal"),
  recentRecords: document.querySelector("#recentRecords"),
  allRecords: document.querySelector("#allRecords"),
  recordSearch: document.querySelector("#recordSearch"),
  tireSearch: document.querySelector("#tireSearch"),
  tireMasterList: document.querySelector("#tireMasterList"),
  sheetBackdrop: document.querySelector("#sheetBackdrop"),
  inspectionSheet: document.querySelector("#inspectionSheet"),
  inspectionTitle: document.querySelector("#inspectionTitle"),
  inspectionStepLabel: document.querySelector("#inspectionStepLabel"),
  inspectionBackButton: document.querySelector("#inspectionBackButton"),
  tireSelectionStep: document.querySelector("#tireSelectionStep"),
  inspectionForm: document.querySelector("#inspectionForm"),
  inspectionTireSearch: document.querySelector("#inspectionTireSearch"),
  inspectionTireList: document.querySelector("#inspectionTireList"),
  selectedTireName: document.querySelector("#selectedTireName"),
  bluePresetCaption: document.querySelector("#bluePresetCaption"),
  orangePresetCaption: document.querySelector("#orangePresetCaption"),
  formulaExpression: document.querySelector("#formulaExpression"),
  expectedTotalDisplay: document.querySelector("#expectedTotalDisplay"),
  qtyPerRackInput: document.querySelector("#qtyPerRackInput"),
  groupCountInput: document.querySelector("#groupCountInput"),
  extraQtyInput: document.querySelector("#extraQtyInput"),
  directTotalInput: document.querySelector("#directTotalInput"),
  actualTotalDisplay: document.querySelector("#actualTotalDisplay"),
  differenceDisplay: document.querySelector("#differenceDisplay"),
  resultStrip: document.querySelector("#resultStrip"),
  countEditPanel: document.querySelector("#countEditPanel"),
  missingPresetNotice: document.querySelector("#missingPresetNotice"),
  savePresetOption: document.querySelector("#savePresetOption"),
  savePresetCheckbox: document.querySelector("#savePresetCheckbox"),
  inspectionDateInput: document.querySelector("#inspectionDateInput"),
  statusInput: document.querySelector("#statusInput"),
  dockInput: document.querySelector("#dockInput"),
  trailerInput: document.querySelector("#trailerInput"),
  partialFields: document.querySelector("#partialFields"),
  receivedQtyInput: document.querySelector("#receivedQtyInput"),
  remainingQtyDisplay: document.querySelector("#remainingQtyDisplay"),
  noteInput: document.querySelector("#noteInput"),
  confirmExpectedQty: document.querySelector("#confirmExpectedQty"),
  saveAdjustedButton: document.querySelector("#saveAdjustedButton"),
  masterSheet: document.querySelector("#masterSheet"),
  masterForm: document.querySelector("#masterForm"),
  masterSheetTitle: document.querySelector("#masterSheetTitle"),
  masterTireId: document.querySelector("#masterTireId"),
  masterNameInput: document.querySelector("#masterNameInput"),
  masterAliasesInput: document.querySelector("#masterAliasesInput"),
  masterExpectedInput: document.querySelector("#masterExpectedInput"),
  masterStripePreview: document.querySelector("#masterStripePreview"),
  masterStripeControls: document.querySelector("#masterStripeControls"),
  masterBlueEnabled: document.querySelector("#masterBlueEnabled"),
  masterBlueQty: document.querySelector("#masterBlueQty"),
  masterBlueFormula: document.querySelector("#masterBlueFormula"),
  masterOrangeEnabled: document.querySelector("#masterOrangeEnabled"),
  masterOrangeQty: document.querySelector("#masterOrangeQty"),
  masterOrangeFormula: document.querySelector("#masterOrangeFormula"),
  masterDefaultColor: document.querySelector("#masterDefaultColor"),
  deleteTireButton: document.querySelector("#deleteTireButton"),
  recordSheet: document.querySelector("#recordSheet"),
  recordDetailBody: document.querySelector("#recordDetailBody"),
  dataSheet: document.querySelector("#dataSheet"),
  importDataButton: document.querySelector("#importDataButton"),
  importDataInput: document.querySelector("#importDataInput"),
  connectionDot: document.querySelector("#connectionDot"),
  connectionLabel: document.querySelector("#connectionLabel"),
  toast: document.querySelector("#toast"),
};

toastReady = true;
initialize();
if (storageWarningPending) showToast("기기 저장 공간이 부족합니다. 데이터를 백업해주세요.");

function initialize() {
  bindEvents();
  elements.inspectionDateInput.value = todayIso();
  renderAll();
  updateConnectionStatus();

  if ("serviceWorker" in navigator && !window.TireNative) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.nav));
  });
  document.querySelectorAll("[data-go-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.goView));
  });
  document.querySelectorAll("[data-start-check]").forEach((button) => button.addEventListener("click", startInspection));
  document.querySelector("#startCheckButton").addEventListener("click", startInspection);
  document.querySelector("#addTireButton").addEventListener("click", () => openMasterEditor());
  document.querySelector("#dataMenuButton").addEventListener("click", () => openSheet(elements.dataSheet));

  document.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", () => closeSheets()));
  elements.sheetBackdrop.addEventListener("click", () => closeSheets());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.sheetBackdrop.hidden) closeSheets();
    if (event.key === "Tab" && !elements.sheetBackdrop.hidden) trapSheetFocus(event);
  });

  elements.recordSearch.addEventListener("input", renderRecords);
  elements.tireSearch.addEventListener("input", renderTireMaster);
  elements.inspectionTireSearch.addEventListener("input", renderInspectionTireList);

  document.querySelector("#recordFilters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    currentRecordFilter = button.dataset.filter;
    document.querySelectorAll("#recordFilters [data-filter]").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderRecords();
  });

  elements.inspectionTireList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-tire]");
    if (button) selectInspectionTire(button.dataset.selectTire);
  });
  document.querySelector("#changeTireButton").addEventListener("click", showTireSelection);
  elements.inspectionBackButton.addEventListener("click", showTireSelection);

  document.querySelectorAll("[data-rack-color]").forEach((button) => {
    button.addEventListener("click", () => selectRackColor(button.dataset.rackColor));
  });
  document.querySelector("#toggleEditButton").addEventListener("click", toggleCountEditor);
  document.querySelectorAll("[data-step-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.stepTarget}`);
      input.value = Math.max(0, numberValue(input.value) + Number(button.dataset.step));
      elements.directTotalInput.value = "";
      syncInspectionFromInputs();
    });
  });
  elements.qtyPerRackInput.addEventListener("change", () => {
    inspection.qtyPerRack = Math.max(0, numberValue(elements.qtyPerRackInput.value));
    const derived = deriveFormula(inspection.expectedQty, inspection.qtyPerRack);
    inspection.groupCount = derived.groups;
    inspection.extraQty = derived.extra;
    elements.groupCountInput.value = inspection.groupCount;
    elements.extraQtyInput.value = inspection.extraQty;
    elements.directTotalInput.value = "";
    inspection.directTotal = null;
    updateInspectionCalculation();
  });
  [elements.groupCountInput, elements.extraQtyInput].forEach((input) => {
    input.addEventListener("input", () => {
      elements.directTotalInput.value = "";
      syncInspectionFromInputs();
    });
  });
  elements.directTotalInput.addEventListener("input", syncInspectionFromInputs);
  elements.statusInput.addEventListener("change", () => {
    updatePartialFields();
    updateInspectionActionButtons();
  });
  elements.receivedQtyInput.addEventListener("input", updatePartialFields);

  document.querySelector("#confirmExpectedButton").addEventListener("click", () => saveInspection(true));
  elements.inspectionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveInspection(false);
  });

  elements.tireMasterList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-tire]");
    if (button) openMasterEditor(button.dataset.editTire);
  });
  [elements.masterExpectedInput, elements.masterBlueQty, elements.masterOrangeQty].forEach((input) => input.addEventListener("input", updateMasterFormulaPreview));
  [elements.masterBlueEnabled, elements.masterOrangeEnabled].forEach((input) => input.addEventListener("change", updateMasterPresetControls));
  elements.masterStripeControls.addEventListener("change", updateMasterStripePreview);
  elements.masterForm.addEventListener("submit", saveMasterTire);
  elements.deleteTireButton.addEventListener("click", deleteMasterTire);

  elements.recentRecords.addEventListener("click", openRecordFromEvent);
  elements.allRecords.addEventListener("click", openRecordFromEvent);
  elements.recordDetailBody.addEventListener("click", handleRecordDetailAction);

  document.querySelector("#exportDataButton").addEventListener("click", exportData);
  elements.importDataButton.addEventListener("click", (event) => {
    if (!window.TireNative?.importFile) return;
    event.preventDefault();
    window.TireNative.importFile();
  });
  elements.importDataInput.addEventListener("change", importData);
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
}

function renderAll() {
  renderToday();
  renderRecords();
  renderTireMaster();
}

function setView(viewName) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("is-active", view.dataset.view === viewName));
  document.querySelectorAll("[data-nav]").forEach((button) => {
    const selected = button.dataset.nav === viewName;
    button.classList.toggle("is-active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  elements.appMain.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderToday() {
  const now = new Date();
  elements.todayLabel.textContent = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  const todayRecords = records.filter((record) => record.date === todayIso());
  elements.todayCompleteCount.textContent = formatNumber(todayRecords.filter((record) => record.status === "complete").length);
  elements.todayAttentionCount.textContent = formatNumber(todayRecords.filter((record) => record.status !== "complete" || record.difference !== 0).length);
  elements.todayActualTotal.textContent = compactNumber(todayRecords.reduce((sum, record) => sum + numberValue(record.actualQty), 0));

  const recent = [...records].sort(sortRecordsNewest).slice(0, 5);
  elements.recentRecords.innerHTML = recent.length ? recent.map(recordCardTemplate).join("") : emptyStateTemplate("아직 검수 기록이 없습니다", "새 검수 시작을 눌러 첫 기록을 만들어보세요.");
}

function renderRecords() {
  const query = normalize(elements.recordSearch.value);
  const filtered = [...records]
    .filter((record) => {
      if (currentRecordFilter === "complete" && record.status !== "complete") return false;
      if (currentRecordFilter === "attention" && record.difference === 0) return false;
      if (currentRecordFilter === "pending" && record.status !== "pending") return false;
      if (currentRecordFilter === "partial" && record.status !== "partial") return false;
      if (!query) return true;
      return normalize([record.tireName, record.dock, record.trailer, record.note].join(" ")).includes(query);
    })
    .sort(sortRecordsNewest);

  elements.allRecords.innerHTML = filtered.length ? filtered.map(recordCardTemplate).join("") : emptyStateTemplate("조건에 맞는 기록이 없습니다", "검색어나 필터를 바꿔보세요.");
}

function renderTireMaster() {
  const query = normalize(elements.tireSearch.value);
  const filtered = tires.filter((tire) => normalize([tire.name, ...(tire.aliases || [])].join(" ")).includes(query));
  elements.tireMasterList.innerHTML = filtered.length
    ? filtered.map(tireMasterTemplate).join("")
    : emptyStateTemplate("타이어를 찾지 못했습니다", "검색어를 바꾸거나 새 타이어를 추가하세요.");
}

function recordCardTemplate(record) {
  const meta = [formatShortDate(record.date), record.dock ? `Dock ${record.dock}` : "", record.trailer || ""].filter(Boolean).join(" · ");
  const status = record.status === "complete"
    ? `<span class="delta-badge ${record.difference === 0 ? "is-zero" : "is-different"}">${record.difference === 0 ? "일치" : signedNumber(record.difference)}</span>`
    : `<span class="status-badge ${escapeHtml(record.status)}">${escapeHtml(STATUS_LABELS[record.status] || record.status)}</span>`;
  return `
    <button class="record-card" type="button" data-record-id="${escapeHtml(record.id)}" data-color="${escapeHtml(record.rackColor)}">
      <span class="record-accent"></span>
      <span class="record-main">
        <strong>${escapeHtml(record.tireName)}</strong>
        <span class="record-meta">${escapeHtml(meta || "입고 정보 없음")} · ${escapeHtml(COLOR_LABELS[record.rackColor])} ${formatNumber(record.qtyPerRack)}/Rack</span>
        <span class="record-formula">${escapeHtml(record.formula)}</span>
      </span>
      <span class="record-total"><strong>${formatNumber(record.actualQty)}</strong><small>EA</small>${status}</span>
    </button>`;
}

function tireMasterTemplate(tire) {
  const presetRows = ["blue", "orange"]
    .filter((color) => tire.presets?.[color])
    .map((color) => {
      const qty = tire.presets[color].qtyPerRack;
      const formula = deriveFormula(tire.expectedQty, qty);
      return `
        <div class="preset-row" data-color="${color}">
          <span class="preset-color-label"><span class="rack-swatch"></span>${COLOR_LABELS[color]}</span>
          <span class="preset-formula">${escapeHtml(formulaText(qty, formula.groups, formula.extra, tire.expectedQty))}</span>
          <span class="preset-qty">${formatNumber(qty)}/Rack</span>
        </div>`;
    }).join("");

  return `
    <article class="tire-master-card">
      <div class="tire-master-top">
        <div class="tire-master-identity">${tireStripeIcon(tire)}<div><h3>${escapeHtml(tire.name)}</h3><p>기본 예상 ${formatNumber(tire.expectedQty)} EA${tire.aliases?.length ? ` · ${escapeHtml(tire.aliases.join(", "))}` : ""}</p></div></div>
        <button class="edit-round-button" type="button" data-edit-tire="${escapeHtml(tire.id)}" aria-label="${escapeHtml(tire.name)} 수정">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16-.7 4 4-.7L18 8.6 14.4 5Z" /><path d="m12.8 6.6 3.6 3.6" /></svg>
        </button>
      </div>
      ${presetRows || '<p class="record-meta">등록된 랙 프리셋이 없습니다.</p>'}
    </article>`;
}

function normalizeStripeColors(value, tireId = "") {
  const fallback = DEFAULT_STRIPES[tireId] || ["", "", "", ""];
  if (!Array.isArray(value)) return [...fallback];
  return Array.from({ length: 4 }, (_, index) => STRIPE_COLORS.includes(value[index]) ? value[index] : "");
}

function withNormalizedStripes(tire) {
  return { ...tire, stripeColors: normalizeStripeColors(tire.stripeColors, tire.id) };
}

function tireStripeIcon(tire, extraClass = "") {
  const colors = normalizeStripeColors(tire?.stripeColors, tire?.id);
  const painted = colors.filter(Boolean);
  const label = painted.length
    ? `타이어 무늬, 위에서부터 ${colors.map((color) => STRIPE_LABELS[color]).join(", ")}`
    : "타이어 무늬 미설정";
  const lines = colors.map((color) => `<span class="tire-stripe-line stripe-${color || "none"}"></span>`).join("");
  return `<span class="tire-stripe-icon ${escapeHtml(extraClass)}" role="img" aria-label="${escapeHtml(label)}">${lines}</span>`;
}

function renderMasterStripeControls(colors) {
  const normalized = normalizeStripeColors(colors);
  elements.masterStripeControls.innerHTML = normalized.map((selected, index) => {
    const options = STRIPE_COLORS.map((color) => `<option value="${color}" ${color === selected ? "selected" : ""}>${STRIPE_LABELS[color]}</option>`).join("");
    return `<label><span>${index + 1}번째 줄</span><select data-master-stripe="${index}">${options}</select></label>`;
  }).join("");
  updateMasterStripePreview();
}

function currentMasterStripeColors() {
  return [...elements.masterStripeControls.querySelectorAll("[data-master-stripe]")].map((select) => select.value);
}

function updateMasterStripePreview() {
  elements.masterStripePreview.innerHTML = tireStripeIcon({ stripeColors: currentMasterStripeColors() }, "is-large");
}

function emptyStateTemplate(title, description) {
  return `
    <div class="empty-state">
      <div>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 4v5M12 15v5M4 12h5M15 12h5" /></svg>
        <strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span>
      </div>
    </div>`;
}

function startInspection() {
  inspection = createEmptyInspection();
  editingRecordId = null;
  elements.inspectionTireSearch.value = "";
  elements.inspectionDateInput.value = todayIso();
  elements.statusInput.value = "complete";
  elements.dockInput.value = "";
  elements.trailerInput.value = "";
  elements.noteInput.value = "";
  elements.receivedQtyInput.value = "0";
  elements.savePresetCheckbox.checked = false;
  showTireSelection();
  renderInspectionTireList();
  openSheet(elements.inspectionSheet);
}

function renderInspectionTireList() {
  const query = normalize(elements.inspectionTireSearch.value);
  const filtered = tires.filter((tire) => normalize([tire.name, ...(tire.aliases || [])].join(" ")).includes(query));
  elements.inspectionTireList.innerHTML = filtered.length
    ? filtered.map((tire) => {
      const preset = tire.presets?.[tire.defaultColor] || Object.values(tire.presets || {})[0];
      const rackText = preset ? `${preset.qtyPerRack}/Rack` : "프리셋 없음";
      return `<button class="selection-card" type="button" data-select-tire="${escapeHtml(tire.id)}">${tireStripeIcon(tire)}<span class="selection-copy"><strong>${escapeHtml(tire.name)}</strong><small>${escapeHtml(COLOR_LABELS[tire.defaultColor] || "")} · ${escapeHtml(rackText)}</small></span><span class="selection-expected">${formatNumber(tire.expectedQty)} EA</span></button>`;
    }).join("")
    : emptyStateTemplate("타이어를 찾지 못했습니다", "프리셋 화면에서 새 타이어를 추가할 수 있습니다.");
}

function selectInspectionTire(tireId) {
  const tire = tires.find((item) => item.id === tireId);
  if (!tire) return;
  inspection.tireId = tire.id;
  inspection.expectedQty = tire.expectedQty;
  inspection.color = tire.defaultColor && tire.presets?.[tire.defaultColor]
    ? tire.defaultColor
    : (tire.presets?.blue ? "blue" : "orange");
  loadInspectionPreset();
  showInspectionForm();
}

function showTireSelection() {
  elements.inspectionStepLabel.textContent = "STEP 1 OF 2";
  elements.inspectionTitle.textContent = "타이어 선택";
  elements.inspectionBackButton.hidden = true;
  elements.tireSelectionStep.hidden = false;
  elements.inspectionForm.hidden = true;
}

function showInspectionForm() {
  const tire = getInspectionTire();
  if (!tire) return showTireSelection();
  elements.inspectionStepLabel.textContent = "STEP 2 OF 2";
  elements.inspectionTitle.textContent = "수량 확인";
  elements.inspectionBackButton.hidden = false;
  elements.tireSelectionStep.hidden = true;
  elements.inspectionForm.hidden = false;
  elements.selectedTireName.textContent = tire.name;
  updatePresetCaptions(tire);
  renderInspectionState();
}

function selectRackColor(color) {
  if (!getInspectionTire()) return;
  inspection.color = color;
  elements.savePresetCheckbox.checked = false;
  loadInspectionPreset();
  renderInspectionState();
}

function loadInspectionPreset() {
  const tire = getInspectionTire();
  const preset = tire?.presets?.[inspection.color];
  inspection.expectedQty = tire?.expectedQty || 0;
  inspection.qtyPerRack = preset?.qtyPerRack || 0;
  const derived = deriveFormula(inspection.expectedQty, inspection.qtyPerRack);
  inspection.groupCount = derived.groups;
  inspection.extraQty = derived.extra;
  inspection.directTotal = null;
  inspection.editOpen = !preset;
}

function renderInspectionState() {
  const tire = getInspectionTire();
  if (!tire) return;
  document.querySelectorAll("[data-rack-color]").forEach((button) => {
    const selected = button.dataset.rackColor === inspection.color;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  elements.qtyPerRackInput.value = inspection.qtyPerRack || "";
  elements.groupCountInput.value = inspection.groupCount;
  elements.extraQtyInput.value = inspection.extraQty;
  elements.directTotalInput.value = inspection.directTotal ?? "";
  elements.countEditPanel.hidden = !inspection.editOpen;
  const hasPreset = Boolean(tire.presets?.[inspection.color]);
  elements.missingPresetNotice.hidden = hasPreset;
  elements.savePresetOption.hidden = false;
  updateInspectionCalculation();
  updatePartialFields();
  updateInspectionActionButtons();
}

function updatePresetCaptions(tire) {
  elements.bluePresetCaption.textContent = tire.presets?.blue ? `${tire.presets.blue.qtyPerRack}/Rack` : "프리셋 없음";
  elements.orangePresetCaption.textContent = tire.presets?.orange ? `${tire.presets.orange.qtyPerRack}/Rack` : "프리셋 없음";
}

function toggleCountEditor() {
  inspection.editOpen = !inspection.editOpen;
  elements.countEditPanel.hidden = !inspection.editOpen;
  document.querySelector("#toggleEditButton").textContent = inspection.editOpen ? "닫기" : "수정";
  if (inspection.editOpen) setTimeout(() => elements.qtyPerRackInput.focus(), 60);
}

function syncInspectionFromInputs() {
  inspection.qtyPerRack = Math.max(0, numberValue(elements.qtyPerRackInput.value));
  inspection.groupCount = Math.max(0, numberValue(elements.groupCountInput.value));
  inspection.extraQty = Math.max(0, numberValue(elements.extraQtyInput.value));
  inspection.directTotal = elements.directTotalInput.value === "" ? null : Math.max(0, numberValue(elements.directTotalInput.value));
  updateInspectionCalculation();
}

function updateInspectionCalculation() {
  const calculated = inspection.qtyPerRack * 4 * inspection.groupCount + inspection.extraQty;
  const actual = inspection.directTotal ?? calculated;
  const difference = actual - inspection.expectedQty;
  const formula = inspection.qtyPerRack
    ? formulaText(inspection.qtyPerRack, inspection.groupCount, inspection.extraQty, calculated)
    : "랙당 적재량을 입력하세요";

  elements.formulaExpression.textContent = inspection.directTotal === null ? formula : `실측 총수량 직접 입력 · ${formatNumber(actual)}`;
  elements.expectedTotalDisplay.textContent = formatNumber(inspection.expectedQty);
  elements.actualTotalDisplay.textContent = formatNumber(actual);
  elements.differenceDisplay.textContent = signedNumber(difference);
  elements.resultStrip.classList.toggle("is-different", difference !== 0);
  elements.confirmExpectedQty.textContent = formatNumber(inspection.expectedQty);
  document.querySelector("#toggleEditButton").textContent = inspection.editOpen ? "닫기" : "수정";
  updatePartialFields();
  updateInspectionActionButtons();
}

function updateInspectionActionButtons() {
  const difference = getInspectionActual() - inspection.expectedQty;
  const needsAdjustedSave = inspection.editOpen || difference !== 0 || elements.statusInput.value !== "complete" || Boolean(editingRecordId);
  elements.saveAdjustedButton.hidden = !needsAdjustedSave;
  elements.saveAdjustedButton.textContent = editingRecordId ? "변경 내용 저장" : "현재 값으로 저장";
  document.querySelector("#confirmExpectedButton").hidden = elements.statusInput.value !== "complete";
}

function updatePartialFields() {
  const isPartial = elements.statusInput.value === "partial";
  elements.partialFields.hidden = !isPartial;
  if (isPartial) {
    const actual = getInspectionActual();
    const received = Math.max(0, numberValue(elements.receivedQtyInput.value));
    elements.remainingQtyDisplay.textContent = formatNumber(Math.max(0, actual - received));
  }
}

function saveInspection(useExpected) {
  const tire = getInspectionTire();
  if (!tire) return;

  syncInspectionFromInputs();
  if (!inspection.qtyPerRack) {
    inspection.editOpen = true;
    renderInspectionState();
    showToast("랙당 적재량을 입력해주세요.");
    return;
  }

  if (useExpected) {
    const derived = deriveFormula(inspection.expectedQty, inspection.qtyPerRack);
    inspection.groupCount = derived.groups;
    inspection.extraQty = derived.extra;
    inspection.directTotal = null;
  }

  const calculated = inspection.qtyPerRack * 4 * inspection.groupCount + inspection.extraQty;
  const actual = inspection.directTotal ?? calculated;
  const difference = actual - inspection.expectedQty;
  const formula = inspection.directTotal === null
    ? formulaText(inspection.qtyPerRack, inspection.groupCount, inspection.extraQty, actual)
    : `직접 입력 ${formatNumber(actual)}`;
  const status = elements.statusInput.value;
  const received = status === "partial" ? Math.max(0, numberValue(elements.receivedQtyInput.value)) : 0;

  const existingRecord = editingRecordId ? records.find((item) => item.id === editingRecordId) : null;
  const record = {
    id: existingRecord?.id || createId("record"),
    createdAt: existingRecord?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: elements.inspectionDateInput.value || todayIso(),
    tireId: tire.id,
    tireName: tire.name,
    rackColor: inspection.color,
    qtyPerRack: inspection.qtyPerRack,
    groupCount: inspection.groupCount,
    extraQty: inspection.extraQty,
    directTotal: inspection.directTotal,
    expectedQty: inspection.expectedQty,
    actualQty: actual,
    difference,
    formula,
    status,
    dock: elements.dockInput.value.trim(),
    trailer: elements.trailerInput.value.trim().toUpperCase(),
    receivedQty: received,
    remainingQty: status === "partial" ? Math.max(0, actual - received) : null,
    note: elements.noteInput.value.trim(),
  };

  if (elements.savePresetCheckbox.checked) {
    const nextTires = structuredCloneSafe(tires);
    const nextTire = nextTires.find((item) => item.id === tire.id);
    nextTire.presets = nextTire.presets || {};
    nextTire.presets[inspection.color] = { qtyPerRack: inspection.qtyPerRack };
    nextTire.defaultColor = inspection.color;
    if (!saveJson(STORAGE_KEYS.tires, nextTires)) return;
    tires = nextTires;
  }

  const nextRecords = existingRecord
    ? records.map((item) => item.id === record.id ? record : item)
    : [...records, record];
  if (!saveJson(STORAGE_KEYS.records, nextRecords)) return;
  records = nextRecords;

  const wasEditing = Boolean(existingRecord);
  inspection = createEmptyInspection();
  editingRecordId = null;
  closeSheets(true);
  renderAll();
  setView("today");
  if (wasEditing) showToast("검수 기록을 수정했습니다.");
  else showToast(difference === 0 ? `${tire.name} · ${formatNumber(actual)} EA 검수 완료` : `실측 차이 ${signedNumber(difference)} EA로 저장했습니다.`);
}

function openMasterEditor(tireId = "") {
  const tire = tires.find((item) => item.id === tireId);
  elements.masterForm.reset();
  elements.masterTireId.value = tire?.id || "";
  elements.masterSheetTitle.textContent = tire ? "타이어 프리셋 수정" : "타이어 추가";
  elements.masterNameInput.value = tire?.name || "";
  elements.masterAliasesInput.value = tire?.aliases?.join(", ") || "";
  elements.masterExpectedInput.value = tire?.expectedQty || "";
  renderMasterStripeControls(tire?.stripeColors || normalizeStripeColors(null, tire?.id));
  elements.masterBlueEnabled.checked = Boolean(tire?.presets?.blue);
  elements.masterBlueQty.value = tire?.presets?.blue?.qtyPerRack || "";
  elements.masterOrangeEnabled.checked = Boolean(tire?.presets?.orange);
  elements.masterOrangeQty.value = tire?.presets?.orange?.qtyPerRack || "";
  elements.masterDefaultColor.value = tire?.defaultColor || "blue";
  elements.deleteTireButton.hidden = !tire;
  updateMasterPresetControls();
  openSheet(elements.masterSheet);
  setTimeout(() => elements.masterNameInput.focus(), 100);
}

function updateMasterPresetControls() {
  elements.masterBlueQty.disabled = !elements.masterBlueEnabled.checked;
  elements.masterOrangeQty.disabled = !elements.masterOrangeEnabled.checked;
  if (elements.masterBlueEnabled.checked && !elements.masterBlueQty.value) elements.masterBlueQty.value = "25";
  if (elements.masterOrangeEnabled.checked && !elements.masterOrangeQty.value) elements.masterOrangeQty.value = "20";
  const availableColors = [];
  if (elements.masterBlueEnabled.checked) availableColors.push("blue");
  if (elements.masterOrangeEnabled.checked) availableColors.push("orange");
  if (!availableColors.includes(elements.masterDefaultColor.value)) elements.masterDefaultColor.value = availableColors[0] || "blue";
  updateMasterFormulaPreview();
}

function updateMasterFormulaPreview() {
  const expected = Math.max(0, numberValue(elements.masterExpectedInput.value));
  [
    ["blue", elements.masterBlueEnabled, elements.masterBlueQty, elements.masterBlueFormula],
    ["orange", elements.masterOrangeEnabled, elements.masterOrangeQty, elements.masterOrangeFormula],
  ].forEach(([, enabled, qtyInput, preview]) => {
    if (!enabled.checked) {
      preview.textContent = "프리셋이 꺼져 있습니다.";
      return;
    }
    const qty = Math.max(0, numberValue(qtyInput.value));
    if (!expected || !qty) {
      preview.textContent = "예상 수량과 적재량을 입력하세요.";
      return;
    }
    const formula = deriveFormula(expected, qty);
    preview.textContent = formulaText(qty, formula.groups, formula.extra, expected);
  });
}

function saveMasterTire(event) {
  event.preventDefault();
  if (!elements.masterBlueEnabled.checked && !elements.masterOrangeEnabled.checked) {
    showToast("Blue 또는 Orange 프리셋을 하나 이상 켜주세요.");
    return;
  }

  const presets = {};
  if (elements.masterBlueEnabled.checked) {
    const qty = numberValue(elements.masterBlueQty.value);
    if (!qty) return showToast("Blue 랙 적재량을 입력해주세요.");
    presets.blue = { qtyPerRack: qty };
  }
  if (elements.masterOrangeEnabled.checked) {
    const qty = numberValue(elements.masterOrangeQty.value);
    if (!qty) return showToast("Orange 랙 적재량을 입력해주세요.");
    presets.orange = { qtyPerRack: qty };
  }

  const id = elements.masterTireId.value;
  const existing = tires.find((item) => item.id === id);
  const tire = {
    id: existing?.id || createId("tire"),
    name: elements.masterNameInput.value.trim(),
    aliases: elements.masterAliasesInput.value.split(",").map((value) => value.trim()).filter(Boolean),
    expectedQty: numberValue(elements.masterExpectedInput.value),
    stripeColors: currentMasterStripeColors(),
    defaultColor: presets[elements.masterDefaultColor.value] ? elements.masterDefaultColor.value : Object.keys(presets)[0],
    presets,
  };

  const nextTires = existing
    ? tires.map((item) => item.id === tire.id ? tire : item)
    : [...tires, tire];
  if (!saveJson(STORAGE_KEYS.tires, nextTires)) return;
  tires = nextTires;
  closeSheets(true);
  renderTireMaster();
  showToast(existing ? "프리셋을 수정했습니다." : "새 타이어를 추가했습니다.");
}

function deleteMasterTire() {
  const id = elements.masterTireId.value;
  const tire = tires.find((item) => item.id === id);
  if (!tire) return;
  if (!window.confirm(`${tire.name} 프리셋을 삭제할까요? 기존 검수 기록은 유지됩니다.`)) return;
  const nextTires = tires.filter((item) => item.id !== id);
  if (!saveJson(STORAGE_KEYS.tires, nextTires)) return;
  tires = nextTires;
  closeSheets(true);
  renderTireMaster();
  showToast("타이어 프리셋을 삭제했습니다.");
}

function openRecordFromEvent(event) {
  const button = event.target.closest("[data-record-id]");
  if (!button) return;
  openRecordDetail(button.dataset.recordId);
}

function openRecordDetail(recordId) {
  const record = records.find((item) => item.id === recordId);
  if (!record) return;
  activeRecordId = record.id;
  const statusText = STATUS_LABELS[record.status] || record.status;
  const extraRows = [
    ["상태", statusText],
    ["검수 날짜", formatLongDate(record.date)],
    ["랙 프리셋", `${COLOR_LABELS[record.rackColor]} · ${formatNumber(record.qtyPerRack)}/Rack`],
    ["Dock / Trailer", [record.dock ? `Dock ${record.dock}` : "", record.trailer].filter(Boolean).join(" · ") || "입력 없음"],
    ...(record.status === "partial" ? [["입고 진행", `${formatNumber(record.receivedQty)} 수령 · ${formatNumber(record.remainingQty)} 남음`]] : []),
    ["특이사항", record.note || "없음"],
  ];

  elements.recordDetailBody.innerHTML = `
    <div class="record-detail-summary">
      <h3>${escapeHtml(record.tireName)}</h3>
      <p>${escapeHtml(record.formula)}</p>
      <div class="detail-quantity-grid">
        <div><span>예상</span><strong>${formatNumber(record.expectedQty)}</strong></div>
        <div><span>실측</span><strong>${formatNumber(record.actualQty)}</strong></div>
        <div><span>차이</span><strong>${signedNumber(record.difference)}</strong></div>
      </div>
    </div>
    <div class="detail-list">
      ${extraRows.map(([label, value]) => `<div class="detail-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("")}
    </div>
    <div class="record-detail-actions">
      <button class="secondary-button" type="button" data-record-action="delete">기록 삭제</button>
      <button class="secondary-button" type="button" data-record-action="edit">${record.status === "complete" ? "기록 수정" : "검수 계속"}</button>
      <button class="primary-button" type="button" data-record-action="copy">한 줄 기록 복사</button>
    </div>`;
  openSheet(elements.recordSheet);
}

function handleRecordDetailAction(event) {
  const button = event.target.closest("[data-record-action]");
  if (!button || !activeRecordId) return;
  const record = records.find((item) => item.id === activeRecordId);
  if (!record) return;
  if (button.dataset.recordAction === "copy") {
    const line = `${record.tireName} · ${record.qtyPerRack}/${COLOR_LABELS[record.rackColor]} · ${record.actualQty} · ${STATUS_LABELS[record.status] || record.status}`;
    copyText(line).then(() => showToast("한 줄 기록을 복사했습니다."));
  }
  if (button.dataset.recordAction === "edit") {
    editInspectionRecord(record);
  }
  if (button.dataset.recordAction === "delete") {
    if (!window.confirm(`${record.tireName} 검수 기록을 삭제할까요?`)) return;
    const nextRecords = records.filter((item) => item.id !== record.id);
    if (!saveJson(STORAGE_KEYS.records, nextRecords)) return;
    records = nextRecords;
    closeSheets(true);
    renderAll();
    showToast("검수 기록을 삭제했습니다.");
  }
}

function editInspectionRecord(record) {
  const tire = tires.find((item) => item.id === record.tireId);
  if (!tire) {
    showToast("삭제된 타이어 프리셋은 먼저 다시 등록해주세요.");
    return;
  }
  editingRecordId = record.id;
  inspection = {
    tireId: tire.id,
    color: record.rackColor,
    qtyPerRack: numberValue(record.qtyPerRack),
    groupCount: numberValue(record.groupCount),
    extraQty: numberValue(record.extraQty),
    directTotal: record.directTotal === null || record.directTotal === undefined ? null : numberValue(record.directTotal),
    expectedQty: numberValue(record.expectedQty),
    editOpen: true,
  };
  elements.inspectionDateInput.value = record.date || todayIso();
  elements.statusInput.value = record.status || "complete";
  elements.dockInput.value = record.dock || "";
  elements.trailerInput.value = record.trailer || "";
  elements.noteInput.value = record.note || "";
  elements.receivedQtyInput.value = record.receivedQty || 0;
  elements.savePresetCheckbox.checked = false;
  showInspectionForm();
  elements.inspectionStepLabel.textContent = "EDIT RECORD";
  elements.inspectionTitle.textContent = record.status === "complete" ? "검수 기록 수정" : "검수 계속";
  openSheet(elements.inspectionSheet);
}

function exportData() {
  const payload = {
    app: "Tire Receiving",
    version: 1,
    exportedAt: new Date().toISOString(),
    tires,
    records,
  };
  const json = JSON.stringify(payload, null, 2);
  const filename = `tire-receiving-backup-${todayIso()}.json`;
  if (window.TireNative?.exportFile) {
    window.TireNative.exportFile(filename, "application/json", json);
    return;
  }
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  showToast("백업 파일을 만들었습니다.");
}

async function importData(event) {
  const [file] = event.target.files;
  event.target.value = "";
  if (!file) return;
  await restoreBackupJson(await file.text());
}

async function restoreBackupJson(text) {
  try {
    const data = JSON.parse(text);
    if (!isValidBackup(data)) throw new Error("invalid");
    if (!window.confirm(`프리셋 ${data.tires.length}개와 기록 ${data.records.length}개로 현재 데이터를 바꿀까요?`)) return;
    const restoredTires = data.tires.map(withNormalizedStripes);
    replaceLocalData(restoredTires, data.records);
    tires = structuredCloneSafe(restoredTires);
    records = structuredCloneSafe(data.records);
    closeSheets(true);
    renderAll();
    showToast("백업 데이터를 복원했습니다.");
  } catch {
    showToast("올바른 백업 파일이 아닙니다.");
  }
}

window.receiveBackup = (text) => restoreBackupJson(text);

window.handleAndroidBack = () => {
  if (!elements.sheetBackdrop.hidden) {
    closeSheets();
    return "handled";
  }
  const activeView = document.querySelector(".view.is-active")?.dataset.view;
  if (activeView && activeView !== "today") {
    setView("today");
    return "handled";
  }
  return "exit";
};

function isValidBackup(data) {
  if (!data || !Array.isArray(data.tires) || !Array.isArray(data.records)) return false;
  const validColors = new Set(["blue", "orange"]);
  const validStatuses = new Set(["complete", "in_progress", "pending", "partial"]);
  const tireIds = new Set();
  for (const tire of data.tires) {
    if (!tire || typeof tire.id !== "string" || !tire.id || tireIds.has(tire.id)) return false;
    if (typeof tire.name !== "string" || !tire.name.trim() || !Number.isFinite(Number(tire.expectedQty)) || Number(tire.expectedQty) <= 0) return false;
    if (!validColors.has(tire.defaultColor) || !tire.presets || typeof tire.presets !== "object") return false;
    if (!tire.presets[tire.defaultColor]) return false;
    for (const [color, preset] of Object.entries(tire.presets)) {
      if (!validColors.has(color) || !preset || !Number.isFinite(Number(preset.qtyPerRack)) || Number(preset.qtyPerRack) <= 0) return false;
    }
    if (tire.aliases !== undefined && !Array.isArray(tire.aliases)) return false;
    if (tire.stripeColors !== undefined && (!Array.isArray(tire.stripeColors) || tire.stripeColors.length !== 4 || tire.stripeColors.some((color) => !STRIPE_COLORS.includes(color)))) return false;
    tireIds.add(tire.id);
  }
  for (const record of data.records) {
    if (!record || typeof record.id !== "string" || typeof record.tireName !== "string") return false;
    if (!validColors.has(record.rackColor) || !validStatuses.has(record.status)) return false;
    for (const field of ["qtyPerRack", "groupCount", "extraQty", "expectedQty", "actualQty", "difference"]) {
      if (!Number.isFinite(Number(record[field]))) return false;
    }
    if (typeof record.date !== "string" || typeof record.formula !== "string") return false;
  }
  return true;
}

function replaceLocalData(nextTires, nextRecords) {
  const previousTires = localStorage.getItem(STORAGE_KEYS.tires);
  const previousRecords = localStorage.getItem(STORAGE_KEYS.records);
  try {
    localStorage.setItem(STORAGE_KEYS.tires, JSON.stringify(nextTires));
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(nextRecords));
  } catch (error) {
    if (previousTires === null) localStorage.removeItem(STORAGE_KEYS.tires);
    else localStorage.setItem(STORAGE_KEYS.tires, previousTires);
    if (previousRecords === null) localStorage.removeItem(STORAGE_KEYS.records);
    else localStorage.setItem(STORAGE_KEYS.records, previousRecords);
    throw error;
  }
}

function openSheet(sheet) {
  if (elements.sheetBackdrop.hidden) lastFocusedElement = document.activeElement;
  [elements.inspectionSheet, elements.masterSheet, elements.recordSheet, elements.dataSheet].forEach((item) => {
    if (item !== sheet) item.hidden = true;
  });
  elements.sheetBackdrop.hidden = false;
  sheet.hidden = false;
  document.querySelector(".app-shell").inert = true;
  document.body.classList.add("sheet-open");
  setTimeout(() => sheet.focus({ preventScroll: true }), 30);
}

function closeSheets(force = false) {
  if (!force && !elements.inspectionSheet.hidden && inspection.tireId) {
    if (!window.confirm("작성 중인 검수를 닫을까요? 저장하지 않은 내용은 사라집니다.")) return false;
  }
  [elements.inspectionSheet, elements.masterSheet, elements.recordSheet, elements.dataSheet].forEach((sheet) => { sheet.hidden = true; });
  elements.sheetBackdrop.hidden = true;
  document.querySelector(".app-shell").inert = false;
  document.body.classList.remove("sheet-open");
  activeRecordId = null;
  if (!force) {
    inspection = createEmptyInspection();
    editingRecordId = null;
  }
  if (lastFocusedElement?.focus) setTimeout(() => lastFocusedElement.focus({ preventScroll: true }), 20);
  return true;
}

function trapSheetFocus(event) {
  const openSheetElement = [elements.inspectionSheet, elements.masterSheet, elements.recordSheet, elements.dataSheet].find((sheet) => !sheet.hidden);
  if (!openSheetElement) return;
  const focusable = [...openSheetElement.querySelectorAll('button:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), select:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled]), summary, [tabindex]:not([tabindex="-1"])')]
    .filter((item) => item.offsetParent !== null);
  if (!focusable.length) {
    event.preventDefault();
    openSheetElement.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getInspectionTire() {
  return tires.find((tire) => tire.id === inspection.tireId);
}

function getInspectionActual() {
  return inspection.directTotal ?? (inspection.qtyPerRack * 4 * inspection.groupCount + inspection.extraQty);
}

function createEmptyInspection() {
  return {
    tireId: null,
    color: "blue",
    qtyPerRack: 0,
    groupCount: 0,
    extraQty: 0,
    directTotal: null,
    expectedQty: 0,
    editOpen: false,
  };
}

function deriveFormula(total, qtyPerRack) {
  const block = numberValue(qtyPerRack) * 4;
  if (!block) return { groups: 0, extra: numberValue(total) };
  return { groups: Math.floor(numberValue(total) / block), extra: numberValue(total) % block };
}

function formulaText(qtyPerRack, groups, extra, total) {
  const extraText = extra ? ` + ${formatNumber(extra)}` : "";
  return `${formatNumber(qtyPerRack)} × 4 × ${formatNumber(groups)}${extraText} = ${formatNumber(total)}`;
}

function persistTires() {
  return saveJson(STORAGE_KEYS.tires, tires);
}

function persistRecords() {
  return saveJson(STORAGE_KEYS.records, records);
}

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    if (toastReady) showToast("기기 저장 공간이 부족합니다. 데이터를 백업해주세요.");
    else storageWarningPending = true;
    return false;
  }
}

function updateConnectionStatus() {
  if (window.TireNative) {
    elements.connectionLabel.textContent = "오프라인 앱";
    elements.connectionDot.style.background = "var(--green)";
    return;
  }
  const online = navigator.onLine;
  elements.connectionLabel.textContent = online ? "온라인" : "오프라인 사용 중";
  elements.connectionDot.style.background = online ? "var(--green)" : "var(--amber)";
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2800);
}

function copyText(text) {
  if (window.TireNative?.copy) {
    window.TireNative.copy(text);
    return Promise.resolve();
  }
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  return Promise.resolve();
}

function sortRecordsNewest(a, b) {
  return String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date));
}

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatShortDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function formatLongDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T12:00:00`));
}

function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(numberValue(value));
}

function compactNumber(value) {
  const number = numberValue(value);
  if (number < 10000) return formatNumber(number);
  return new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(number);
}

function signedNumber(value) {
  const number = numberValue(value);
  if (number === 0) return "0";
  return `${number > 0 ? "+" : ""}${formatNumber(number)}`;
}

function numberValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.trunc(number) : 0;
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function createId(prefix) {
  if (crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function structuredCloneSafe(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
