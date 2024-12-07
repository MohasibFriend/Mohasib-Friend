// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage
const subscriptionStatus = sessionStorage.getItem('subscriptionStatus'); // جلب حالة الاشتراك من Session Storage
if (sessionStorage.getItem("userId")) {
  // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
} else {
  console.error("User ID is missing from sessionStorage. Handling Cognito callback.");
  window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login/continue?client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https%3A%2F%2Fmohasibfriend.github.io%2FMohasib-Friend%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
  //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
}
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

// Function to create dynamic elements on the page inside "Result" container
function createPageElements() {
  const resultContainer = document.getElementById("Result");
  if (!resultContainer) {
    alert("Result container not found.");
    return;
  }

  // إنشاء زر تحميل الملف
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
  table.style.backgroundColor = "#fff";
  table.style.marginTop = "20px";
  table.style.fontFamily = "Arial, Helvetica, sans-serif";
  

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["التاريخ", "تحميل اليوميه"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.style.border = "3px solid black";
    th.style.borderRadius = "10px";
    th.style.backgroundColor = "rgb(163, 182, 229)";
    th.style.padding = "10px";
    th.style.textAlign = "center";
    th.style.height = "50px";
    th.style.width="50%";
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  const row = document.createElement("tr");

  const dateCell = document.createElement("td");
  const downloadCell = document.createElement("td");
  const updateCell = document.createElement("td");

  downloadCell.style.textAlign = "center";
  updateCell.style.textAlign = "center";

  row.appendChild(dateCell);
  row.appendChild(downloadCell);
  row.appendChild(updateCell);
  tbody.appendChild(row);

  table.appendChild(tbody);

  resultContainer.appendChild(fileInput);
  resultContainer.appendChild(table);

  fetchAndDisplayExistingFile();
}

// Function to handle file upload
/*async function uploadFile() {
  const fileInput = document.getElementById("fileUpload");
  if (!fileInput || !fileInput.files[0]) {
    alert("Please select a file.");
    return;
  }

  const file = fileInput.files[0];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  if (fileExtension !== "xlsx") {
    alert("Error: Please upload an Excel file with .xlsx extension.");
    return;
  }

  showLoadingBadge();

  const reader = new FileReader();
  reader.onload = async function (event) {
    const base64File = event.target.result.split(",")[1];

    // Generate the S3 key with the current date
    const s3Key = `${registrationNumber}journal${getCurrentDate()}.xlsx`;

    const payload = {
      registration_number: registrationNumber,
      file_content: base64File,
      s3_key: s3Key,
    };

    try {
      const response = await fetch(
        "https://wxgf8057ci.execute-api.us-east-1.amazonaws.com/PROD/MFJAPI",
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


        alert("تم رفع اليوميه بنجاح");

        // Show the current date temporarily as upload date
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];

        updateTable(null, `${formattedDate}`);

        // Optionally fetch and display the actual file data (if needed for later updates)
        setTimeout(() => fetchAndDisplayExistingFile(), 5000); // Delayed update to fetch actual data
      } else {
        alert("حدث خطأ في رفع اليوميه يرجي اعادة المحاوله");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("حدث خطأ غير متوقع: " + error.message);
    } finally {
      hideLoadingBadge();
    }
  };
  reader.readAsDataURL(file);
}*/

// Function to fetch the file and display the extracted date in the table
async function fetchAndDisplayExistingFile() {
  // إظهار السبينر قبل بدء عملية الجلب
  showSpinner();
  if (!registrationNumber) {
    console.error("Registration number not found in session storage.");
    hideSpinner();
    return;
  }

  try {
    const payload = { registration_number: registrationNumber };

    const response = await fetch(
      "https://wxgf8057ci.execute-api.us-east-1.amazonaws.com/PROD/MFJAPI",
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


      if (parsedBody.download_url) {
        // Extract date from the file name if available
        const downloadUrl = parsedBody.download_url;
        const filename = downloadUrl.split("/").pop(); // Get the filename from the URL
        const dateMatch = filename.match(/\d{4}-\d{2}-\d{2}/); // Regex to match YYYY-MM-DD format

        let extractedDate = new Date().toISOString().slice(0, 10); // Default to "N/A" if no date is found
        if (dateMatch) {
          extractedDate = dateMatch[0]; // Use the matched date
        }

        // Update the table with the extracted date
        updateTable(downloadUrl, extractedDate);
      } else {
        console.warn("No download URL found in the response.");
      }
    } else {
      console.error("Failed to fetch existing file from database.");
    }
  } catch (error) {
    console.error("Error fetching existing file:", error);
  } finally {
    // إخفاء السبينر بعد انتهاء العملية سواء نجحت أم لا
    hideSpinner();
  }
}

// Function to update the table with the extracted date only
function updateTable(downloadUrl, date) {
  const tbody = document.querySelector("tbody");
  const row = tbody.querySelector("tr");

  // Display the extracted date in the Date column
  const dateCell = row.cells[0];
  dateCell.textContent = date;
  dateCell.style.fontSize = "18px";
  dateCell.style.fontWeight = "bold";
  dateCell.style.textAlign = "center";
  dateCell.style.fontFamily = "Arial, Helvetica, sans-serif";
 

  const downloadCell = row.cells[1];
  downloadCell.innerHTML = "";
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download";
  downloadBtn.style.fontWeight = "bold";
  downloadBtn.style.fontFamily = "Arial, Helvetica, sans-serif";
  downloadBtn.style.display = "block";
  downloadBtn.style.margin = "10px auto";
  downloadBtn.style.width = "100%";
  downloadBtn.style.height = "50px";
  downloadBtn.style.backgroundColor = "rgb(163, 182, 229)";
  downloadBtn.style.border = "2px solid black";
  downloadBtn.style.borderRadius = "10px";

  // التحقق من حالة الاشتراك
  if (subscriptionStatus === 'ACTIVE') {
    // إذا كان الاشتراك نشط، يتم تفعيل زر التحميل بشكل طبيعي
    downloadBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "file_downloaded.xlsx";
      link.click();
    });
  } else if (subscriptionStatus === 'FREE_TRIAL') {
    // إذا كان الاشتراك تجربة مجانية، يتم تعطيل زر التحميل وتغيير مظهره
    downloadBtn.textContent = "للمشتركين فقط";
    downloadBtn.disabled = true;
    downloadBtn.classList.add("disabled-button");
    downloadBtn.style.color="#fff";
    downloadBtn.style.fontWeight="bold";
    downloadBtn.style.fontSize="18px";
  }

  downloadCell.appendChild(downloadBtn);

  // إضافة زر "Update" إذا كان الاشتراك نشط فقط
  const updateCell = row.cells[2];
  updateCell.innerHTML = "";
  const updateBtn = document.createElement("button");
  updateBtn.textContent = "Update";
  updateBtn.style.fontWeight = "bold";
  updateBtn.style.fontFamily = "Arial, Helvetica, sans-serif";
  updateBtn.style.display = "none";
  updateBtn.style.margin = "10px auto";
  updateBtn.style.width = "100%";
  updateBtn.style.height = "50px";
  updateBtn.style.backgroundColor = "rgb(163, 182, 229)";
  updateBtn.style.border = "2px solid black";
  updateBtn.style.borderRadius = "10px";

  

  updateCell.appendChild(updateBtn);
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
    // Removed duplicate call to fetchAndDisplayExistingFile()
  });
}

// Function to clear session storage and log out the user
function logOutAndClearSession() {
  sessionStorage.clear();
  window.location.href =
    "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
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
  loadingBadge.style.display = "block";
}

function hideLoadingBadge() {
  loadingBadge.style.display = "none";
}
function showInfo() {
  document.getElementById("infoModal").style.display = "block";
}

function closeModal() {
  document.getElementById("infoModal").style.display = "none";
}

// Close the modal when clicking outside the content
window.onclick = function(event) {
  if (event.target == document.getElementById("infoModal")) {
      closeModal();
  }
}

// إضافة مستمع حدث للضغط على مفتاح
window.addEventListener('keydown', function(event) {
  // التحقق مما إذا كان المفتاح المضغوط هو Esc
  if (event.key === 'Escape' || event.key === 'Esc') {
      closeModal();
  }
}); 
