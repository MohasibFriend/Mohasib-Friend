/* 1. تهيئة الثيم والتحقق من userId */
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
});

function showSpinner() {
  if (typeof $ !== 'undefined') {
    $("#spinner").show();
  } else {
    console.warn("jQuery غير محملة. لا يمكن إظهار السبينر.");
  }
}

function hideSpinner() {
  if (typeof $ !== 'undefined') {
    $("#spinner").hide();
  } else {
    console.warn("jQuery غير محملة. لا يمكن إخفاء السبينر.");
  }
}

// جلب الـ userId من الـ Session Storage
const userId = sessionStorage.getItem('userId');

function checkUserId() {
  if (!userId) {
    window.location.href =
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?" +
      "client_id=1v5jdad42jojr28bcv13sgds5r&" +
      "redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&" +
      "response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
  }
}

window.addEventListener('load', () => {
  checkUserId();
  setInterval(checkUserId, 500);
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

function initializePage() {
  // إضافة وصف الصفحة
  const pageDescriptionContainer = $('#pageDescription');
  if (pageDescriptionContainer.length) {
    pageDescriptionContainer.append(/* Arabic guide */ `
      <div class="page-description" style="...">
        <h3>دليل الصفحة</h3>
        <p>في هذه الصفحة، تُعرض الفواتير التي تحتوي على أخطاء...</p>
      </div>
    `).append(/* English guide */ `
      <div class="page-description" style="...">
        <h3>Page Guide</h3>
        <p>On this page, invoices with errors or issues are displayed...</p>
      </div>
    `);
  }

  // جلب وعرض التنبيهات
  fetchAlarms(userId);

  // التعامل مع زر "عرض التفاصيل"
  $(document).on('click', '.detailsBtn', function () {
    const invNo = $(this).data('invoice-number');
    const invDate = $(this).data('invoice-date');
    fetchInvoiceDetails(invNo, invDate);
  });
}

/* 3. تحميل لودينج سبينر */
document.body.insertAdjacentHTML('beforeend', spinnerHTML);
$('#loadingSpinner').css('display', 'none');


/* 4. جلب البيانات عبر API ومعالجتها */
async function fetchAlarms(userId) {
  const apiUrl = 'https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_invoice_alarm';
  showSpinner();
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryStringParameters: { userId: userId || "default" } })
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const body = data.body ? JSON.parse(data.body) : {};
    displayAlarms(Array.isArray(body.invoices) ? body.invoices : []);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch alarms: " + err.message);
    displayAlarms([]);
  } finally {
    hideSpinner();
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

/* 5. عرض الفواتير مع زر التفاصيل */
function displayAlarms(invoices) {
  const resultsContainer = $('#RESULTS').empty();

  // إضافة أنماط الجدول
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes dropEffect {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    #alarmsContainer {
      overflow-y: auto;
      background: #fff;
      padding: 10px;
      border-radius: 10px;
    }

    #alarmsTable {
      width: 100%;
      animation: dropEffect 0.5s;
      border-spacing: 10px;
    }

    #alarmsTable th,
    #alarmsTable td {
      white-space: nowrap;
      padding: 10px;
      text-align: center;
      border-bottom: 3px solid #000;
      font-weight: bold;
    }

    #alarmsTable thead th {
      background: var(--background-nav);
      color: var(--text-color);
      border: 3px solid #000;
      border-radius: 10px;
      position: sticky;
      top: 0;
    }

    .detailsBtn {
      padding: 5px 10px;
      border: none;
      font-weight: bold;
      background: var(--background-nav);
      color: var(--text-color);
      border-radius: 5px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // بناء هيكل الجدول
  resultsContainer.append(`
    <div id="alarmsContainer">
      <table id="alarmsTable">
        <thead>
          <tr>
            <th>تفصيل الفاتوره</th>
            <th>التاريخ</th>
            <th>نوع الخطأ</th>
            <th>نوع الفاتورة</th>
            <th>رقم الفاتورة</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `);

  const $tbody = $('#alarmsTable tbody');
  if (invoices.length) {
    invoices.sort((a, b) => new Date(b['تاريخ']) - new Date(a['تاريخ']));
    invoices.forEach(inv => {
      $tbody.append(`
        <tr>
          <td>
            <button class="detailsBtn"
                    data-invoice-number="${inv['رقم الفاتورة']}"
                    data-invoice-date="${inv['تاريخ']}">
              عرض التفاصيل
            </button>
          </td>
          <td>${formatDate(inv['تاريخ'])}</td>
          <td>${inv['نوع الخطأ']}</td>
          <td>${inv['نوع الفاتورة']}</td>
          <td>${inv['رقم الفاتورة']}</td>
        </tr>
      `);
    });
  } else {
    $tbody.append(`<tr><td colspan="5">لا يوجد أخطاء في الفواتير</td></tr>`);
  }

  scrollToResults();
}

/* 6. جلب تفاصيل فاتورة محددة */
function fetchInvoiceDetails(invoiceNumber, invoiceDate) {
  const apiUrl = 'https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf-fetch-invoice-alarm-detiles';
  showSpinner();
  $('#alarmsContainer').hide();

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: sessionStorage.getItem('userId') || "default",
      invoiceNumber,
      invoiceDate
    })
  })
    .then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(data => {
      const body = data.body ? JSON.parse(data.body) : data;
      console.log(body.invoiceLines)
      displayDetails(body.invoiceLines || []);
    })
    .catch(err => {
      console.error(err);
      alert("خطأ في جلب التفاصيل: " + err.message);
      $('#alarmsContainer').show();
    })
    .finally(() => hideSpinner());
}

/* 7. عرض جدول التفاصيل */
function displayDetails(lines) {
  const resultsContainer = $('#RESULTS').empty();

  // 1) إضافة زرّ الرجوع
  resultsContainer.append(`<button id="backBtn" class="backBtn">رجوع</button>`);

  // 2) إضافة أنماط الزرّ وطراز الجدول (مطابقة لطراز alarmsTable)
  const style = document.createElement('style');
style.innerHTML = `
  .backBtn {
    display: block;
    margin: 0 auto 12px auto;
    margin-top:10px;
    padding: 8px 14px;
    background: var(--background-nav);
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    color: var(--text-color);
    transition:0.3s;
  }

  .backBtn:hover {
    background: var(--download-company-hover);
  }

  @keyframes dropEffect { 
    from { transform: translateY(-100%); opacity:0; } 
    to   { transform: translateY(0);      opacity:1; } 
  }

  #detailsContainer {
    direction: rtl;
    overflow-y: auto;
    background: #fff;
    padding: 10px;
    border-radius: 10px;
  }

  #detailsTable {
    width: 100%;
    animation: dropEffect 0.5s;
    border-spacing: 10px;
  }

  #detailsTable th,
  #detailsTable td {
    white-space: nowrap;
    padding: 10px;
    text-align: center;
    border-bottom: 3px solid #000;
  }

  #detailsTable thead th {
    background: var(--background-nav);
    color: var(--text-color);
    border: 3px solid #000;
    border-radius: 10px;
    position: sticky;
    top: 0;
  }
`;
document.head.appendChild(style);
  // 3) ربط حدث الضغط على زرّ الرجوع
  $(document).off('click', '#backBtn').on('click', '#backBtn', () => {
    fetchAlarms(userId);
  });

  // 4) بناء جدول التفاصيل
  if (lines.length) {
    const cols = Object.keys(lines[0]);
    let html = `<div id="detailsContainer"><table id="detailsTable"><thead><tr>`;
    cols.forEach(c => html += `<th>${c}</th>`);
    html += `</tr></thead><tbody>`;
    lines.forEach(line => {
      html += `<tr>`;
      cols.forEach(c => html += `<td>${line[c] != null ? line[c] : ''}</td>`);
      html += `</tr>`;
    });
    html += `</tbody></table></div>`;
    resultsContainer.append(html);
  } else {
    resultsContainer.append('<p>لا توجد تفاصيل للفاتورة.</p>');
  }

  // 5) تمرير الشاشة إلى جدول التفاصيل
  document.getElementById('RESULTS').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* 8. دوال مساعدة */
function scrollToResults() {
  const el = document.getElementById('RESULTS');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showInfo() {
  document.getElementById("infoModal").style.display = "block";
}

function closeModal() {
  document.getElementById("infoModal").style.display = "none";
}

window.onclick = event => {
  if (event.target === document.getElementById("infoModal")) {
    closeModal();
  }
};

window.addEventListener('keydown', event => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    closeModal();
  }
});
