const API_URL = "https://ul5i2a4nke.execute-api.us-east-1.amazonaws.com/prod/captcha-control";
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

// -------- Navigation
function goHome() { location.href = "home.html"; }
function goSubscribe() { location.href = "captcher-subescribe.html"; }

// -------- Helpers
const $ = (id) => document.getElementById(id);
function getUserId() {
    const v = sessionStorage.getItem("userId");
    return v && v.trim() ? v.trim() : null;
}

// -------- Overlay helpers
let __pendingCalls = 0;
function showOverlay(msg = "جارٍ التحديث…") {
    const ov = $('loadingOverlay'), lt = $('loadingText');
    if (lt) lt.textContent = msg; ov?.classList.add('show');
}
function hideOverlay() { $('loadingOverlay')?.classList.remove('show'); }
function incLoading(msg) { if (++__pendingCalls === 1) showOverlay(msg); }
function decLoading() { __pendingCalls = Math.max(0, __pendingCalls - 1); if (__pendingCalls === 0) hideOverlay(); }

// -------- Custom Alert / Confirm
function showAlert(message, title = "تنبيه") {
    return new Promise((resolve) => {
        const ov = $('alertOverlay'), msg = $('alertMsg'), tl = $('alertTitle'), btns = $('alertBtns');
        tl.textContent = title; msg.textContent = message;
        btns.innerHTML = '';
        const ok = document.createElement('button');
        ok.className = 'btn btn-ok'; ok.textContent = 'موافق';
        ok.onclick = () => { ov.classList.remove('show'); resolve(true); };
        btns.appendChild(ok);
        ov.classList.add('show');
    });
}

function showConfirm(message, { title = "تأكيد", okText = "نعم", cancelText = "إلغاء", danger = false } = {}) {
    return new Promise((resolve) => {
        const ov = $('alertOverlay'), msg = $('alertMsg'), tl = $('alertTitle'), btns = $('alertBtns');
        tl.textContent = title; msg.textContent = message;
        btns.innerHTML = '';
        const cancel = document.createElement('button');
        cancel.className = 'btn'; cancel.textContent = cancelText;
        cancel.onclick = () => { ov.classList.remove('show'); resolve(false); };
        const ok = document.createElement('button');
        ok.className = 'btn ' + (danger ? 'btn-danger' : 'btn-ok');
        ok.textContent = okText;
        ok.onclick = () => { ov.classList.remove('show'); resolve(true); };
        btns.append(cancel, ok);
        ov.classList.add('show');
    });
}

// -------- API (envelope parsing + logs + overlay)
async function apiCall(op, payload = {}) {
    const body = { op, ...payload };
    console.groupCollapsed(`API ▶ ${op}`); console.log("Request Body:", body);
    incLoading("جارٍ التحديث…");
    try {
        const res = await fetch(API_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const raw = await res.text();
        let data = null;
        try { data = JSON.parse(raw); } catch (_) { console.warn("Top-level not JSON:", raw); }
        if (data && typeof data === "object" && typeof data.body === "string") {
            try { data = JSON.parse(data.body); } catch (_) { }
        }

        console.log("HTTP", res.status); console.log("Parsed Response:", data); console.groupEnd();
        if (!res.ok) throw new Error((data && data.error) ? data.error : "Request failed");
        return data;
    } finally { decLoading(); }
}

// -------- Render
function renderPairs(pairs) {
    const tb = $('pairsBody'); tb.innerHTML = "";
    if (!pairs || !pairs.length) { $('emptyState').style.display = "flex"; return; }
    $('emptyState').style.display = "none";

    for (const row of pairs) {
        const tr = document.createElement("tr");

        // index
        const tdIdx = document.createElement("td");
        tdIdx.textContent = row.index; tr.appendChild(tdIdx);

        // name
        const tdName = document.createElement("td");
        const inName = document.createElement("input");
        inName.type = "text"; inName.value = row.name; inName.disabled = true;
        tdName.appendChild(inName); tr.appendChild(tdName);

        // user
        const tdUser = document.createElement("td");
        const inUser = document.createElement("input");
        inUser.type = "text"; inUser.value = row.user; inUser.disabled = true;
        tdUser.appendChild(inUser); tr.appendChild(tdUser);

        // actions
        const tdAct = document.createElement("td"); tdAct.className = "row-actions";

        const bEdit = document.createElement("button");
        bEdit.className = "btn"; bEdit.textContent = "✏️ تعديل";
        bEdit.onclick = () => {
            inName.disabled = false; inUser.disabled = false;
            bSave.style.display = "inline-block"; bEdit.style.display = "none";
        };

        const bSave = document.createElement("button");
        bSave.className = "btn btn-ok"; bSave.textContent = "💾 حفظ"; bSave.style.display = "none";
        bSave.onclick = async () => {
            const uid = getUserId(); if (!uid) { await showAlert("userId غير موجود"); return; }
            const newName = inName.value.trim(), newUser = inUser.value.trim();
            if (!newName || !newUser) { await showAlert("من فضلك اكتب name و user"); return; }
            try {
                const resp = await apiCall("edit", { userId: uid, index: row.index, name: newName, user: newUser });
                console.log("Edit Saved:", resp);
                await loadData();
            } catch (e) { await showAlert(e.message || "خطأ غير متوقع"); }
        };

        const bDel = document.createElement("button");
        bDel.className = "btn btn-danger"; bDel.textContent = "🗑️ حذف";
        bDel.onclick = async () => {
            const ok = await showConfirm("حذف هذا الصف؟", { title: "تأكيد الحذف", okText: "حذف", danger: true });
            if (!ok) return;
            const uid = getUserId(); if (!uid) { await showAlert("userId غير موجود"); return; }
            try {
                const resp = await apiCall("delete", { userId: uid, index: row.index });
                console.log("Delete Done:", resp);
                await loadData();
            } catch (e) { await showAlert(e.message || "فشل الحذف"); }
        };

        tdAct.append(bEdit, bSave, bDel);
        tr.appendChild(tdAct);
        tb.appendChild(tr);
    }
}

// -------- Actions
async function loadData() {
    const uid = getUserId();
    if (!uid) {
        renderPairs([]); $('counter').innerHTML = `<span>Time</span><span class="num">—</span>&nbsp;`;
        return;
    }
    try {
        const data = await apiCall("fetch", { userId: uid });
        const pairs = Array.isArray(data?.pairs) ? data.pairs : [];
        renderPairs(pairs);
        const cnt = ("time counter" in (data || {})) ? data["time counter"] : null;
        $('counter').innerHTML = `<span>Time</span><span class="num">${(cnt ?? "—")}</span>&nbsp;`;
    } catch (e) {
        console.error(e);
        renderPairs([]); $('counter').innerHTML = `<span>Time</span><span class="num">—</span>&nbsp;`;
        await showAlert(e.message || "تعذر تحميل البيانات");
    }
}

async function addPair() {
    const uid = getUserId(); if (!uid) { await showAlert("userId غير موجود"); return; }
    const name = $('addName').value.trim(), user = $('addUser').value.trim();
    if (!name || !user) { await showAlert("من فضلك اكتب name و user"); return; }
    try {
        const resp = await apiCall("add", { userId: uid, name, user });
        console.log("Add Done:", resp);
        $('addName').value = ""; $('addUser').value = "";
        toggleUserHint(false); // إخفاء الإرشاد بعد الإضافة
        await loadData();
    } catch (e) { await showAlert(e.message || "تعذر الإضافة"); }
}

function reloadData() { loadData(); }

// -------- Hint toggle
function toggleUserHint(forceShow) {
    const wrap = $('userHint');
    if (!wrap) return;
    if (typeof forceShow === 'boolean') {
        wrap.classList.toggle('show', forceShow);
        wrap.setAttribute('aria-hidden', String(!forceShow));
        return;
    }
    const willShow = !wrap.classList.contains('show');
    wrap.classList.toggle('show', willShow);
    wrap.setAttribute('aria-hidden', String(!willShow));
}

// -------- Init
window.addEventListener("DOMContentLoaded", () => {
    loadData();

    const addUserInput = $('addUser');
    if (addUserInput) {
        // اضغط على الحقل = إظهار/إخفاء
        addUserInput.addEventListener('click', () => toggleUserHint());
    }

    // اضغط خارج الحقل = إخفاء
    document.addEventListener('click', (e) => {
        const anchor = document.querySelector('.hint-anchor');
        const hint = $('userHint');
        if (!anchor || !hint) return;
        if (!anchor.contains(e.target)) toggleUserHint(false);
    }, true);
});