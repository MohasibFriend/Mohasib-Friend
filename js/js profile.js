// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const subscriptionStatus = sessionStorage.getItem('subscriptionStatus'); // جلب حالة الاشتراك من Session Storage
/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
function checkUserId() {
    if (sessionStorage.getItem("userId")) {
      // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
    } else {
      window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login/continue?client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https%3A%2F%2Fmohasibfriend.github.io%2FMohasib-Friend%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
      //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
    }
}

// عند تحميل الصفحة، نفذ الدالة أولاً ثم كل ثانية
window.addEventListener('load', function() {
    checkUserId(); // تنفيذ الدالة عند تحميل الصفحة
    setInterval(checkUserId, 500); // إعادة تنفيذ الدالة كل 1 ثانية
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
    addEventListeners();    // Add event listener for Save button
    addInstructions();      // Add instructions to the screen
    createDataTable(); 
    fetchClientCredentials();     // Create the table to display data

    // تحقق من وجود جميع البيانات في sessionStorage
    var registration_Number = sessionStorage.getItem('registrationNumber');
    var clientId = sessionStorage.getItem('clientid');
    var clientSecret = sessionStorage.getItem('client_secret');
    var userId = sessionStorage.getItem('userId');
    

    // استدعاء الدالة لتعطيل أو تمكين الحقول بناءً على البيانات في sessionStorage
    toggleCredentialInputs(registration_Number, clientId, clientSecret, userId);

    if (registration_Number) {
        await fetchClientCredentials(); // Await fetch and display existing credentials
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
    // Remove focus (blur) from the saveButton
    $('.saveButton').blur();

    // Retrieve input values from the form
    var registration_Number = $('.input1').val().trim();
    var clientid = $('.input2').val().trim();
    var client_secret = $('.input3').val().trim();

    // Retrieve userId from session storage
    var userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    // Log captured values to console for debugging

    // Call the API and handle success or error responses
    uploadClientCredentials(registration_Number, clientid, client_secret, userId)
        .then(function (result) {
            if (result && result.success) {
               // عرض النافذة الناجحة
                showSuccessModal();
                           
                // Update table with the new data
                updateDataTable(registration_Number, clientid, client_secret);
            } else if (result && !result.success) {
                alert("Error: " + result.message);  // Show error alert
            }
        })
        .catch(function (error) {
            alert("Unexpected error: " + error.message);  // Handle unexpected errors
        })
        .finally(function () {
            clearInputFields();  // Clear input fields after submission
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

    // Create a style element and append it to the head
    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = style;
    document.head.appendChild(styleSheet);
   
       
    
}

// Function to create a table to display the credentials
function createDataTable() {
    // Check if table already exists
    if ($('#dataTable').length > 0) {
        return; // Prevent adding the table again
    }

    // Create table structure
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
                <!-- Data rows will be added here -->
            </tbody>
        </table>
    `;

    // Append the table after the form container
    $('.form-container').after(table);
}

// Function to update the table with new data
function updateDataTable(registration_Number, clientid, client_secret) {
    // Clear existing table data
    $('#dataTable tbody').empty();

    // Add new data as a row in the table
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

    // Check if registration number is empty or doesn't match the regex
    if (!registration_Number || !registration_Number.match(registrationRegex)) {
        return { valid: false, message: 'Invalid Registration Number. It must be at least ' + minLength + ' alphanumeric characters.' };
    }

    // Check if client ID is empty or doesn't match the regex
    if (!clientid || !clientid.match(clientidRegex)) {
        return { valid: false, message: 'Invalid Client ID. It must be at least ' + minLength + ' alphanumeric characters.' };
    }

    // Check if client secret is empty or doesn't match the regex
    if (!client_secret || !client_secret.match(clientSecretRegex)) {
        return { valid: false, message: 'Invalid Client Secret. It must be at least ' + minLength + ' alphanumeric characters.' };
    }

    // If all fields are valid
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

    // محاولة جلب الكريدينشالز من sessionStorage
    var storedCredentials = sessionStorage.getItem('clientCredentials');
    if (storedCredentials) {
        try {
            var credentials = JSON.parse(storedCredentials);
            // التأكد من أن البيانات تحتوي على مصفوفة
            if (credentials && Array.isArray(credentials)) {
                credentials.forEach(function(credential) {
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
                // تخزين clientid و client_secret في sessionStorage كمصفوفة من الكائنات
                var clientDetails = credentials.map(function(credential) {
                    return {
                        clientid: credential.clientid,
                        client_secret: credential.client_secret
                    };
                });
                sessionStorage.setItem('clientDetails', JSON.stringify(clientDetails));
                
                hideSpinner();
                return; // إذا وجدت الكريدينشالز في الـ sessionStorage، ننهي التنفيذ
            }
        } catch (e) {
            console.error("Error parsing stored credentials:", e);
            // إذا حدث خطأ في التحليل، نستمر في محاولة جلب البيانات من الـ API
        }
    }

    // إذا لم توجد الكريدينشالز في الـ sessionStorage، نقوم بمحاولة جلب registrationNumber
    var registrationNumber = sessionStorage.getItem('registrationNumber');
    if (!registrationNumber) {
        console.warn("Registration number not found in session storage. Skipping fetch.");
        hideSpinner();
        return;
    }

    // إعداد payload لطلب الـ fetch
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

            // في حالة أن الجسم (body) مشفر مرتين، نقوم بتحليل القيمة مرة ثانية
            if (data.body) {
                data = JSON.parse(data.body);
            }

            // التأكد من وجود الكريدينشالز بالشكل الصحيح
            if (data && data.credentials && Array.isArray(data.credentials)) {
                // تخزين الكريدينشالز في sessionStorage للاستخدام لاحقاً
                sessionStorage.setItem('clientCredentials', JSON.stringify(data.credentials));

                // تخزين clientid و client_secret معًا في sessionStorage
                var clientDetails = data.credentials.map(function(credential) {
                    return {
                        clientid: credential.clientid,
                        client_secret: credential.client_secret
                    };
                });
                sessionStorage.setItem('clientDetails', JSON.stringify(clientDetails));

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
    $('.input1').val('');  // Clear registration number input
    $('.input2').val('');  // Clear client id input
    $('.input3').val('');  // Clear client secret input
}

// Function to add the instructions in both Arabic and English
function addInstructions() {
    var centerBox = $('.form-container');  // Assuming this is the container for the form

    if ($('.instruction-container').length > 0) {
        return; // Prevent adding instructions again
    }

    // Create container for English instructions
    var englishContainer = $('<div></div>').addClass('instruction-container-english-instructions');

    // English text content
    englishContainer.html(`
        <p>Page Guide</p>
        <p>This page is dedicated to importing invoices directly from the Electronic Invoice Portal, </p>
        <p> helping you easily prepare the company's VAT declarations with the added feature of alerts in case of any invoice errors. All you need to enter is:</p>
        <p>1-The company's tax registration number.</p>
        <p>2-ERP system credentials (Client ID and Client Secret).</p>
       
    `);
    

    // Create container for Arabic instructions
    var arabicContainer = $('<div></div>').addClass('instruction-container-arabic-instructions');

    // Arabic text content
    arabicContainer.html(`
        <p>دليل الصفحة</p>
        <p>في هذه الصفحة، مخصصة لاستيراد الفواتير مباشرتاً من موقع الفاتورة الإلكترونية، مما يساعدك في </p>
        <p>:عداد إقرارات القيمة المضافة للشركة بكل سهولة مع ميزة و جود تنبيهات إذا وجد اي خطأ في الفاتورة. كل ما تحتاج إلى إدخاله هو</p>
        <p>.رقم التسجيل الضريبي الخاص بالشركة</p>
        <p>ERPبيانات نظام الـ </p>
        <p>.(معرّف العميل Client ID و Client Secret  المفتاح السري)</p>
    `);

    // Insert both containers into the DOM positioned near the central box
    englishContainer.insertBefore(centerBox);  // Insert English text before the center box
    
    arabicContainer.insertBefore(centerBox);    // Append Arabic text after the center box
}


/**
 * عرض نافذة النجاح بعد حذف الحساب
 */
function showSuccessModal() {
    // إزالة أي نافذة منبثقة حالية
    const existingModal = document.getElementById("successModal");
    if (existingModal) {
      existingModal.remove();
    }
  
    // إنشاء طبقة تغطية النافذة المنبثقة
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
  
    // إنشاء محتوى النافذة المنبثقة
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "20px";
    modalContent.style.textAlign = "center";
    modalContent.style.maxWidth = "350px";
    modalContent.style.width = "80%";
    modalContent.style.border = "rgb(131, 155, 218) 16px solid";
  
    // إنشاء أيقونة العلامة الخضراء
    const checkmark = document.createElement("div");
    checkmark.innerHTML = "&#10004;"; // Unicode for checkmark
    checkmark.style.fontSize = "50px";
    checkmark.style.color = "#28a745"; // green color
    checkmark.style.marginBottom = "20px";
  
    // إنشاء الرسالة
    const messagePara = document.createElement("p");
    messagePara.innerHTML = ".تم حفظ بيناتك بنجاح";
    messagePara.style.fontSize="18px";
    messagePara.style.fontWeight="bold";
  
    // إنشاء زر OK
    const okButton = document.createElement("button");
    okButton.textContent = "موافق";
    okButton.id = "okButton";
    okButton.style.marginTop = "20px";
    okButton.style.padding = "10px 20px";
    okButton.style.border = "none";
    okButton.style.backgroundColor = "#5581ed"; // primary color
    okButton.style.color = "#fff";
    okButton.style.borderRadius = "5px";
    okButton.style.cursor = "pointer";
    okButton.style.fontSize = "14px";
    okButton.style.fontWeight = "bold";
    okButton.style.transition="0.3s";

    okButton.addEventListener("mouseover", function () {
      okButton.style.backgroundColor = "rgb(50, 77, 145)"; // تغيير لون الخلفية عند التمرير
      okButton.style.color = "white"; // تغيير لون النص عند التمرير
      okButton.style.transform = "scale(1.05)"; // تأثير تكبير خفيف
      okButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.5)"; // إضافة ظل
    });
  
    okButton.addEventListener("mouseout", function () {
      okButton.style.backgroundColor = "#5581ed"; // اللون الأصلي
      okButton.style.color = "#fff"; // اللون الأصلي للنص
      okButton.style.transform = "scale(1)"; // إعادة الحجم الأصلي
      okButton.style.boxShadow = "none"; // إزالة الظل
    });
  
    // إضافة العناصر إلى محتوى النافذة المنبثقة
    modalContent.appendChild(checkmark);
    modalContent.appendChild(messagePara);
    modalContent.appendChild(okButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  
    // إضافة مستمع للزر OK
    okButton.addEventListener("click", function () {
      // مسح sessionStorage
      window.location.href = 'home.html';
      
    });
  
    // إضافة مستمع للطبقة لتغلق النافذة عند النقر خارج المحتوى
    modalOverlay.addEventListener("click", function (event) {
        if (event.target === modalOverlay) {
            window.location.href = 'home.html';
        }
    });
}


function showupdateSuccessModal() {
    // إزالة أي نافذة منبثقة حالية
    const existingModal = document.getElementById("successModal");
    if (existingModal) {
      existingModal.remove();
    }
  
    // إنشاء طبقة تغطية النافذة المنبثقة
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
  
    // إنشاء محتوى النافذة المنبثقة
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "20px";
    modalContent.style.textAlign = "center";
    modalContent.style.maxWidth = "350px";
    modalContent.style.width = "80%";
    modalContent.style.border = "rgb(131, 155, 218) 16px solid";
  
    // إنشاء أيقونة العلامة الخضراء
    const checkmark = document.createElement("div");
    checkmark.innerHTML = "&#10004;"; // Unicode for checkmark
    checkmark.style.fontSize = "50px";
    checkmark.style.color = "#28a745"; // green color
    checkmark.style.marginBottom = "20px";
  
    // إنشاء الرسالة
    const messagePara = document.createElement("p");
    messagePara.innerHTML = "تم تحديث بيناتك بنجاح";
    messagePara.style.fontSize="18px";
    messagePara.style.fontWeight="bold";
  
    // إنشاء زر OK
    const okButton = document.createElement("button");
    okButton.textContent = "موافق";
    okButton.id = "okButton";
    okButton.style.marginTop = "20px";
    okButton.style.padding = "10px 20px";
    okButton.style.border = "none";
    okButton.style.backgroundColor = "#5581ed"; // primary color
    okButton.style.color = "#fff";
    okButton.style.borderRadius = "5px";
    okButton.style.cursor = "pointer";
    okButton.style.fontSize = "14px";
    okButton.style.fontWeight = "bold";
    okButton.style.transition="0.3s";

    okButton.addEventListener("mouseover", function () {
      okButton.style.backgroundColor = "rgb(50, 77, 145)"; // تغيير لون الخلفية عند التمرير
      okButton.style.color = "white"; // تغيير لون النص عند التمرير
      okButton.style.transform = "scale(1.05)"; // تأثير تكبير خفيف
      okButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.5)"; // إضافة ظل
    });
  
    okButton.addEventListener("mouseout", function () {
      okButton.style.backgroundColor = "#5581ed"; // اللون الأصلي
      okButton.style.color = "#fff"; // اللون الأصلي للنص
      okButton.style.transform = "scale(1)"; // إعادة الحجم الأصلي
      okButton.style.boxShadow = "none"; // إزالة الظل
    });
  
    // إضافة العناصر إلى محتوى النافذة المنبثقة
    modalContent.appendChild(checkmark);
    modalContent.appendChild(messagePara);
    modalContent.appendChild(okButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  
   // إضافة مستمع للزر OK
    okButton.addEventListener("click", function () {
        // إعادة تحميل الصفحة
        location.reload();
    });

  
    // إضافة مستمع للطبقة لتغلق النافذة عند النقر خارج المحتوى
    modalOverlay.addEventListener("click", function (event) {
        if (event.target === modalOverlay) {
            location.reload();
        }
    });
}

// Function to clear session storage and log out the user
function logOutAndClearSession() {
    // Clear all items in session storage
    sessionStorage.clear();

    // Redirect to the login page
   window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https://mohasibfriend.github.io/Mohasib-Friend/";
}

// Get the existing logout button by its ID
const logoutButton = document.getElementById("logoutbutton");

// Add click event to the existing button
if (logoutButton) {
 logoutButton.addEventListener("click", logOutAndClearSession);
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

    // التحقق من عدم وجود أي قيمة فارغة أو غير موجودة
    if (!registrationNumber || !clientId || !clientSecret || !userId) {
        updateButton.disabled = true;
        updateButton.style.backgroundColor = '#6c757d'; // لون رمادي
        return;
    }

    // التحقق من حالة الاشتراك
    if (subscriptionStatus === "FREE_TRIAL") {
        updateButton.disabled = true;
        updateButton.textContent ='يرجي الاشتراك لتجديد البينات'
        updateButton.style.backgroundColor = '#6c757d'; // لون رمادي
    } else if (subscriptionStatus === "ACTIVE") {
        updateButton.disabled = false;
        updateButton.style.backgroundColor = ''; // إعادة اللون الافتراضي
    }
}

// استدعاء دالة التحقق عند تحميل الصفحة
window.onload = checkSessionData;

// دالة للتعامل مع حدث الضغط على الزر
updateButton.addEventListener('click', () => {
    // عرض اللود سبينر
    spinner.style.display = 'block';
    responseMessage.textContent = '';
    successMessage.textContent = '';

    // جلب البيانات من الـ Session Storage
    const registrationNumber = sessionStorage.getItem('registrationNumber');
    const clientId = sessionStorage.getItem('clientid');
    const clientSecret = sessionStorage.getItem('client_secret');
    const userId = sessionStorage.getItem('userId');

    // تحضير البيانات لإرسالها
    const data = {
        registration_number: registrationNumber,
        clientid: clientId,
        client_secret: clientSecret,
        user_id: userId
    };

    // إرسال البيانات إلى الـ API باستخدام Fetch
    fetch('https://futf6qqdse.execute-api.us-east-1.amazonaws.com/prod/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // التحقق من حالة الاستجابة قبل تحويلها إلى JSON
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(result => {
        // إخفاء اللود سبينر
        spinner.style.display = 'none';
        showupdateSuccessModal();
        // عرض رسالة نجاح
        successMessage.textContent = 'تم تحديث بيانات البورتال بنجاح';
        responseMessage.textContent = '';
    })
    .catch(error => {
        // إخفاء اللود سبينر
        spinner.style.display = 'none';
        // عرض رسالة خطأ
        responseMessage.textContent = error.message || '.حدث خطأ أثناء تحديث البيانات';
        successMessage.textContent = '';

        // إذا كانت البيانات غير مكتملة، تعطيل الزر وتغيير لونه إلى الرمادي
        if (error.message && (error.message.includes('Invalid request') || error.message.includes('Missing'))) {
            updateButton.disabled = true;
            updateButton.style.backgroundColor = '#6c757d'; // لون رمادي
        }
        console.error('Error:', error);
    });
});
