/* ===== Expenses Interactive Table (modified) ===== */
const API_URL = 'https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_expinses';

/* Snapshot for Cancel */
let __mfSnapshot = { headers: [], rows: [] };
function updateSnapshot(headers, rows){
  __mfSnapshot = {
    headers: [...headers],
    rows: JSON.parse(JSON.stringify(rows))
  };
}

/* Session + Theme */
function checkUserId() {
  if (!sessionStorage.getItem("userId")) {
    window.location.href =
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?client_id=1v5jdad42jojr28bcv13sgds5r&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
  }
}
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  checkUserId();
  setInterval(checkUserId, 500);
});

/* Spinner (class-based, not jQuery) */
function showSpinner(){
  const s = document.getElementById('spinner');
  if (s) s.classList.add('is-visible');
}
function hideSpinner(){
  const s = document.getElementById('spinner');
  if (s) s.classList.remove('is-visible');
}
/* Helpers */
function normalizeApiResponse(payload) {
  if (!payload) return {};
  try { return payload.body ? JSON.parse(payload.body) : payload; }
  catch { return payload; }
}

/* DOM targets */
const container = document.getElementById('UPLOAD2');

/* ===== Render Table + Edit Logic ===== */
function renderTable(headers, rows) {
  container.innerHTML = "";
  container.className = "mf-card"; // بدل الـ inline styles

  let dirty = false, btnSave = null, btnCancel = null;
  function setDirty(v){
    dirty = !!v;
    if (btnSave)   btnSave.style.display   = dirty ? 'inline-block' : 'none';
    if (btnCancel) btnCancel.style.display = dirty ? 'inline-block' : 'none';
  }
  window.__mfSetDirty = setDirty;

  const table = document.createElement('table');
  table.className = 'mf-table';

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  const thAct = document.createElement('th');
  thAct.textContent = 'Actions';
  trHead.appendChild(thAct);

  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h || '';
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  function toggleRowEdit(tr, makeEdit){
    Array.from(tr.querySelectorAll('td:not(:first-child)')).forEach(td => {
      td.contentEditable = makeEdit ? 'true' : 'false';
      td.classList.toggle('cell-editing', !!makeEdit);
    });
    tr.classList.toggle('row-editing', !!makeEdit);
    tr.dataset.editing = makeEdit ? '1' : '0';
  }

  function makeRow(cells = Array.from({length: headers.length}, () => "")) {
    const tr = document.createElement('tr');

    // actions
    const tdActions = document.createElement('td');
    const btnEdit = document.createElement('button');
    const btnDel  = document.createElement('button');
    btnEdit.textContent = 'Edit';
    btnDel.textContent  = 'Delete';
    btnEdit.className = 'mf-btn mf-btn-sm';
    btnDel.className  = 'mf-btn mf-btn-sm';
    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDel);
    tr.appendChild(tdActions);

    // data cells
    cells.forEach((v, idx) => {
      const td = document.createElement('td');
      td.textContent = v ?? "";
      td.contentEditable = 'false';
      td.dataset.col = headers[idx];
      td.style.color = '#000';
      td.addEventListener('input', () => setDirty(true));
      tr.appendChild(td);
    });

    // toggle edit
    btnEdit.addEventListener('click', () => {
      const editing = tr.dataset.editing === '1';
      toggleRowEdit(tr, !editing);
      btnEdit.textContent = editing ? 'Edit' : 'Done';
    });

    // delete row
    btnDel.addEventListener('click', () => {
      tbody.removeChild(tr);
      setDirty(true);
    });

    return tr;
  }

  (rows || []).forEach(r => tbody.appendChild(makeRow(r)));
  table.appendChild(tbody);
  container.appendChild(table);

  // Bottom actions
  const bottomBar = document.createElement('div');
  bottomBar.className = 'mf-actions';

  const btnAdd  = document.createElement('button');
  btnAdd.textContent = 'Add Expense';
  btnAdd.className = 'mf-btn';

  btnSave = document.createElement('button');
  btnSave.textContent = 'Save';
  btnSave.className = 'mf-btn';
  btnSave.style.display = 'none';

  btnCancel = document.createElement('button');
  btnCancel.textContent = 'Cancel';
  btnCancel.className = 'mf-btn';
  btnCancel.style.display = 'none';

  bottomBar.appendChild(btnAdd);
  bottomBar.appendChild(btnSave);
  bottomBar.appendChild(btnCancel);
  container.appendChild(bottomBar);

  // Add row
  btnAdd.addEventListener('click', () => {
    const tr = makeRow(headers.map(() => ""));
    tbody.appendChild(tr);
    toggleRowEdit(tr, true);
    const firstEditable = tr.querySelector('td:nth-child(2)');
    if (firstEditable) firstEditable.focus();
    setDirty(true);
  });

  // Save
  btnSave.addEventListener('click', async () => {
    if (!dirty) return;
    const allRows = [];
    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
      const tds = Array.from(tr.querySelectorAll('td')).slice(1); // skip actions
      const row = tds.map(td => td.textContent.trim());
      if (row.some(v => v !== "")) allRows.push(row);
    });
    await saveExpenses(headers, allRows);
  });

  // Cancel → back to snapshot
  btnCancel.addEventListener('click', () => {
    renderTable(__mfSnapshot.headers, __mfSnapshot.rows);
  });
}

/* Fetch on load */
async function fetchExpenses() {
  const userId = sessionStorage.getItem('userId');
  if (!userId) return;

  showSpinner();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId, action: 'fetch' })
    });
    const payload = await res.json();
    const data = normalizeApiResponse(payload);

    const headers = Array.isArray(data.headers) && data.headers.length
      ? data.headers
      : ["registration_number","company_name"];
    const rows = Array.isArray(data.rows) ? data.rows : [];

    updateSnapshot(headers, rows);
    renderTable(headers, rows);
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="mf-error">حدث خطأ غير متوقع أثناء جلب البيانات.</div>`;
  } finally {
    hideSpinner();
  }
}

/* Save */
async function saveExpenses(headers, rows) {
  const userId = sessionStorage.getItem('userId');
  if (!userId) return;

  showSpinner();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId, action: 'save', headers, rows })
    });
    const payload = await res.json();
    const data = normalizeApiResponse(payload);

    if (res.ok && (data.message === 'saved' || payload.message === 'saved')) {
      updateSnapshot(headers, rows);
      if (typeof showSuccessModal === 'function') showSuccessModal();
      if (window.__mfSetDirty) window.__mfSetDirty(false);
    } else {
      alert('فشل الحفظ. راجع الكونسول.');
      console.error('Save error:', data || payload);
    }
  } catch (e) {
    alert('خطأ أثناء الحفظ.');
    console.error(e);
  } finally {
    hideSpinner();
  }
}

/* Info modal helpers (needed by HTML) */
function showInfo(){
  const m = document.getElementById('infoModal');
  if (m){ m.style.display = 'block'; m.setAttribute('aria-hidden','false'); }
}
function closeModal(){
  const m = document.getElementById('infoModal');
  if (m){ m.style.display = 'none'; m.setAttribute('aria-hidden','true'); }
}

/* Boot */
(function boot() {
  if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = fetchExpenses;
    script.onerror = fetchExpenses;
    document.head.appendChild(script);
  } else {
    fetchExpenses();
  }
})();
