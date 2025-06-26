// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const subscriptionStatus = sessionStorage.getItem('subscriptionStatus'); // جلب حالة الاشتراك من Session Storage

// دالة للتحقق مما إذا كانت السلسلة تتبع صيغة UUID (8-4-4-4-12)
function validateUUID(uuid) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
}

/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
function checkUserId() {
    if (sessionStorage.getItem("userId")) {
      // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
    } else {
      window.location.href = "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?client_id=1v5jdad42jojr28bcv13sgds5r&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
      //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
    }
}

// عند تحميل الصفحة، نفذ الدالة أولاً ثم كل 0.5 ثانية
window.addEventListener('load', function() {
    checkUserId(); // تنفيذ الدالة عند تحميل الصفحة
    setInterval(checkUserId, 500); // إعادة تنفيذ الدالة كل 0.5 ثانية
});

document.addEventListener('DOMContentLoaded', () => {
    // جلب الثيم من localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // يمكنك إضافة المزيد من الكود هنا للتعامل مع الإشعارات إذا لزم الأمر
});

// Load jQuery if it's not already loaded
if (typeof jQuery === 'undefined') {
    var script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {
        // Ensure the DOM is ready and only then bind the button click event
        $(document).ready(function () {
            initializePage();
        });
    };
    script.onerror = function () {
        console.error("Failed to load jQuery.");
    };
    document.head.appendChild(script);
} else {
    // If jQuery is already loaded, bind the click event immediately
    $(document).ready(function () {
        initializePage();
    });
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

// Updated Function to initialize the page
async function initializePage() {
    addEventListeners();    // إضافة مستمع الحدث لزر الحفظ
    addInstructions();      // إضافة التعليمات على الشاشة
    createDataTable();      // إنشاء الجدول لعرض البيانات

    // تحقق من وجود جميع البيانات في sessionStorage
    var registration_Number = sessionStorage.getItem('registrationNumber');
    var clientId = sessionStorage.getItem('clientid');
    var clientSecret = sessionStorage.getItem('client_secret');
    var userId = sessionStorage.getItem('userId');
    
    // استدعاء الدالة لتعطيل أو تمكين الحقول بناءً على البيانات في sessionStorage
    toggleCredentialInputs(registration_Number, clientId, clientSecret, userId);

    if (registration_Number) {
        await fetchClientCredentials(); // انتظار استرجاع وعرض البيانات الحالية
    } else {
        // يمكنك إضافة أي كود آخر إذا لم يكن هناك رقم تسجيل
    }
}

// دالة لتعطيل أو تمكين حقول الإدخال بناءً على وجود البيانات في sessionStorage
function toggleCredentialInputs(registrationNumber, clientId, clientSecret, userId) {
    if (registrationNumber && clientId && clientSecret && userId) {
        // تعطيل الحقول
        $('.input1').prop('disabled', true);
        $('.input2').prop('disabled', true);
        $('.input3').prop('disabled', true);
        // تعطيل زر الحفظ إذا وُجدت بيانات الكريدنشيال
        $('.saveButton').prop('disabled', true);
    } else {
        // تمكين الحقول
        $('.input1').prop('disabled', false);
        $('.input2').prop('disabled', false);
        $('.input3').prop('disabled', false);
        // تمكين زر الحفظ في حالة عدم وجود بيانات الكريدنشيال
        $('.saveButton').prop('disabled', false);
    }
}

// Function to add event listeners
function addEventListeners() {
    // مستمع حدث للنقر على زر الحفظ
    $('.saveButton').on('click', saveClientCredentials);
    
    // مستمع حدث للضغط على مفتاح داخل حقول الإدخال
    $('input').on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // منع السلوك الافتراضي إذا كان داخل نموذج
            $('.saveButton').click(); // تفعيل الزر
        }
    });
}

// Function to handle the save button click event
function saveClientCredentials() {
    // إزالة التركيز (blur) من زر الحفظ
    $('.saveButton').blur();

    // جلب القيم من حقول الإدخال
    var registration_Number = $('.input1').val().trim();
    var clientid = $('.input2').val().trim();
    var client_secret = $('.input3').val().trim();

    // جلب userId من sessionStorage
    var userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    // التحقق من صيغة الـ clientid باستخدام دالة validateUUID
    if (!validateUUID(clientid)) {
        alert("صيغة Client ID غير صحيحة");
        return;
    }

    // التحقق من صيغة الـ client_secret باستخدام دالة validateUUID
    if (!validateUUID(client_secret)) {
        alert("صيغة Client Secret غير صحيحة");
        return;
    }

    // إذا مر التحقق، يتم استدعاء الدالة الخاصة بإرسال البيانات للـ API
    uploadClientCredentials(registration_Number, clientid, client_secret, userId)
        .then(function (result) {
            if (result && result.success) {
                // عرض النافذة الناجحة
                showSuccessModal();
                // تحديث الجدول بالبيانات الجديدة
                updateDataTable(registration_Number, clientid, client_secret);
            } else if (result && !result.success) {
                alert("Error: " + result.message);
            }
        })
        .catch(function (error) {
            alert("Unexpected error: " + error.message);
        })
        .finally(function () {
            clearInputFields();
        });
}

// Function to add CSS styles for the table
function addTableStyles() {
    var style = `
        .credentials-table {
            width: 100%;
            margin-left: 700px;
            border-collapse: collapse;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border: 2px solid #000;
            border-radius: 20px;
        }

        .credentials-table th,
        .credentials-table td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: center;
        }

        .credentials-table th {
            background-color: #007BFF;
            color: #fff;
            font-weight: bold;
        }

        .credentials-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .credentials-table td {
            color: #000;
        }
    `;

    // إنشاء عنصر style وإضافته إلى head
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = style;
    document.head.appendChild(styleSheet);
}

// Function to create a table to display the credentials
function createDataTable() {
    // التحقق مما إذا كان الجدول موجود مسبقاً
    if ($('#dataTable').length > 0) {
        return; // منع إضافة الجدول مرة أخرى
    }

    // إنشاء هيكل الجدول
    var table = `
        <table id="dataTable" class="credentials-table">
            <thead>
                <tr>
                    <th>Registration Number</th>
                    <th>Client ID</th>
                    <th>Client Secret</th>
                </tr>
            </thead>
            <tbody>
                <!-- ستضاف الصفوف هنا -->
            </tbody>
        </table>
    `;

    // إضافة الجدول بعد عنصر form-container
    $('.form-container').after(table);
}

// Function to update the table with new data
function updateDataTable(registration_Number, clientid, client_secret) {
    // مسح بيانات الجدول الحالية
    $('#dataTable tbody').empty();

    // إضافة صف جديد بالبيانات
    var newRow = `
        <tr>
            <td>${registration_Number}</td>
            <td>${clientid}</td>
            <td>${client_secret}</td>
        </tr>
    `;
    $('#dataTable tbody').append(newRow);
}

// Function to validate inputs using regex and check for empty values
function validateInputs(registration_Number, clientid, client_secret) {
    var minLength = 3;
    var regexPattern = '^[a-zA-Z0-9]{' + minLength + ',}$';
    var registrationRegex = new RegExp(regexPattern);
    var clientidRegex = new RegExp(regexPattern);
    var clientSecretRegex = new RegExp(regexPattern);

    if (!registration_Number || !registration_Number.match(registrationRegex)) {
        return { valid: false, message: 'Invalid Registration Number. It must be at least ' + minLength + ' alphanumeric characters.' };
    }

    if (!clientid || !clientid.match(clientidRegex)) {
        return { valid: false, message: 'Invalid Client ID. It must be at least ' + minLength + ' alphanumeric characters.' };
    }

    if (!client_secret || !client_secret.match(clientSecretRegex)) {
        return { valid: false, message: 'Invalid Client Secret. It must be at least ' + minLength + ' alphanumeric characters.' };
    }

    return { valid: true };
}

// Function to upload client credentials to the API
async function uploadClientCredentials(registration_number, client_id, client_secret, userId) {
    showSpinner();
    var payload = {
        registration_number: registration_number,
        clientid: client_id,
        client_secret: client_secret,
        user_id: userId
    };

    var apiUrl = 'https://ai5un58stf.execute-api.us-east-1.amazonaws.com/PROD/MFCC';

    try {
        var response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            var data = await response.json();
            alert("Success: " + data.body);
            return { success: true, message: data.body };
        } else {
            var errorData = await response.json();
            var errorMessage = errorData.message || 'Status code ' + response.status;
            alert("Error: " + errorMessage);
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error("Error during API request:", error);
        alert("Error: " + error.message);
        return { success: false, message: error.message };
    } finally {
        hideSpinner();
    }
}

// Updated Function: Fetch client credentials upon script initialization
async function fetchClientCredentials() {
    showSpinner();
    var registrationNumber = sessionStorage.getItem('registrationNumber');
    if (!registrationNumber) {
        console.warn("Registration number not found in session storage. Skipping fetch.");
        return;
    }

    var payload = {
        registration_number: registrationNumber,
    };

    var apiUrl = 'https://ai5un58stf.execute-api.us-east-1.amazonaws.com/PROD/MFCC';

    try {
        var response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            var data = await response.json();
            if (data.body) {
                data = JSON.parse(data.body);
            }

            if (data && data.credentials && Array.isArray(data.credentials)) {
                sessionStorage.setItem('clientCredentials', JSON.stringify(data.credentials));

                data.credentials.forEach(function(credential) {
                    var { registration_number, clientid, client_secret } = credential;
                    var newRow = `
                        <tr>
                            <td>${registration_number}</td>
                            <td>${clientid}</td>
                            <td>${client_secret}</td>
                        </tr>
                    `;
                    $('#dataTable tbody').append(newRow);
                });
            } else {
                console.warn("No credentials found in the response.");
            }
        } else {
            console.error("Failed to fetch credentials. Status Code:", response.status);
            var errorData = await response.json();
            console.error("Error response:", errorData);
        }
    } catch (error) {
        console.error("Error during fetchClientCredentials:", error);
    } finally {
        hideSpinner();
    }
}

// Function to clear input fields after submission
function clearInputFields() {
    $('.input1').val('');
    $('.input2').val('');
    $('.input3').val('');
}

// Function to add the instructions in both Arabic and English
function addInstructions() {
    var centerBox = $('.form-container');

    if ($('.instruction-container').length > 0) {
        return; // منع إضافة التعليمات مرة أخرى
    }

    var englishContainer = $('<div></div>').addClass('instruction-container-english-instructions');
    englishContainer.html(`
        <p>Page Guide</p>
        <p>This page is dedicated to importing invoices directly from the Electronic Invoice Portal, </p>
        <p> helping you easily prepare the company's VAT declarations with the added feature of alerts in case of any invoice errors. All you need to enter is:</p>
        <p>1-The company's tax registration number.</p>
        <p>2-ERP system credentials (Client ID and Client Secret).</p>
    `);
    
    var arabicContainer = $('<div></div>').addClass('instruction-container-arabic-instructions');
    arabicContainer.html(`
        <p>دليل الصفحة</p>
        <p>في هذه الصفحة، مخصصة لاستيراد الفواتير مباشرتاً من موقع الفاتورة الإلكترونية، مما يساعدك في </p>
        <p>:عداد إقرارات القيمة المضافة للشركة بكل سهولة مع ميزة و جود تنبيهات إذا وجد اي خطأ في الفاتورة. كل ما تحتاج إلى إدخاله هو</p>
        <p>.رقم التسجيل الضريبي الخاص بالشركة</p>
        <p>ERPبيانات نظام الـ </p>
        <p>.(معرّف العميل Client ID و Client Secret  المفتاح السري)</p>
    `);

    englishContainer.insertBefore(centerBox);
    arabicContainer.insertBefore(centerBox);
}

/**
 * عرض نافذة النجاح بعد حفظ البيانات
 */
function showSuccessModal() {
    const existingModal = document.getElementById("successModal");
    if (existingModal) {
      existingModal.remove();
    }
  
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "successModal";
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.zIndex = "1000";
  
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "20px";
    modalContent.style.textAlign = "center";
    modalContent.style.maxWidth = "350px";
    modalContent.style.width = "80%";
    modalContent.style.border = "rgb(131, 155, 218) 16px solid";
  
    const checkmark = document.createElement("div");
    checkmark.innerHTML = "&#10004;";
    checkmark.style.fontSize = "50px";
    checkmark.style.color = "#28a745";
    checkmark.style.marginBottom = "20px";
  
    const messagePara = document.createElement("p");
    messagePara.innerHTML = ".تم حفظ بيناتك بنجاح";
    messagePara.style.fontSize = "18px";
    messagePara.style.fontWeight = "bold";
  
    const okButton = document.createElement("button");
    okButton.textContent = "موافق";
    okButton.id = "okButton";
    okButton.style.marginTop = "20px";
    okButton.style.padding = "10px 20px";
    okButton.style.border = "none";
    okButton.style.backgroundColor = "#5581ed";
    okButton.style.color = "#fff";
    okButton.style.borderRadius = "5px";
    okButton.style.cursor = "pointer";
    okButton.style.fontSize = "14px";
    okButton.style.fontWeight = "bold";
    okButton.style.transition = "0.3s";

    okButton.addEventListener("mouseover", function () {
      okButton.style.backgroundColor = "rgb(50, 77, 145)";
      okButton.style.color = "white";
      okButton.style.transform = "scale(1.05)";
      okButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.5)";
    });
  
    okButton.addEventListener("mouseout", function () {
      okButton.style.backgroundColor = "#5581ed";
      okButton.style.color = "#fff";
      okButton.style.transform = "scale(1)";
      okButton.style.boxShadow = "none";
    });
  
    modalContent.appendChild(checkmark);
    modalContent.appendChild(messagePara);
    modalContent.appendChild(okButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  
    okButton.addEventListener("click", function () {
      window.location.href = 'home.html';
    });
  
    modalOverlay.addEventListener("click", function (event) {
        if (event.target === modalOverlay) {
            window.location.href = 'home.html';
        }
    });
}

function showupdateSuccessModal() {
    const existingModal = document.getElementById("successModal");
    if (existingModal) {
      existingModal.remove();
    }
  
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "successModal";
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.zIndex = "1000";
  
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "20px";
    modalContent.style.textAlign = "center";
    modalContent.style.maxWidth = "350px";
    modalContent.style.width = "80%";
    modalContent.style.border = "rgb(131, 155, 218) 16px solid";
  
    const checkmark = document.createElement("div");
    checkmark.innerHTML = "&#10004;";
    checkmark.style.fontSize = "50px";
    checkmark.style.color = "#28a745";
    checkmark.style.marginBottom = "20px";
  
    const messagePara = document.createElement("p");
    messagePara.innerHTML = "تم تحديث بيناتك بنجاح";
    messagePara.style.fontSize = "18px";
    messagePara.style.fontWeight = "bold";
  
    const okButton = document.createElement("button");
    okButton.textContent = "موافق";
    okButton.id = "okButton";
    okButton.style.marginTop = "20px";
    okButton.style.padding = "10px 20px";
    okButton.style.border = "none";
    okButton.style.backgroundColor = "#5581ed";
    okButton.style.color = "#fff";
    okButton.style.borderRadius = "5px";
    okButton.style.cursor = "pointer";
    okButton.style.fontSize = "14px";
    okButton.style.fontWeight = "bold";
    okButton.style.transition = "0.3s";

    okButton.addEventListener("mouseover", function () {
      okButton.style.backgroundColor = "rgb(50, 77, 145)";
      okButton.style.color = "white";
      okButton.style.transform = "scale(1.05)";
      okButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.5)";
    });
  
    okButton.addEventListener("mouseout", function () {
      okButton.style.backgroundColor = "#5581ed";
      okButton.style.color = "#fff";
      okButton.style.transform = "scale(1)";
      okButton.style.boxShadow = "none";
    });
  
    modalContent.appendChild(checkmark);
    modalContent.appendChild(messagePara);
    modalContent.appendChild(okButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  
    okButton.addEventListener("click", function () {
        location.reload();
    });
  
    modalOverlay.addEventListener("click", function (event) {
        if (event.target === modalOverlay) {
            location.reload();
        }
    });
}

// Function to clear session storage and log out the user
function logOutAndClearSession() {
    sessionStorage.clear();
    window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https://mohasibfriend.github.io/Mohasib-Friend/";
}

// إضافة مستمع حدث للزر الخاص بتسجيل الخروج
const logoutButton = document.getElementById("logoutbutton");
if (logoutButton) {
    logoutButton.addEventListener("click", logOutAndClearSession);
}

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

// إضافة مستمع حدث للضغط على مفتاح Esc لإغلاق النافذة
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        closeModal();
    }
});

// جلب العناصر من الـ DOM
const updateButton = document.getElementById('updateButton');
const spinner = document.getElementById('spinner');
const responseMessage = document.getElementById('responseMessage');
const successMessage = document.getElementById('successMessage');

// دالة للتحقق من وجود جميع البيانات في الـ Session Storage وحالة الاشتراك
function checkSessionData() {
    const registrationNumber = sessionStorage.getItem('registrationNumber');
    const clientId = sessionStorage.getItem('clientid');
    const clientSecret = sessionStorage.getItem('client_secret');
    const userId = sessionStorage.getItem('userId');

    if (!registrationNumber || !clientId || !clientSecret || !userId) {
        updateButton.disabled = true;
        updateButton.style.backgroundColor = '#6c757d'; // لون رمادي
        return;
    }

    if (subscriptionStatus === "FREE_TRIAL") {
        updateButton.disabled = true;
        updateButton.textContent ='يرجي الاشتراك لتجديد البينات';
        updateButton.style.backgroundColor = '#6c757d'; // لون رمادي
    } else if (subscriptionStatus === "ACTIVE") {
        updateButton.disabled = false;
        updateButton.style.backgroundColor = ''; // إعادة اللون الافتراضي
    }
}

// استدعاء دالة التحقق عند تحميل الصفحة
window.onload = checkSessionData;

// دالة للتعامل مع حدث الضغط على زر التحديث
updateButton.addEventListener('click', () => {
    spinner.style.display = 'block';
    responseMessage.textContent = '';
    successMessage.textContent = '';

    const registrationNumber = sessionStorage.getItem('registrationNumber');
    const clientId = sessionStorage.getItem('clientid');
    const clientSecret = sessionStorage.getItem('client_secret');
    const userId = sessionStorage.getItem('userId');

    const data = {
        registration_number: registrationNumber,
        clientid: clientId,
        client_secret: clientSecret,
        user_id: userId
    };

    fetch('https://futf6qqdse.execute-api.us-east-1.amazonaws.com/prod/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(result => {
        spinner.style.display = 'none';
        showupdateSuccessModal();
        successMessage.textContent = 'تم تحديث بيانات البورتال بنجاح';
        responseMessage.textContent = '';
    })
    .catch(error => {
        spinner.style.display = 'none';
        responseMessage.textContent = error.message || '.حدث خطأ أثناء تحديث البيانات';
        successMessage.textContent = '';

        if (error.message && (error.message.includes('Invalid request') || error.message.includes('Missing'))) {
            updateButton.disabled = true;
            updateButton.style.backgroundColor = '#6c757d'; // لون رمادي
        }
        console.error('Error:', error);
    });
});
