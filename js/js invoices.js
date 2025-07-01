/* 1. تهيئة الثيم والتحقق من userId */
document.addEventListener('DOMContentLoaded', () => {
  // جلب الثيم من localStorage
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // يمكنك إضافة المزيد من الكود هنا للتعامل مع الإشعارات إذا لزم الأمر
});


/**
 * دالة لإظهار السبينر
 */
function showSpinner() {
    if (typeof $ !== 'undefined') {
        $("#spinner").show();
    } else {
        console.warn("jQuery غير محملة. لا يمكن إظهار السبينر.");
    }
}

/**
 * دالة لإخفاء السبينر
 */
function hideSpinner() {
    if (typeof $ !== 'undefined') {
        $("#spinner").hide();
    } else {
        console.warn("jQuery غير محملة. لا يمكن إخفاء السبينر.");
    }
}

// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const userId = sessionStorage.getItem('userId'); // جلب الـ userId من الـ Session Storage

/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
function checkuserId() {
  if (sessionStorage.getItem("userId")) {
    // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
  } else {
    window.location.href =
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?" +
      "client_id=1v5jdad42jojr28bcv13sgds5r&" +
      "redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&" +
      "response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
    //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
  }
}

// عند تحميل الصفحة، نفذ الدالة أولاً ثم كل نصف ثانية
window.addEventListener('load', function () {
  checkuserId();                  // تنفيذ الدالة عند تحميل الصفحة
  setInterval(checkuserId, 500);  // إعادة تنفيذ الدالة كل 0.5 ثانية
});


/* 2. تحميل jQuery إن لم تكن موجودة ثم تهيئة الصفحة */
if (typeof jQuery === 'undefined') {
  const script = document.createElement('script');
  script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
  script.onload = () => { $(document).ready(initializePage); };
  script.onerror = () => { console.error("Failed to load jQuery."); };
  document.head.appendChild(script);
} else {
  $(document).ready(initializePage);
}

// Function to initialize the page
function initializePage() {
  // إضافة وصف الصفحة باللغتين العربية والإنجليزية إلى الـ Container المحدد
  const pageDescriptionContainer = $('#pageDescription');
  if (!pageDescriptionContainer.length) {
    console.error('Container with id "pageDescription" not found.');
  } else {
    const pageDescriptionArabic = `
            <div class="page-description">
              <div style="
                margin-bottom:20px;
                padding:15px;
                background-color:#fff;
                border:3px solid #000;
                border-radius:20px;
                width:100%;
                font-size:16px;">
                <h3 style="text-align:center;font-weight:bold;color:#000;">دليل الصفحة</h3>
                <p style="text-align:center;font-weight:bold;color:#000;">
                  في هذه الصفحة، تُعرض الفواتير التي تحتوي على أخطاء أو مشاكل،
                  مع توفير ميزة التنبيه ضمن الفترة المسموح بها لتعديل الفاتورة،
                  وذلك لتجنب تعرض الشركة لأي غرامات أو مسائل قانونية.
                </p>
              </div>
            </div>
        `;
    const pageDescriptionEnglish = `
            <div class="page-description">
              <div style="
                margin-bottom:20px;
                padding:15px;
                background-color:#fff;
                border:3px solid #000;
                border-radius:20px;
                width:100%;
                font-size:14px;">
                <h3 style="text-align:center;font-weight:bold;color:#000;">Page Guide</h3>
                <p style="text-align:center;font-weight:bold;color:#000;">
                  On this page, invoices with errors or issues are displayed,
                  with an alert feature within the permitted period for invoice correction,
                  helping the company avoid fines or legal matters.
                </p>
              </div>
            </div>
        `;
    pageDescriptionContainer.append(pageDescriptionArabic);
    pageDescriptionContainer.append(pageDescriptionEnglish);
  }

  // جلب وعرض التنبيهات
  fetchAlarms(userId);
}


/* 3. إضافة لودينج سبينر */

document.body.insertAdjacentHTML('beforeend', spinnerHTML);
document.getElementById('loadingSpinner').style.display = 'flex';




/* 4. جلب البيانات عبر API ومعالجتها */
async function fetchAlarms(userId) {
  const apiUrl = 'https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_invoice_alarm';
  showSpinner();
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        queryStringParameters: { userId: userId || "default" }
      })
    });

    if (!response.ok) {
      console.error("Failed to fetch alarms. Status:", response.status);
      alert("Failed to fetch alarms: " + response.status);
      displayAlarms([]);
      return;
    }

    const data = await response.json();
    if (data && data.body) {
      const parsedBody = JSON.parse(data.body);
      const invoices = Array.isArray(parsedBody.invoices)
        ? parsedBody.invoices
        : [];
      displayAlarms(invoices);
      console.log(invoices)
    } else {
      console.warn("No body data found in API response.");
      displayAlarms([]);
    }
  } catch (error) {
    console.error("Error fetching alarms:", error);
    alert("Error: " + error.message);
    displayAlarms([]);
  } finally {
    hideSpinner();
  }
}

// 5. تنسيق التاريخ
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

/* 5. عرض البيانات في الجدول */
function displayAlarms(invoices) {
  const resultsContainer = $('#RESULTS');
  resultsContainer.empty();

  // داخل displayAlarms(), قبل بناء الجدول:
  const style = document.createElement('style');
  style.innerHTML = `
  @keyframes dropEffect {
    0% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  html, body { height: 100%; margin: 0; }
  #mainContainer {
    display: flex; flex-direction: column; min-height: 100vh;
    font-family: Arial, Helvetica, sans-serif; padding: 20px;
    box-sizing: border-box;
  }
  #alarmsContainer {
    flex-grow: 1; max-height: calc(100vh - 110px);
    overflow-y: auto; padding: 10px; background-color: #fff;
    border-radius: 10px;
  }
  /* يجعل الجدول يحدد عرض الأعمدة حسب المحتوى الأكبر */
  #alarmsTable {
    animation: dropEffect 0.5s ease-out;
    border-radius: 20px; padding: 0;
    table-layout: auto;
    width: 100%;
    border-spacing: 10px;
    overflow-x: auto;
  }
  /* منع كسر النص داخل الخلايا لضمان عرض الكلمة كاملة */
  #alarmsTable th,
  #alarmsTable td {
    white-space: nowrap;
    padding: 10px; font-weight: bold; text-align: center;
    border-collapse: collapse; border-bottom: 3px solid #000;
  }
  #alarmsTable thead th {
    border: 3px solid #000;
    background-color: var(--background-nav);
    color: var(--text-color);
    border-radius: 10px;
  }
`;
  document.head.appendChild(style);

  // بناء الجدول
  const alarmsContainer = `
      <div id="alarmsContainer">
        <table id="alarmsTable">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>نوع الخطأ</th>
              <th>نوع الفاتورة</th>
              <th>رقم الفاتورة</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;
  resultsContainer.append(alarmsContainer);
  const $tbody = $('#alarmsTable tbody');

  if (invoices.length) {
    // ترتيب تنازلي حسب التاريخ
    invoices.sort((a, b) =>
      new Date(b['تاريخ']) - new Date(a['تاريخ'])
    );

    invoices.forEach(inv => {
      $tbody.append(`
              <tr>
                <td>${formatDate(inv['تاريخ'])}</td>
                <td>${inv['نوع الخطأ']}</td>
                <td>${inv['نوع الفاتورة']}</td>
                <td>${inv['رقم الفاتورة']}</td>
              </tr>
            `);
    });
  } else {
    $tbody.append(`<tr><td colspan="4">لا يوجد أخطاء في الفواتير</td></tr>`);
  }

  scrollToResults();
}
/* 6. دوال مساعدة */
function scrollToResults() {
  const resultsContainer = $('#RESULTS');
  if (resultsContainer.length) {
    resultsContainer[0].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function showInfo() {
  document.getElementById("infoModal").style.display = "block";
}

function closeModal() {
  document.getElementById("infoModal").style.display = "none";
}

// إغلاق المودال عند النقر خارج المحتوى
window.onclick = event => {
  if (event.target == document.getElementById("infoModal")) {
    closeModal();
  }
};

// إغلاق المودال عند الضغط على مفتاح Esc
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    closeModal();
  }
});
