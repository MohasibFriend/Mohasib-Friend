document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
});

/// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage
const subscriptionStatus = sessionStorage.getItem('subscriptionStatus'); // جلب حالة الاشتراك من Session Storage
/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
function checkUserId() {
    if (sessionStorage.getItem("userId")) {
      // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
    } else {
      window.location.href = "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?client_id=1v5jdad42jojr28bcv13sgds5r&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
      //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
    }
}

// عند تحميل الصفحة، نفذ الدالة أولاً ثم كل ثانية
window.addEventListener('load', function() {
    checkUserId(); // تنفيذ الدالة عند تحميل الصفحة
    setInterval(checkUserId, 500); // إعادة تنفيذ الدالة كل 1 ثانية
});

const currentMonth = new Date().getMonth() + 1; 

// متغيرات لتخزين البيانات بعد الجلب
let fetchedSales = [];
let fetchedPurchases = [];
let fetchedAggregates = {};

/**
 * دالة getYearFromFileName: استخراج السنة من اسم الملف.
 * يدعم النمط القديم (e.g., "552331333_purchases_02_2024.xlsx")
 * والنمط الجديد (e.g., "552331333_purchases_2024-01.xlsx")
 */
function getYearFromFileName(fullKey) {
  const fileName = fullKey.split("/").pop(); 
  const parts = fileName.split("_");
  let year = "2025"; // القيمة الافتراضية

  for (const part of parts) {
    if (part.startsWith("2024") || part.startsWith("2025")) {
      year = part.split("-")[0];
      break;
    }
  }

  return year;
}

/**
 * دالة extractMonthFromKey: استخراج الشهر من اسم الملف.
 * يدعم النمط القديم (e.g., "552331333_purchases_02_2024.xlsx")
 * والنمط الجديد (e.g., "552331333_purchases_2024-01.xlsx")
 */
function extractMonthFromKey(fullKey) {
  const fileName = fullKey.split("/").pop(); 
  const parts = fileName.split("_");

  if (parts.length >= 4) {
    // النمط القديم: "552331333_purchases_02_2024.xlsx"
    return parts[parts.length - 2];
  } else {
    // النمط الجديد: "552331333_purchases_2024-01.xlsx"
    const lastChunk = parts[parts.length - 1].split(".")[0]; // "2024-01"
    if (lastChunk.includes("-")) {
      const [year, month] = lastChunk.split("-");
      return formatMonth(parseInt(month, 10));
    } else {
      return formatMonth(parseInt(lastChunk, 10));
    }
  }
}

// تنسيق رقم الشهر (01, 02,...)
function formatMonth(month) {
  return month.toString().padStart(2, "0");
}

/**
 * دالة isMonthAllowed:
 * ترجع true إذا كان يجب تفعيل زر التحميل لهذا الشهر وفقاً لنوع الاشتراك والسنة
 */
function isMonthAllowed(month, selectedYear) {
  if (subscriptionStatus === 'ACTIVE') {
    return true;
  } else if (subscriptionStatus === 'FREE_TRIAL') {
    if (selectedYear === '2024') {
      // في 2024 للمشترك التجريبي يُسمح فقط بالشهور 1 و6 و12
      return (month === 1 ||month === 2 || month === 3 ||month === 4 ||month === 5 ||month === 6 ||month === 7 ||month === 8 ||month === 9 || month === 10 ||month === 11 ||month === 12);
    } else if (selectedYear === '2025') {
      // في 2025 للمشترك التجريبي يُسمح بالشهور 1 و6 والشهر (currentMonth - 1)
      return (month === 1 || month === 6 || month === (currentMonth - 1));
    }
  }
  return false;
}

/**
 * دالة loadDeclarationsFromSession:
 * تحاول جلب الإقرارات من السيشن ستورج وعرضها (افتراضيًا لسنة 2025) بدون تأثير الـ drop.
 */
function loadDeclarationsFromSession(resultDiv) {
  const sessionData = sessionStorage.getItem("declarations");
  if (sessionData) {
    try {
      const parsedData = JSON.parse(sessionData);
      fetchedSales = parsedData.sales || [];
      fetchedPurchases = parsedData.purchases || [];
      fetchedAggregates = parsedData.aggregates || {};
      // عرض البيانات افتراضيًا لسنة 2025 بدون تأثير drop
      displayDeclarations(resultDiv, fetchedSales, fetchedPurchases, fetchedAggregates, "2025", false);
      return true;
    } catch (e) {
      console.error("Error parsing session declarations:", e);
      return false;
    }
  }
  return false;
}

// إنشاء العناصر الأساسية
function createPageElements() {
  const resultContainer = document.getElementById("Result");
  if (!resultContainer) {
    alert("Result container not found.");
    return;
  }

  const spinner = document.createElement("div");
  spinner.id = "loadingSpinner";
  spinner.style.position = "absolute";
  spinner.style.top = "70%";
  spinner.style.left = "50%";
  spinner.style.transform = "translate(-50%, -50%)";
  spinner.style.width = "80px";
  spinner.style.height = "80px";
  spinner.style.border = "8px solid #f3f3f3";
  spinner.style.borderTop = "8px solid #3498db";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 1s linear infinite";
  spinner.style.display = "none";
  resultContainer.appendChild(spinner);

  if (window.matchMedia("(max-width: 768px)").matches) { 
      spinner.style.width = "60px";
      spinner.style.height = "60px";
      spinner.style.top = "90%";
      spinner.style.left = "40%";
  }
  
  const container = document.createElement("div");
  container.style.width = "99%";
  container.style.height = "1055px";
  container.style.padding = "5px";
  container.style.backgroundColor = "var(--background-nav)";
  container.style.border = "3px solid black";
  container.style.borderRadius = "20px";
  container.style.marginBottom = "50px";
  container.id = "tt";
  container.className = "tt";

  const resultDiv = document.createElement("div");
  resultDiv.style.height = "1000px";
  resultDiv.style.marginTop = "15px";
  resultDiv.style.padding = "10px";
  resultDiv.style.border = "3px solid black";
  resultDiv.style.borderRadius = "10px";
  resultDiv.style.overflowY = "scroll";
  resultDiv.style.background = "var(--background-companydocs)";
  resultDiv.id = "resultDiv";

  container.appendChild(resultDiv);
  resultContainer.appendChild(container);

  // محاولة جلب الإقرارات من السيشن ستورج أولاً
  const hasSessionData = loadDeclarationsFromSession(resultDiv);
  // إذا لم توجد بيانات في السيشن ستورج يتم تفعيل السبينر وتأثير drop،
  // وإن وُجدت يتم عمل الفيتش بدون السبينر وبدون تأثير drop.
  fetchDataByRegistrationNumber(resultDiv, spinner, !hasSessionData);
}

// جلب البيانات من الـ API مع متغير إضافي لتحديد تشغيل السبينر وتطبيق تأثير drop
async function fetchDataByRegistrationNumber(resultDiv, spinner, showSpinner = true) {
  try {
      if (showSpinner) spinner.style.display = 'block';
      const requestBody = { registration_number: registrationNumber };

      const response = await fetch('https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fech_monthly_decleration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (response.ok) {
          const parsedBody = JSON.parse(responseData.body);

          fetchedSales = parsedBody.sales || [];
          fetchedPurchases = parsedBody.purchases || [];
          fetchedAggregates = {
            aggregate_sales_url: parsedBody.aggregate_sales_url,
            aggregate_sales_sum_w: parsedBody.aggregate_sales_sum_w,
            aggregate_sales_sum_v: parsedBody.aggregate_sales_sum_v,
            aggregate_purchases_url: parsedBody.aggregate_purchases_url,
            aggregate_purchases_sum_w: parsedBody.aggregate_purchases_sum_w,
            aggregate_purchases_sum_v: parsedBody.aggregate_purchases_sum_v,
            aggregate_purchases_yearly: parsedBody.aggregate_purchases_yearly || [],
            aggregate_sales_yearly: parsedBody.aggregate_sales_yearly || [],
            total_sum_v_purchases_yearly: parsedBody.total_sum_v_purchases_yearly || {},
            total_sum_w_purchases_yearly: parsedBody.total_sum_w_purchases_yearly || {},
            total_sum_v_sales_yearly: parsedBody.total_sum_v_sales_yearly || {},
            total_sum_w_sales_yearly: parsedBody.total_sum_w_sales_yearly || {}
          };

          // تحديث السيشن ستورج بالبيانات الجديدة
          const sessionDataToStore = {
            sales: fetchedSales,
            purchases: fetchedPurchases,
            aggregates: fetchedAggregates
          };
          sessionStorage.setItem("declarations", JSON.stringify(sessionDataToStore));

          // عند عرض البيانات بعد الفيتش:
          // إذا لم توجد بيانات من السيشن (showSpinner === true) نطبّق تأثير drop،
          // أما إذا وُجدت بيانات مسبقاً (showSpinner === false) لا نطبّق التأثير.
          displayDeclarations(resultDiv, fetchedSales, fetchedPurchases, fetchedAggregates, "2025", showSpinner);

      } else {
          resultDiv.textContent = `Error fetching data: ${responseData.message || 'Unknown error'}`;
      }
  } catch (error) {
      console.error('Error fetching declarations:', error);
      resultDiv.textContent = 'Error fetching declarations';
  } finally {
      if (showSpinner) spinner.style.display = 'none';
  }
}

/**
 * عرض الإقرارات في الجدول.
 * المعامل animateDrop يتحكم بتطبيق تأثير dropEffect؛
 * إذا كانت قيمته true يتم تطبيق التأثير، وإذا كانت false فلا يُطبَّق.
 */
function displayDeclarations(resultDiv, salesData, purchasesData, aggregateData, selectedYear, animateDrop = true) {
  resultDiv.innerHTML = "";

  // فلترة المبيعات بناءً على السنة
  const sales = (salesData || [])
    .filter(s => getYearFromFileName(s.s3_key) === selectedYear)
    .sort((a, b) => a.s3_key.localeCompare(b.s3_key));
  
  // فلترة المشتريات بناءً على السنة
  const purchases = (purchasesData || [])
    .filter(p => getYearFromFileName(p.s3_key) === selectedYear)
    .sort((a, b) => a.s3_key.localeCompare(b.s3_key));

  const salesMonths = new Map();
  const purchasesMonths = new Map();

  sales.forEach((sale) => {
    const month = extractMonthFromKey(sale.s3_key);
    salesMonths.set(month, sale);
  });

  purchases.forEach((purchase) => {
    const month = extractMonthFromKey(purchase.s3_key);
    purchasesMonths.set(month, purchase);
  });

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.maxHeight = "calc(100vh - 110px)";
  table.style.overflowY = "auto";
  table.style.margin = "20px auto";
  table.style.textAlign = "center";
  // تطبيق تأثير dropEffect فقط إذا animateDrop === true
  table.style.animation = animateDrop ? "dropEffect 0.3s ease-out" : "none";

  const headerRow = document.createElement("tr");
  const headers = ["تاريخ الإقرار", "تحميل المبيعات", "تحميل المشتريات"];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.id = "th";
    th.style.padding = "15px";
    th.style.border = "3px solid black";
    th.style.borderRadius = "15px";
    th.style.backgroundColor = "var(--background-nav)";
    th.style.borderCollapse = "separate";
    th.style.fontSize = "18px";
    th.style.fontWeight = "bold";
    th.style.width = "25%";
    th.style.color = "var(--text-color)";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // إنشاء الصفوف من 1 إلى 12
  for (let month = 1; month <= 12; month++) {
    const formattedMonth = formatMonth(month);

    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.style.padding = "10px";
    dateCell.style.fontSize = "15px";
    dateCell.style.fontWeight = "bold";
    dateCell.style.borderCollapse = "collapse";
    dateCell.style.borderBottom = "3px solid #000"; 
    dateCell.style.color = "var(--text-color)";
    dateCell.textContent = formattedMonth;
    row.appendChild(dateCell);

    function createDownloadButton(downloadUrl, text, isEnabled) {
      if (isEnabled) {
        const button = document.createElement("a");
        button.href = downloadUrl;
        button.textContent = text;
        button.style.padding = "10px";
        button.style.border = "3px solid black";
        button.style.borderRadius = "8px";
        button.style.textDecoration = "none";
        button.style.backgroundColor = "var(--background-nav)";
        button.style.color = "white";
        button.style.fontWeight = "bold";
        button.style.width = "90%";
        button.style.marginLeft = "-10px";
        button.style.alignItems = "center";
        button.style.display = "inline-block";
        button.target = "_blank";
        return button;
      } else {
        const button = document.createElement("button");
        button.textContent = "للمشتركين فقط";
        button.style.padding = "10px";
        button.style.border = "3px solid gray";
        button.style.borderRadius = "8px";
        button.style.backgroundColor = "gray";
        button.style.color = "white";
        button.style.fontWeight = "bold";
        button.style.width = "90%";
        button.style.marginLeft = "-10px";
        button.style.cursor = "not-allowed";
        button.disabled = true;
        return button;
      }
    }

    // خلية المبيعات
    const salesCell = document.createElement("td");
    salesCell.style.padding = "20px";
    salesCell.style.borderCollapse = "collapse";
    salesCell.style.borderBottom = "3px solid #000"; 

    if (salesMonths.has(formattedMonth)) {
      const sale = salesMonths.get(formattedMonth);
      // استخدام الدالة isMonthAllowed لتحديد ما إذا كان ينبغي تفعيل زر التحميل لهذا الشهر
      if (isMonthAllowed(month, selectedYear)) {
        const salesButton = createDownloadButton(sale.download_url, "تحميل المبيعات", true);
        salesCell.appendChild(salesButton);
      } else {
        const salesButton = createDownloadButton(null, "للمشتركين فقط", false);
        salesCell.appendChild(salesButton);
      }
      const sumVDiv = document.createElement("div");
      sumVDiv.textContent = `إجمالي المبيعات: ${sale.sum_v.toLocaleString()}`;
      sumVDiv.style.marginTop = "5px";
      sumVDiv.style.padding = "5px";
      sumVDiv.style.fontSize = "14px";
      sumVDiv.style.color = "var(--text-color)";
      sumVDiv.style.borderRadius = "5px";
      sumVDiv.style.fontWeight = "bold";
      salesCell.appendChild(sumVDiv);

      const sumWDiv = document.createElement("div");
      sumWDiv.textContent = `إجمالي الضريبة : ${sale.sum_w.toLocaleString()}`;
      sumWDiv.style.marginTop = "5px";
      sumWDiv.style.padding = "5px";
      sumWDiv.style.fontSize = "14px";
      sumWDiv.style.color = "var(--text-color)";
      sumWDiv.style.fontWeight = "bold";
      salesCell.appendChild(sumWDiv);
    } else {
      salesCell.textContent = "لا يوجد إقرار";
      salesCell.style.fontWeight = "bold";
      salesCell.style.fontSize = "20px";
      salesCell.style.color = "var(--text-color)";
    }
    row.appendChild(salesCell);

    // خلية المشتريات
    const purchasesCell = document.createElement("td");
    purchasesCell.style.padding = "20px";
    purchasesCell.style.borderCollapse = "collapse";
    purchasesCell.style.borderBottom = "3px solid #000"; 

    if (purchasesMonths.has(formattedMonth)) {
      const purchase = purchasesMonths.get(formattedMonth);
      if (isMonthAllowed(month, selectedYear)) {
        const purchasesButton = createDownloadButton(purchase.download_url, "تحميل المشتريات", true);
        purchasesCell.appendChild(purchasesButton);
      } else {
        const purchasesButton = createDownloadButton(null, "للمشتركين فقط", false);
        purchasesCell.appendChild(purchasesButton);
      }
      const sumVDiv = document.createElement("div");
      sumVDiv.textContent = `إجمالي المشتريات : ${purchase.sum_v.toLocaleString()}`;
      sumVDiv.style.marginTop = "5px";
      sumVDiv.style.padding = "5px";
      sumVDiv.style.fontSize = "14px";
      sumVDiv.style.color = "var(--text-color)";
      sumVDiv.style.fontWeight = "bold";
      purchasesCell.appendChild(sumVDiv);

      const sumWDiv = document.createElement("div");
      sumWDiv.textContent = `إجمالي الضريبة : ${purchase.sum_w.toLocaleString()}`;
      sumWDiv.style.marginTop = "5px";
      sumWDiv.style.padding = "5px";
      sumWDiv.style.fontSize = "14px";
      sumWDiv.style.color = "var(--text-color)";
      sumWDiv.style.fontWeight = "bold";
      sumWDiv.style.borderRadius = "5px";
      purchasesCell.appendChild(sumWDiv);
    } else {
      purchasesCell.textContent = "لا يوجد إقرار";
      purchasesCell.style.fontWeight = "bold";
      purchasesCell.style.fontSize = "20px";
      purchasesCell.style.color = "var(--text-color)";
    }
    row.appendChild(purchasesCell);

    table.appendChild(row);
  }

  // صف التجميع السنوي مع ثلاث خلايا (من اليسار إلى اليمين):
  // 1. إجمالي المشتريات، 2. إجمالي المبيعات، 3. السنة.
  const aggregateRow = document.createElement("tr");

  const totalSumVSales = aggregateData.total_sum_v_sales_yearly[selectedYear] || 0;
  const totalSumWSales = aggregateData.total_sum_w_sales_yearly[selectedYear] || 0;
  const totalSumVPurchases = aggregateData.total_sum_v_purchases_yearly[selectedYear] || 0;
  const totalSumWPurchases = aggregateData.total_sum_w_purchases_yearly[selectedYear] || 0;
  // الخلية الثالثة: السنة
  const yearCell = document.createElement("td");
  yearCell.style.padding = "10px";
  yearCell.style.fontSize = "15px";
  yearCell.style.fontWeight = "bold";
  yearCell.style.borderCollapse = "collapse";
  yearCell.style.borderBottom = "3px solid #000"; 
  yearCell.style.color = "var(--text-color)";
  yearCell.innerHTML = selectedYear;
  aggregateRow.appendChild(yearCell);
 
  // الخلية الثانية: إجمالي المبيعات
  const salesAggregateCell = document.createElement("td");
  salesAggregateCell.style.padding = "10px";
  salesAggregateCell.style.fontSize = "15px";
  salesAggregateCell.style.fontWeight = "bold";
  salesAggregateCell.style.borderCollapse = "collapse";
  salesAggregateCell.style.borderBottom = "3px solid #000"; 
  salesAggregateCell.style.color = "var(--text-color)";
  salesAggregateCell.innerHTML = `
    المبيعات: ${totalSumVSales.toLocaleString()}<br>
    الضريبة: ${totalSumWSales.toLocaleString()}`;
  aggregateRow.appendChild(salesAggregateCell);

  // الخلية الأولى: إجمالي المشتريات
  const purchasesAggregateCell = document.createElement("td");
  purchasesAggregateCell.style.padding = "10px";
  purchasesAggregateCell.style.fontSize = "15px";
  purchasesAggregateCell.style.fontWeight = "bold";
  purchasesAggregateCell.style.borderCollapse = "collapse";
  purchasesAggregateCell.style.borderBottom = "3px solid #000"; 
  purchasesAggregateCell.style.color = "var(--text-color)";
  purchasesAggregateCell.innerHTML = `
    المشتريات: ${totalSumVPurchases.toLocaleString()}<br>
    الضريبة: ${totalSumWPurchases.toLocaleString()}`;
  aggregateRow.appendChild(purchasesAggregateCell);

  table.appendChild(aggregateRow);

  resultDiv.appendChild(table);
}

// زر التحميل للتجميعة السنوية
function createButton(downloadUrl, text, isEnabled = true) {
  if (isEnabled && downloadUrl) {
    const button = document.createElement("a");
    button.href = downloadUrl;
    button.textContent = text;
    button.style.padding = "10px";
    button.style.border = "3px solid black";
    button.style.borderRadius = "8px";
    button.style.textDecoration = "none";
    button.style.backgroundColor = "rgb(86, 123, 216)";
    button.style.color = "white";
    button.style.fontWeight = "bold";
    button.style.width = "90%";
    button.style.marginLeft = "-10px";
    button.style.alignItems = "center";
    button.style.display = "inline-block";
    button.target = "_blank";
    return button;
  } else {
    const button = document.createElement("button");
    button.textContent = "للمشتركين فقط";
    button.style.padding = "10px";
    button.style.border = "3px solid gray";
    button.style.borderRadius = "8px";
    button.style.backgroundColor = "gray";
    button.style.color = "white";
    button.style.fontWeight = "bold";
    button.style.width = "90%";
    button.style.marginLeft = "-10px";
    button.style.cursor = "not-allowed";
    button.disabled = true;
    return button;
  }
}

function initApp() {
  $(document).ready(function () {
    createPageElements();
  });
}

if (typeof jQuery === "undefined") {
  const script = document.createElement("script");
  script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
  script.onload = function () {
    initApp();
  };
  script.onerror = function () {
    console.error("Failed to load jQuery.");
  };
  document.head.appendChild(script);
} else {
  initApp();
}

/* Add the keyframes for the animations */
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes dropEffect {
        0% {
            transform: translateY(-100%);
            opacity: 0;
        }
        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

function showInfo() {
  document.getElementById("infoModal").style.display = "block";
}

function closeModal() {
  document.getElementById("infoModal").style.display = "none";
}

window.onclick = function(event) {
  if (event.target == document.getElementById("infoModal")) {
      closeModal();
  }
}

window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' || event.key === 'Esc') {
      closeModal();
  }
}); // <-- تم إضافة القوس المغلق هنا

// تغيير السنة عند النقر على الراديو
document.addEventListener('DOMContentLoaded', function() {
  const year2024Radio = document.getElementById("year2024");
  const year2025Radio = document.getElementById("year2025");

  year2024Radio.addEventListener("change", function() {
    if (this.checked) {
      const resultDiv = document.getElementById("resultDiv");
      displayDeclarations(resultDiv, fetchedSales, fetchedPurchases, fetchedAggregates, "2024", false);
    }
  });

  year2025Radio.addEventListener("change", function() {
    if (this.checked) {
      const resultDiv = document.getElementById("resultDiv");
      displayDeclarations(resultDiv, fetchedSales, fetchedPurchases, fetchedAggregates, "2025", false);
    }
  });
});
