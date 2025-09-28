(() => {
    // ===== CONFIG =====
    const API_URL = 'https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf-fetch-expinses-invoice';
    const SESSION_KEY = 'userId';

    // ===== STATE =====
    let fullRows = [];       // صفوف عربية المفاتيح
    let originalRows = [];   // نسخة أصلية
    let filteredRows = [];
    const pending = new Map(); // absIndex -> {internal_number, vendor_tax, status}
    const undoStack = [];
    const redoStack = [];

    // ===== DOM =====
    const overlay = document.getElementById('overlay');
    const toastEl = document.getElementById('toast');
    const metaEl = document.getElementById('meta');
    const tbody = document.getElementById('tbody');
    const search = document.getElementById('search');
    const statusFilter = document.getElementById('statusFilter');
    const currencyFilter = document.getElementById('currencyFilter');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // ===== Utils =====
    const showSpinner = (v) => overlay.style.display = v ? 'flex' : 'none';
    const toast = (msg, ok = true) => {
        toastEl.textContent = msg;
        toastEl.style.borderColor = ok ? 'rgba(34,197,94,.4)' : 'rgba(239,68,68,.5)';
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2200);
    };

    // عرض للمستخدم: show => مصروفات | hide => مشتريات
    const statusLabel = (s) => (String(s).toLowerCase() === 'show' ? 'مصروفات' : 'مشتريات');

    // Normalize Arabic input
    const AR_MAP = { '\u200f': '', '\u200e': '', 'ى': 'ي', 'ة': 'ه', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ٱ': 'ا' };
    function arNorm(s) {
        if (!s) return '';
        let x = String(s).toLowerCase().trim();
        return x.replace(/[\u064B-\u0652\u0670]/g, '').replace(/./g, ch => AR_MAP[ch] ?? ch);
    }

    // unify incoming keys -> Arabic labels
    function normalizeRow(row) {
        const get = (...keys) => { for (const k of keys) { if (row[k] !== undefined && row[k] !== null) return row[k]; } return null; };
        return {
            'نوع المستند': get('نوع المستند', 'doc_type'),
            'الرقم الداخلى': get('الرقم الداخلى', 'internal_number'),
            'تاريخ الإصدار': get('تاريخ الإصدار', 'issue_date'),
            'عملة الفاتورة': get('عملة الفاتورة', 'currency'),
            'قيمة الفاتورة': get('قيمة الفاتورة', 'amount'),
            'ضريبة القيمة المضافة': get('ضريبة القيمة المضافة', 'vat'),
            'ضريبة الجدول النسبية': get('ضريبة الجدول النسبية', 'table_tax'),
            'الخصم تحت حساب الضريبة': get('الخصم تحت حساب الضريبة', 'wht'),
            'خصم الفاتورة': get('خصم الفاتورة', 'discount'),
            'إجمالى الفاتورة': get('إجمالى الفاتورة', 'total'),
            'مصروفات الفاتوره': get('مصروفات الفاتوره', 'expense_calc'),
            'الرقم الضريبى للبائع': get('الرقم الضريبى للبائع', 'vendor_tax'),
            'إسم البائع': get('إسم البائع', 'vendor_name'),
            'الحاله': (get('الحاله', 'status') || '').toString().toLowerCase()
        };
    }

    function fmtDate(input) {
        if (!input) return '';
        const s = String(input).trim();
        const d = new Date(s.replace(' ', 'T'));
        if (!isNaN(d.getTime())) {
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yy = d.getFullYear();
            return `${dd}-${mm}-${yy}`;
        }
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? `${m[3]}-${m[2]}-${m[1]}` : s;
    }

    function num(v) {
        if (v === null || v === undefined || v === '') return '';
        const n = Number(v);
        return isFinite(n) ? n.toString() : String(v);
    }

    function buildRow(r, idx) {
        const isShow = String(r['الحاله'] || '').toLowerCase() === 'show';
        const currentStatus = isShow ? 'show' : 'hide'; // يُرسل للـ API
        return `
    <tr data-idx="${idx}">
    <td>${r['نوع المستند'] ?? ''}</td>
    <td><span class="chip">${r['الرقم الداخلى'] ?? ''}</span></td>
    <td>${fmtDate(r['تاريخ الإصدار'])}</td>
    <td class="hide-md">${r['عملة الفاتورة'] ?? ''}</td>
    <td>${num(r['قيمة الفاتورة'])}</td>
    <td class="hide-md">${num(r['ضريبة القيمة المضافة'])}</td>
    <td class="hide-md">${num(r['ضريبة الجدول النسبية'])}</td>
    <td class="hide-md">${num(r['الخصم تحت حساب الضريبة'])}</td>
    <td class="hide-md">${num(r['خصم الفاتورة'])}</td>
    <td>${num(r['إجمالى الفاتورة'])}</td>
    <td>${num(r['مصروفات الفاتوره'])}</td>
    <td class="hide-md">${r['الرقم الضريبى للبائع'] ?? ''}</td>
    <td>${r['إسم البائع'] ?? ''}</td>
    <td>
        <div class="status-switch">
        <div class="switch ${isShow ? 'on' : ''}" role="switch" aria-checked="${isShow}" tabindex="0" data-api-status="${currentStatus}">
            <input type="checkbox" ${isShow ? 'checked' : ''} />
            <div class="knob"></div>
        </div>
        <span class="muted">${statusLabel(currentStatus)}</span>
        </div>
    </td>
    </tr>
`;
    }

    function render() {
        tbody.innerHTML = filteredRows.map((r, i) => buildRow(r, i)).join('');
        renderMetaOnly();
    }

    function renderMetaOnly() {
        metaEl.textContent =
            `عدد الصفوف: ${filteredRows.length} | تعديلات غير محفوظة: ${pending.size} | تراجع: ${undoStack.length} | إعادة: ${redoStack.length}`;
    }

    // ===== بحث ذكي + فلاتر =====
    function applyFilters() {
        const qraw = search.value;
        const q = arNorm(qraw);
        const tokens = q.split(/\s+/).filter(Boolean);

        const fStatus = statusFilter.value; // show/hide
        const fCurr = currencyFilter.value;

        filteredRows = fullRows.filter(r => {
            if (fStatus && String(r['الحاله'] || '').toLowerCase() !== fStatus) return false;
            if (fCurr && String(r['عملة الفاتورة'] || '') !== fCurr) return false;

            if (tokens.length === 0) return true;

            const hay = arNorm([
                r['الرقم الداخلى'], r['إسم البائع'], r['عملة الفاتورة'], r['نوع المستند'],
                r['الرقم الضريبى للبائع']
            ].map(x => String(x ?? '')).join(' | '));

            return tokens.every(t => hay.includes(t));
        });

        render();
    }

    function debounce(fn, wait = 200) {
        let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    }
    const debouncedFilter = debounce(applyFilters, 200);

    // ===== Toggle handling + history =====
    function setStatusByAbsIndex(absIndex, newStatus, pushHistory = true) {
        const row = fullRows[absIndex];
        if (!row) return;
        const prev = String(row['الحاله'] || '').toLowerCase();
        if (prev === newStatus) return;

        row['الحاله'] = newStatus;
        pending.set(absIndex, {
            internal_number: row['الرقم الداخلى'],
            vendor_tax: row['الرقم الضريبى للبائع'],
            status: newStatus
        });
        if (pushHistory) {
            undoStack.push({ absIndex, prev, next: newStatus });
            redoStack.length = 0;
        }
    }

    function handleToggleClick(target) {
        const sw = target.closest('.switch');
        if (!sw) return;
        const tr = target.closest('tr');
        const idx = Number(tr.dataset.idx);
        const row = filteredRows[idx];
        const absIndex = fullRows.indexOf(row);

        const willBeOn = !sw.classList.contains('on');
        const newStatus = willBeOn ? 'show' : 'hide'; // API value
        setStatusByAbsIndex(absIndex, newStatus, true);

        sw.classList.toggle('on', willBeOn);
        sw.setAttribute('aria-checked', willBeOn ? 'true' : 'false');
        sw.querySelector('input').checked = willBeOn;
        tr.querySelector('.status-switch .muted').textContent = statusLabel(newStatus);

        renderMetaOnly();
    }

    tbody.addEventListener('click', (e) => handleToggleClick(e.target));
    tbody.addEventListener('keydown', (e) => {
        const sw = e.target.closest('.switch[role="switch"]');
        if (!sw) return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleToggleClick(e.target); }
    });

    // Undo / Redo
    function undo() {
        const last = undoStack.pop();
        if (!last) return;
        const { absIndex, prev, next } = last;
        setStatusByAbsIndex(absIndex, prev, false);
        redoStack.push(last);
        applyFilters();
    }
    function redo() {
        const item = redoStack.pop();
        if (!item) return;
        const { absIndex, prev, next } = item;
        setStatusByAbsIndex(absIndex, next, false);
        undoStack.push(item);
        applyFilters();
    }
    undoBtn.addEventListener('click', undo);
    redoBtn.addEventListener('click', redo);

    // Cancel all changes
    cancelBtn.addEventListener('click', () => {
        if (pending.size === 0 && undoStack.length === 0) { toast('لا توجد تعديلات لإلغائها'); return; }
        fullRows = originalRows.map(r => ({ ...r }));
        pending.clear(); undoStack.length = 0; redoStack.length = 0;
        applyFilters();
        toast('تم إلغاء كل التعديلات');
    });

    // ===== API helpers =====
    async function postJSON(url, payload) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        let out = await res.json().catch(() => ({}));
        if (out && typeof out.body === 'string') { try { out = JSON.parse(out.body); } catch { } }
        return { ok: res.ok, data: out, status: res.status };
    }

    // ===== Save batch =====
    saveBtn.addEventListener('click', async () => {
        if (pending.size === 0) { toast('لا توجد تعديلات'); return; }
        const userId = sessionStorage.getItem(SESSION_KEY);
        if (!userId) { toast('userId غير موجود', false); return; }

        const updates = [];
        for (const [, ch] of pending.entries()) {
            updates.push({
                internal_number: String(ch.internal_number || ''),
                vendor_tax: String(ch.vendor_tax || ''),
                status: ch.status // show/hide
            });
        }

        showSpinner(true);
        try {
            const { ok, data, status } = await postJSON(API_URL, { userId, action: 'update_status', updates });
            if (status === 202 || ok) {
                toast(`تم الحفظ: ${data?.updated_rows ?? 0}${status === 202 ? ' (خلفية)' : ''}`);
                pending.clear(); undoStack.length = 0; redoStack.length = 0;

                // refetch للتأكيد
                await new Promise(r => setTimeout(r, 800));
                const ref = await postJSON(API_URL, { userId, action: 'fetch' });
                if (Array.isArray(ref.data?.rows)) {
                    fullRows = ref.data.rows.map(normalizeRow);
                    originalRows = fullRows.map(r => ({ ...r }));
                    filteredRows = fullRows.slice();
                    applyFilters();
                    toast('تم التحديث');
                }
            } else if (status === 504) {
                toast('الطلب طال وقته — نتحقق من الحفظ…');
                await new Promise(r => setTimeout(r, 1200));
                const ref = await postJSON(API_URL, { userId, action: 'fetch' });
                if (Array.isArray(ref.data?.rows)) {
                    fullRows = ref.data.rows.map(normalizeRow);
                    originalRows = fullRows.map(r => ({ ...r }));
                    filteredRows = fullRows.slice();
                    applyFilters();
                    pending.clear(); undoStack.length = 0; redoStack.length = 0;
                    toast('تم الحفظ (بعد التحقق)');
                } else {
                    toast('تعذر التحقق بعد 504', false);
                }
            } else {
                console.log('update_status failed', status, data);
                toast('فشل الحفظ', false);
            }
        } catch (e) {
            console.error(e); toast('خطأ في الاتصال بالحفظ', false);
        } finally { showSpinner(false); }
    });

    // ===== Initial fetch =====
    window.addEventListener('DOMContentLoaded', async () => {
        const userId = sessionStorage.getItem(SESSION_KEY);
        if (!userId) {
            toast('userId غير موجود في sessionStorage', false);
            console.warn('sessionStorage.setItem("userId","<GUID>") قبل فتح الصفحة');
            return;
        }
        showSpinner(true);
        try {
            const { data } = await postJSON(API_URL, { userId, action: 'fetch' });
            const rows = Array.isArray(data?.rows) ? data.rows : [];
            fullRows = rows.map(normalizeRow);
            originalRows = fullRows.map(r => ({ ...r }));
            filteredRows = fullRows.slice();

            metaEl.textContent =
                `registration: ${data?.registrationNumber || '-'} | ملف: ${data?.s3Key || '-'}`;
            render();
            toast(`تم تحميل ${filteredRows.length} صف`);
        } catch (err) {
            console.error(err);
            toast('خطأ في تحميل البيانات', false);
        } finally {
            showSpinner(false);
        }
    });

    // بحث وفلاتر (Debounced)
    search.addEventListener('input', debouncedFilter);
    statusFilter.addEventListener('change', applyFilters);
    currencyFilter.addEventListener('change', applyFilters);
})();