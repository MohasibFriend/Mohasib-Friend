// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem("registrationNumber"); // جلب الرقم التسجيلي من Session Storage
const subscriptionStatus = sessionStorage.getItem("subscriptionStatus"); // جلب حالة الاشتراك من Session Storage
const userId = sessionStorage.getItem("userId");

/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
function checkUserId() {
  if (sessionStorage.getItem("userId")) {
    // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
  } else {
    window.location.href =
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?client_id=1v5jdad42jojr28bcv13sgds5r&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
    //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
  }
}

// عند تحميل الصفحة، نفذ الدالة أولاً ثم كل ثانية
window.addEventListener("load", function () {
  checkUserId(); // تنفيذ الدالة عند تحميل الصفحة
  setInterval(checkUserId, 500); // إعادة تنفيذ الدالة كل 1 ثانية
});

document.addEventListener("DOMContentLoaded", () => {
  // جلب الثيم من localStorage
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
});

/**
 * دالة لإظهار السبينر
 */
function showSpinner() {
  $("#spinner").show();
}

/**
 * دالة لإخفاء السبينر
 */
function hideSpinner() {
  $("#spinner").hide();
}

// Function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  const currentDate = new Date();
  return currentDate.toISOString().split("T")[0];
}

// إعداد الأنماط للجدول والرسوميات
const style = document.createElement("style");
style.innerHTML = `
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

    /* نمط الزر المعطل */
    .disabled-button {
        background-color: #2c2c2c !important;
        cursor: not-allowed;
        opacity: 0.6;
    }
  `;
document.head.appendChild(style);

/**
 * دالة لتحميل بيانات الملفات (اليوميّة) من الـ sessionStorage إذا كانت موجودة
 */
function loadFilesFromSession() {
  const sessionData = sessionStorage.getItem("files");
  if (sessionData) {
    try {
      return JSON.parse(sessionData);
    } catch (e) {
      console.error("Error parsing session files:", e);
      return null;
    }
  }
  return null;
}

/**
 * دالة لإنشاء العناصر الديناميكية داخل حاوية "Result"
 */
function createPageElements() {
  const resultContainer = document.getElementById("Result");
  if (!resultContainer) {
    alert("Result container not found.");
    return;
  }

  // إنشاء زر تحميل الملف (لو حبيت تستخدمه بعدين)
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "fileUpload";
  fileInput.accept = ".xlsx";
  fileInput.style.marginTop = "10px";
  fileInput.style.fontWeight = "bold";
  fileInput.style.fontFamily = "Arial, Helvetica, sans-serif";
  fileInput.style.backgroundColor = "#a3b6e5";
  fileInput.style.borderRadius = "20px";
  fileInput.style.display = "none";
  fileInput.style.border = "3px solid black";

  // إنشاء جدول لعرض الملفات
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.backgroundColor = "var(--background-navbar)";
  table.style.marginTop = "20px";
  table.style.fontFamily = "Arial, Helvetica, sans-serif";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["التاريخ", "تحميل اليوميه"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.style.border = "3px solid black";
    th.style.borderRadius = "10px";
    th.style.backgroundColor = "var(--background-nav)";
    th.style.padding = "10px";
    th.style.textAlign = "center";
    th.style.height = "50px";
    th.style.color = "var(--text-color)";
    th.style.width = "50%";
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  resultContainer.appendChild(fileInput);
  resultContainer.appendChild(table);

  // محاولة جلب البيانات من الـ sessionStorage
  const sessionFiles = loadFilesFromSession();
  if (sessionFiles) {
    // إذا كانت البيانات موجودة، يتم عرضها بدون تأثير drop
    updateTable(sessionFiles, false);
  }
  // إذا لم توجد بيانات، يتم تفعيل السبينر وتطبيق تأثير drop عند التحديث
  fetchAndDisplayExistingFile(!sessionFiles);
}

/**
 * دالة لجلب الملفات من الـ API وتحديث الجدول
 * @param {boolean} showSpinnerFlag - إذا كانت true يتم إظهار السبينر وتطبيق تأثير drop
 */
async function fetchAndDisplayExistingFile(showSpinnerFlag = true) {
  if (showSpinnerFlag) showSpinner();
  if (!registrationNumber) {
    console.error("Registration number not found in session storage.");
    if (showSpinnerFlag) hideSpinner();
    return;
  }

  try {
    const payload = { userId: userId };

    const response = await fetch(
      "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_journal",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const parsedBody = JSON.parse(data.body);

      let filesData = {};
      if (parsedBody.files && Object.keys(parsedBody.files).length > 0) {
        filesData = parsedBody.files;
      } else {
        console.warn("No files found in the response.");
      }
      // تحديث الـ sessionStorage بالبيانات الجديدة
      sessionStorage.setItem("files", JSON.stringify(filesData));
      // عرض البيانات
      updateTable(filesData, showSpinnerFlag);
    } else {
      console.error("Failed to fetch existing file from database.");
    }
  } catch (error) {
    console.error("Error fetching existing file:", error);
  } finally {
    if (showSpinnerFlag) hideSpinner();
  }
}

/**
 * دالة لتحديث الجدول بالملفات المستخرجة
 * @param {Object} files - كائن يحتوي على أسماء الملفات وروابط التحميل
 * @param {boolean} animateDrop - إذا كانت true يتم تطبيق تأثير dropEffect، وإلا فلا
 */
function updateTable(files, animateDrop = true) {
  const table = document.querySelector("table");
  if (table) {
    table.style.animation = animateDrop ? "dropEffect 0.3s ease-out" : "none";
  }

  const tbody = document.querySelector("tbody");
  tbody.innerHTML = ""; // مسح المحتويات السابقة

  // التحقق مما إذا كانت هناك ملفات لعرضها
  if (Object.keys(files).length === 0) {
    const row = document.createElement("tr");
    const noDataCell = document.createElement("td");
    noDataCell.colSpan = 2;
    noDataCell.textContent = "لا توجد ملفات متاحة.";
    noDataCell.style.textAlign = "center";
    noDataCell.style.padding = "20px";
    noDataCell.style.fontSize = "18px";
    noDataCell.style.color = "var(--text-color)";
    row.appendChild(noDataCell);
    tbody.appendChild(row);
    return;
  }

  Object.keys(files).forEach((filename) => {
    const downloadUrl = files[filename];

    // منطق استخراج السنة بناءً على تنسيق اسم الملف
    let extractedYear = "N/A"; // القيمة الافتراضية

    // محاولة مطابقة التاريخ الكامل بصيغة يمكن أن تكون إما YYYY-MM-DD أو D-M-YYYY
    const fullDateMatch = filename.match(/_(\d{1,2}-\d{1,2}-\d{4})\.xlsx$/);
    if (fullDateMatch) {
      const dateParts = fullDateMatch[1].split("-");
      // إذا كان الجزء الأول عبارة عن 4 أرقام، نفترض الصيغة YYYY-MM-DD
      if (dateParts[0].length === 4) {
        extractedYear = dateParts[0];
      }
      // وإلا، إذا كان الجزء الأخير عبارة عن 4 أرقام، نفترض الصيغة D-M-YYYY
      else if (dateParts[2] && dateParts[2].length === 4) {
        extractedYear = dateParts[2];
      } else {
        extractedYear = getCurrentDate();
      }
    } else {
      // إذا لم يكن هناك تاريخ كامل، نحاول مطابقة السنة فقط
      const yearMatch = filename.match(/_(\d{4})\.xlsx$/);
      if (yearMatch) {
        extractedYear = yearMatch[1];
      } else {
        extractedYear = getCurrentDate();
      }
    }

    console.log("FILE:", filename, "=> YEAR:", extractedYear);

    const row = document.createElement("tr");

    // عمود التاريخ
    const dateCell = document.createElement("td");
    dateCell.textContent = extractedYear;
    dateCell.style.fontSize = "18px";
    dateCell.style.fontWeight = "bold";
    dateCell.style.textAlign = "center";
    dateCell.style.fontFamily = "Arial, Helvetica, sans-serif";
    dateCell.style.color = "var(--text-color)";
    row.appendChild(dateCell);

    // عمود تحميل اليومية
    const downloadCell = document.createElement("td");
    downloadCell.style.textAlign = "center";
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.style.fontWeight = "bold";
    downloadBtn.style.fontFamily = "Arial, Helvetica, sans-serif";
    downloadBtn.style.display = "block";
    downloadBtn.style.margin = "10px auto";
    downloadBtn.style.width = "100%";
    downloadBtn.style.transition = "0.3s";
    downloadBtn.style.height = "50px";
    downloadBtn.style.backgroundColor = "var(--background-nav)";
    downloadBtn.style.border = "2px solid black";
    downloadBtn.style.borderRadius = "10px";
    downloadBtn.style.color = "var(--text-color)";
    downloadBtn.style.cursor = "pointer";

    // تأثيرات التمرير للزر
    downloadBtn.addEventListener("mouseover", function () {
      downloadBtn.style.backgroundColor = "var(--download-company-hover)";
      downloadBtn.style.color = "#fff";
      downloadBtn.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.2)";
    });

    downloadBtn.addEventListener("mouseout", function () {
      downloadBtn.style.backgroundColor = "var(--background-nav)";
      downloadBtn.style.color = "var(--text-color)";
      downloadBtn.style.boxShadow = "none";
    });

    // ✅ التحقق من حالة الاشتراك أو إذا كان الملف ينتمي لأحد الأعوام 2024 أو 2025 أو 2026
    if (["2024", "2025", "2026"].includes(extractedYear)) {
      // لو الملف لأي سنة من 2024 أو 2025 أو 2026 يبقى متاح تحميله للجميع
      downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      if (subscriptionStatus === "ACTIVE") {
        downloadBtn.addEventListener("click", () => {
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else if (subscriptionStatus === "FREE_TRIAL") {
        downloadBtn.textContent = "للمشتركين فقط";
        downloadBtn.disabled = true;
        downloadBtn.classList.add("disabled-button");
        downloadBtn.style.color = "#fff";
        downloadBtn.style.fontWeight = "bold";
        downloadBtn.style.fontSize = "18px";
        downloadBtn.style.cursor = "not-allowed";
      }
    }

    downloadCell.appendChild(downloadBtn);
    row.appendChild(downloadCell);

    // إضافة زر "Update" (مخفي حالياً، لو حبيت تستخدمه بعدين)
    const updateCell = document.createElement("td");
    updateCell.style.textAlign = "center";
    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.style.fontWeight = "bold";
    updateBtn.style.fontFamily = "Arial, Helvetica, sans-serif";
    updateBtn.style.display = "none"; // يمكنك تعديل ذلك بناءً على متطلباتك
    updateBtn.style.margin = "10px auto";
    updateBtn.style.width = "100%";
    updateBtn.style.height = "50px";
    updateBtn.style.backgroundColor = "rgb(163, 182, 229)";
    updateBtn.style.border = "2px solid black";
    updateBtn.style.borderRadius = "10px";

    updateCell.appendChild(updateBtn);
    row.appendChild(updateCell);

    tbody.appendChild(row);
  });
}

// Function to add event listener to the existing "Upload" button on the page
function addUploadButtonListener() {
  const uploadButton = document.getElementById("UPLOAD");
  if (!uploadButton) {
    /*alert("Upload button not found.");*/
    return;
  }

  uploadButton.addEventListener("click", uploadFile);
}

// Initialize the app
function initApp() {
  $(document).ready(function () {
    createPageElements();
    addUploadButtonListener();
  });
}

// Function to clear session storage and log out the user
function logOutAndClearSession() {
  sessionStorage.clear();
  window.location.href =
    "https://us-east-1fhfklvrxm.auth.us-east-1.amazonaws.com/login?response_type=code&client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
}

const logoutButton = document.getElementById("logoutbutton");

if (logoutButton) {
  logoutButton.addEventListener("click", logOutAndClearSession);
}

// Dynamically load jQuery if it's not already loaded
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

// Loading badge elements
const loadingBadge = document.getElementById("loadingBadge");

function showLoadingBadge() {
  if (loadingBadge) {
    loadingBadge.style.display = "block";
  }
}

function hideLoadingBadge() {
  if (loadingBadge) {
    loadingBadge.style.display = "none";
  }
}

function showInfo() {
  const infoModal = document.getElementById("infoModal");
  if (infoModal) {
    infoModal.style.display = "block";
  }
}

function closeModal() {
  const infoModal = document.getElementById("infoModal");
  if (infoModal) {
    infoModal.style.display = "none";
  }
}

// Close the modal when clicking outside the content
window.onclick = function (event) {
  const infoModal = document.getElementById("infoModal");
  if (infoModal && event.target == infoModal) {
    closeModal();
  }
};

// إضافة مستمع حدث للضغط على مفتاح
window.addEventListener("keydown", function (event) {
  // التحقق مما إذا كان المفتاح المضغوط هو Esc
  if (event.key === "Escape" || event.key === "Esc") {
    closeModal();
  }
});
