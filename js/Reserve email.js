const API_URL = 'https://c9zlhqnedk.execute-api.us-east-1.amazonaws.com/prod/add-email';
const overlay = document.getElementById('overlay-spinner');
const popup = document.getElementById('error-popup');

function showOverlay() { overlay.style.display = 'flex'; }
function hideOverlay() { overlay.style.display = 'none'; }
function showError(msg) {
    popup.textContent = msg;
    popup.style.display = 'block';
    setTimeout(() => popup.style.display = 'none', 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('sessionId'))
        sessionStorage.setItem('sessionId', crypto.randomUUID());

    setupCountdown();
    showEmail();
    document.getElementById('verify-btn').onclick = onVerify;
    document.getElementById('add-email-btn').onclick = onAdd;
    document.getElementById('resend-btn').onclick = onResend;
});

function showEmail() {
    document.getElementById('email-container').style.display = 'block';
    document.getElementById('code-container').style.display = 'none';
}
function showCode() {
    document.getElementById('email-container').style.display = 'none';
    document.getElementById('code-container').style.display = 'block';
}
function validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

async function onVerify() {
    const email = document.getElementById('email-input').value.trim();
    if (!validEmail(email)) return showError('أدخل بريدًا صحيحًا.');

    showOverlay();
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: sessionStorage.getItem('userId'),
                sessionId: sessionStorage.getItem('sessionId'),
                email
            })
        });
        const data = await res.json();
        hideOverlay();
        if ((data.statusCode ?? res.status) === 200) {
            sessionStorage.setItem('email2', email);
            showCode();
            startCountdown(40);
        } else {
            showError(data.message || 'خطأ في الإرسال.');
        }
    } catch {
        hideOverlay();
        showError('حصل خطأ. حاول مرة أخرى.');
    }
}

async function onAdd() {
    const code = document.getElementById('code-input').value.trim();
    if (!/^\d{6}$/.test(code)) return showError('أدخل رمزًا مكوّنًا من 6 أرقام.');

    showOverlay();
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: sessionStorage.getItem('userId'),
                sessionId: sessionStorage.getItem('sessionId'),
                email: sessionStorage.getItem('email2'),
                verificationCode: code
            })
        });
        const p = await res.json();
        hideOverlay();
        const status = p.statusCode ?? res.status;
        let msg = p.message || (p.body && JSON.parse(p.body).message);

        if (status === 200) {
            location.href = 'home.html';
        } else if (status === 409) {
            showEmail(); showError(msg || 'هذا البريد مستخدم.');
        } else if (status === 400) {
            showError(msg || 'رمز التحقق غير صحيح.');
        } else {
            showError(msg || 'حصل خطأ. حاول مرة أخرى.');
        }
    } catch {
        hideOverlay();
        showError('حصل خطأ. حاول مرة أخرى.');
    }
}

async function onResend() {
    showOverlay();
    const btn = document.getElementById('resend-btn');
    btn.disabled = true;
    startCountdown(40);
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: sessionStorage.getItem('userId'),
                sessionId: sessionStorage.getItem('sessionId'),
                email: sessionStorage.getItem('email2'),
                resend: true
            })
        });
        const d = await res.json();
        hideOverlay();
        if (res.status !== 200 && d.message) showError(d.message);
    } catch {
        hideOverlay();
        showError('حصل خطأ. حاول مرة أخرى.');
    }
}

function setupCountdown() {
    const enc = sessionStorage.getItem('resendExpiry');
    if (!enc) return;
    const rem = parseInt(atob(enc), 10) - Math.floor(Date.now() / 1000);
    if (rem > 0) startCountdown(rem);
}

function startCountdown(sec) {
    const exp = Math.floor(Date.now() / 1000) + sec;
    sessionStorage.setItem('resendExpiry', btoa(exp + ""));
    const btn = document.getElementById('resend-btn');
    btn.disabled = true;
    updateTimer(sec);
    const iv = setInterval(() => {
        const rem = parseInt(atob(sessionStorage.getItem('resendExpiry')), 10)
            - Math.floor(Date.now() / 1000);
        if (rem <= 0) {
            clearInterval(iv);
            btn.textContent = 'Resend';
            btn.disabled = false;
        } else updateTimer(rem);
    }, 500);
}
function updateTimer(s) {
    document.getElementById('resend-btn').textContent = `Resend (${s}s)`;
}
