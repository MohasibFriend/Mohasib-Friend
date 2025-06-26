function checkUserId() {
    if (sessionStorage.getItem("userId")) {
        // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
    } else {
        window.location.href = "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?client_id=1v5jdad42jojr28bcv13sgds5r&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
        //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
    }
}

// عند تحميل الصفحة، نفذ الدالة أولاً ثم كل ثانية
window.addEventListener('load', function () {
    checkUserId(); // تنفيذ الدالة عند تحميل الصفحة
    setInterval(checkUserId, 500); // إعادة تنفيذ الدالة كل 1 ثانية
});
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const spinnerDiv = document.getElementById('spinner');

function showSpinner() {
    document.getElementById('overlay').style.display = 'block';
    spinnerDiv.style.display = 'block';
}
function hideSpinner() {
    spinnerDiv.style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

const saveBtn = document.getElementById('saveBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const alertPlc = document.getElementById('alertPlaceholder');
const toggleOld = document.getElementById('toggleOld');
const toggleNew = document.getElementById('toggleNew');
const oldPwdInp = document.getElementById('oldPassword');
const newPwdInp = document.getElementById('newPassword');
const yesBtn = document.getElementById('confirmYes');
const noBtn = document.getElementById('confirmNo');

[{ btn: toggleOld, inp: oldPwdInp }, { btn: toggleNew, inp: newPwdInp }].forEach(pair => {
    pair.btn.addEventListener('click', () => {
        const icon = pair.btn.querySelector('i');
        if (pair.inp.type === 'password') {
            pair.inp.type = 'text';
            icon.classList.replace('bi-eye', 'bi-eye-slash');
        } else {
            pair.inp.type = 'password';
            icon.classList.replace('bi-eye-slash', 'bi-eye');
        }
    });
});

saveBtn.addEventListener('click', () => {
    confirmModal.show();
});
noBtn.addEventListener('click', () => {
    confirmModal.hide();
});

yesBtn.addEventListener('click', async () => {
    confirmModal.hide();
    showSpinner();
    clearAlert();
    const userId = sessionStorage.getItem('userId');
    const oldPassword = oldPwdInp.value.trim();
    const newPassword = newPwdInp.value.trim();
    if (!userId || !oldPassword || !newPassword) {
        showAlert('danger', 'Please complete all data');
        hideSpinner();
        return;
    }

    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');

    try {
        const res = await fetch(
            'https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_change_password',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, oldPassword, newPassword })
            }
        );
        let data = await res.json();
        if (data.body && typeof data.body === 'string') {
            try { data = JSON.parse(data.body); } catch { }
        }
        const msg = data.message || '';
        if (msg.includes('نجاح') || msg.includes('تم تغيير كلمة المرور')) {
            showAlert('success', 'تم تغيير كلمة المرور بنجاح');
        } else {
            showAlert('danger', 'كلمة المرور خطأ - يرجى إعادة المحاولة');
        }
    } catch {
        showAlert('danger', 'حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
        btnSpinner.classList.add('d-none');
        btnText.classList.remove('d-none');
        hideSpinner();
        oldPwdInp.value = '';
        newPwdInp.value = '';
    }
});

function showAlert(type, message) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
    alertPlc.append(wrapper);
    setTimeout(() => {
        bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert')).close();
    }, 4000);
}
function clearAlert() {
    alertPlc.innerHTML = '';
}