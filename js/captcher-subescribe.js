/* =============================
  Session & theme
==============================*/
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

/* =============================
  Config
==============================*/
const API_URL_CREATE = 'https://ul5i2a4nke.execute-api.us-east-1.amazonaws.com/prod/captcha-credit';
const API_URL_COUNTER = 'https://ul5i2a4nke.execute-api.us-east-1.amazonaws.com/prod/captcha-counter';
const PLANS = [
    { key: 'plan1', egp: 44.60, times: 1_000 },
    { key: 'plan2', egp: 225.00, times: 5_000 },
    { key: 'plan3', egp: 450.00, times: 10_000 },
    { key: 'plan4', egp: 900.00, times: 20_000 },
    { key: 'plan5', egp: 2252.00, times: 50_000 },
    { key: 'plan6', egp: 4505.00, times: 100_000 },
];
const SS_EMAIL = 'email', SS_PHONE = 'phone_number', SS_USER = 'userId', SS_LAST_PLAN = 'lastPlan';
const OK_REDIRECT = 'https://mohasibfriend.com/captcher-control.html';
const FAIL_REDIRECT = 'https://mohasibfriend.com/captcher-subescribe.html';

/* =============================
  Helpers
==============================*/
const $ = (id) => document.getElementById(id);
const toast = (msg) => {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3500);
};
const showOverlay = () => $('overlay').classList.add('show');
const hideOverlay = () => $('overlay').classList.remove('show');

const extractUrl = (str = '') => {
    const m = String(str).match(/https?:\/\/\S+/);
    return m ? m[0] : null;
};
const pickUrl = (data, rawText) => {
    if (!data) return extractUrl(rawText);
    if (typeof data === 'string') {
        try { const j = JSON.parse(data); return pickUrl(j, data); }
        catch { return extractUrl(data); }
    }
    if (typeof data.url === 'string') return data.url;

    if (data.body) {
        if (typeof data.body === 'string') {
            try {
                const inner = JSON.parse(data.body);
                if (inner && inner.url) return inner.url;
            } catch { }
            const u = extractUrl(data.body);
            if (u) return u;
        } else if (typeof data.body === 'object' && data.body.url) {
            return data.body.url;
        }
    }
    return extractUrl(rawText);
};

const qs = new URLSearchParams(location.search);
const isChargeResponse = () => qs.get('type') === 'ChargeResponse';
const isPaid = () => (qs.get('statusCode') === '200' || qs.get('orderStatus') === 'PAID');

function getPlanByKey(k) {
    return PLANS.find(p => p.key === k);
}

/* =============================
  UI: render plans
==============================*/
function renderPlans() {
    const wrap = $('plans');
    wrap.innerHTML = '';

    PLANS.forEach(p => {
        const node = document.createElement('div');
        node.className = 'plan';
        node.innerHTML = `
            <h3>Plan #${p.key.replace('plan', '')}</h3>
            <div class="price">${p.egp.toLocaleString('en-US')} EGP</div>
            <div class="times">${p.times.toLocaleString('en-US')} times</div>
            <button class="btn" data-plan="${p.key}">Subscribe now</button>
          `;
        wrap.appendChild(node);
    });

    wrap.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-plan]');
        if (!btn) return;
        const key = btn.getAttribute('data-plan');
        sessionStorage.setItem(SS_LAST_PLAN, key); // حفظ الخطة المختارة للرجوع من الدفع
        await purchase(key);
    });
}

/* =============================
  Purchase → goes to payment link
==============================*/
async function purchase(planKey) {
    const userId = sessionStorage.getItem(SS_USER);
    const phone = sessionStorage.getItem(SS_PHONE);
    const email = sessionStorage.getItem(SS_EMAIL);

    if (!userId || !phone) {
        toast('⚠️ Missing user data in this browser.');
        return;
    }

    const payload = { userId, phone, plan: planKey, emails: email ? [email] : [] };

    showOverlay();
    try {
        const res = await fetch(API_URL_CREATE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await res.text();
        let data = null; try { data = JSON.parse(text); } catch { }

        console.log('HTTP status:', res.status, 'ok?', res.ok);
        console.log('Raw response text:', text);
        console.log('Parsed top-level JSON:', data);

        const url = pickUrl(data, text);
        console.log('Extracted payment URL:', url);

        if (url) {
            window.location.href = url;
            return;
        }
        toast('Could not generate checkout link.');
    } catch (err) {
        console.error(err);
        toast('Server connection failed.');
    } finally {
        hideOverlay();
    }
}

/* =============================
  Result modal logic
==============================*/
function showResult(ok, message) {
    const wrap = $('result');
    const icon = $('resIcon');
    const title = $('resTitle');
    const sub = $('resSub');
    const btn = $('resBtn');

    if (ok) {
        icon.className = 'result-icon ok';
        icon.textContent = '✓';
        title.textContent = 'تم الدفع';
        sub.textContent = message || 'تمت العملية بنجاح.';
        btn.className = 'result-btn ok';
        btn.textContent = 'تم';
        btn.onclick = () => window.location.href = OK_REDIRECT;
        wrap.onclick = () => window.location.href = OK_REDIRECT; // الكليك برّه يعمل نفس وظيفة الزر
    } else {
        icon.className = 'result-icon err';
        icon.textContent = '✕';
        title.textContent = 'خطأ في عملية الدفع';
        sub.textContent = message || 'يرجى إعادة المحاولة.';
        btn.className = 'result-btn err';
        btn.textContent = 'حسناً';
        btn.onclick = () => window.location.href = FAIL_REDIRECT;
        wrap.onclick = () => window.location.href = FAIL_REDIRECT;
    }

    wrap.setAttribute('aria-hidden', 'false');
    wrap.classList.add('show');
}

async function creditAfterSuccess() {
    // منع التكرار لو رجع المستخدم يعمل Refresh
    const ref = qs.get('referenceNumber') || qs.get('merchantRefNumber') || '';
    const dedupeKey = `counter_done_${ref}`;
    if (ref && sessionStorage.getItem(dedupeKey) === '1') {
        console.log('Counter already updated for this reference.');
        return;
    }

    const userId = sessionStorage.getItem(SS_USER);
    const planKey = sessionStorage.getItem(SS_LAST_PLAN);
    const plan = getPlanByKey(planKey || '');

    if (!userId || !plan) {
        console.warn('Missing userId or plan to credit.');
        return;
    }

    const payload = {
        userId,
        plan: planKey,
        times: plan.times
    };

    try {
        const res = await fetch(API_URL_COUNTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log('Counter API response:', res.status, text);
        // اعتبر أي 2xx نجاح
        if (res.ok && ref) { sessionStorage.setItem(dedupeKey, '1'); }
    } catch (err) {
        console.error('Counter API error', err);
    }
}

/* =============================
  Init
==============================*/
document.addEventListener('DOMContentLoaded', () => {
    // لو دي صفحة الرجوع من الدفع:
    if (isChargeResponse()) {
        // تحديد النجاح/الفشل
        const ok = isPaid();
        // رسالة مختصرة (اختياري)
        const msg = ok
            ? 'تم تأكيد الدفع وسيتم تفعيل رصيد الخطة الآن.'
            : 'فشل الدفع. يرجى المحاولة مرة أخرى.';

        // لو ناجح نزود الرصيد قبل عرض الرسالة
        if (ok) { creditAfterSuccess(); }

        showResult(ok, msg);
        return; // ما نرندرش الخطط هنا
    }

    // وإلا نعرض الخطط كالمعتاد
    renderPlans();

});

