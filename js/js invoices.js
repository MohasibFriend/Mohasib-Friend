document.addEventListener('DOMContentLoaded', () => {
    // جلب الثيم من localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // يمكنك إضافة المزيد من الكود هنا للتعامل مع الإشعارات إذا لزم الأمر
});


// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage

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



// Load jQuery and execute logic when DOM is ready
if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {

        $(document).ready(function () {
            initializePage();
        });
    };
    script.onerror = function () {
        console.error("Failed to load jQuery.");
    };
    document.head.appendChild(script);
} else {

    $(document).ready(function () {
        initializePage();
    });
}

// Function to initialize the page
function initializePage() {
    // إضافة وصف الصفحة باللغتين العربية والإنجليزية إلى الـ Container المحدد
    const pageDescriptionContainer = $('#pageDescription');
    if (pageDescriptionContainer.length === 0) {
        console.error('Container with id "pageDescription" not found in the page.');
    } else {
        const pageDescriptionArabic = `
            <div class="page-description">
            <div style="margin-bottom: 20px;  padding: 15px;background-color: #fff;border: 3px solid #000;border-radius: 20px;width: 100%; font-size: 16px;">
                <h3 style="text-align: center; font-weight: bold; font-size: 16px; color: #000;">دليل الصفحة</h3>
                <p style="text-align: center;  font-weight: bold; font-size: 16px; color: #000;">
                   .في هذه الصفحة، تُعرض الفواتير التي تحتوي على أخطاء أو مشاكل، مع توفير ميزة التنبيه ضمن الفترة المسموح بها لتعديل الفاتورة، وذلك لتجنب تعرض الشركة لأي غرامات أو مسائل قانونية
                </p>
            </div>
        `;

        const pageDescriptionEnglish = `
            <div class="page-description">
            <div style="margin-bottom: 20px;  padding: 15px;background-color: #fff;border: 3px solid #000;border-radius: 20px;width: 100%; font-size: 14px; ">
                <h3 style="text-align: center; font-weight: bold; font-size: 14px; color: #000;">Page Guide</h3>
                <p style="text-align: center;  font-weight: bold; font-size: 14px; color: #000;">
                    On this page, invoices with errors or issues are displayed, with an alert feature within the permitted period for invoice correction, helping the company avoid fines or legal matters.
                </p>
            </div>
        `;

        pageDescriptionContainer.append(pageDescriptionArabic);
        pageDescriptionContainer.append(pageDescriptionEnglish);
    }

    // جلب وعرض التنبيهات
    fetchAlarms(registrationNumber);
}

// إضافة HTML خاص باللودينج سبينر إلى الصفحة
const spinnerHTML = `
    <div id="loadingSpinner" style="
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    ">
        <div style="
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
        "></div>
    </div>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
`;
document.body.insertAdjacentHTML('beforeend', spinnerHTML);

// إظهار اللودينج سبينر عند تحميل الصفحة وجلب البيانات
document.getElementById('loadingSpinner').style.display = 'flex';

// دالة لإخفاء اللودينج سبينر بعد تحميل البيانات
function hideSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// استدعاء دالة hideSpinner بعد الانتهاء من تحميل وتنفيذ fetchAlarms
async function fetchAlarms(registrationNumber) {

    const apiUrl = 'https://7qmz80p3ik.execute-api.us-east-1.amazonaws.com/DEV/FetchInvoiceAlarms';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queryStringParameters: {
                    registrationNumber: registrationNumber || "default"
                }
            })
        });

        if (response.ok) {
            const data = await response.json();

            if (data && data.body) {
                const parsedBody = JSON.parse(data.body);
                console.log(parsedBody);
                // استخدم الخاصية "alarm" بدل "alarms"
                displayAlarms(parsedBody.alarm ? [parsedBody.alarm] : []);
            } else {
                console.warn("No body data found in API response.");
                displayAlarms([]);
            }
            
        } else {
            console.error("Failed to fetch alarms. Status:", response.status);
            alert("Failed to fetch alarms: " + response.status);
        }
    } catch (error) {
        console.error("Error fetching alarms:", error);
        alert("Error: " + error.message);
    } finally {
        hideSpinner();  // إخفاء اللودينج سبينر بعد جلب البيانات
    }
}


// Function to parse and display the alarms in the 'RESULTS' container with inline CSS
function displayAlarms(alarms) {
    const resultsContainer = $('#RESULTS');
    resultsContainer.empty();

    // Adding the drop effect CSS dynamically to the document
    const style = document.createElement('style');
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
        html, body {
            height: 100%;
            margin: 0;
        }
        #mainContainer {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            font-family: Arial, Helvetica, sans-serif;
            padding: 20px;
            box-sizing: border-box;
        }
        #alarmsContainer {
            flex-grow: 1;
            max-height: calc(100vh - 110px);
            overflow-y: auto;
            padding: 10px;
            font-family: Arial, Helvetica, sans-serif;
            border-radius: 10px;
            background-color: #ffffff;
        }
        #alarmsTable {
            animation: dropEffect 0.5s ease-out;
            opacity: 1;
            transform: translateY(0);
            border-radius: 20px;
            padding: 0px;
            font-family: Arial, Helvetica, sans-serif;

            width: 100%;
            border-spacing: 10px;
            overflow-x: hidden;
        }
        /* Table Header Styling */
        #alarmsTable thead th {
            border: 3px solid black;
            padding: 10px;
            background-color:var(--background-nav);
            color: var(--text-color);
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
            border-radius: 10px;
            text-align: center;
        }
        
        /* Specific Header Font Sizes */
        #alarmsTable thead th:nth-child(1) { /* Alarm Type - نوع الخطأ */
            font-size: 18px; /* Largest font */

        }
        
        #alarmsTable thead th:nth-child(2) { /* Date - التاريخ */
            font-size: 16px; /* Slightly smaller */
            width:180px;
        }
        
        #alarmsTable thead th:nth-child(3) { /* Document Number - رقم المستند */
            font-size: 14px; /* Smallest font */
            width:50px;
        }
        #alarmsTable td {
            padding: 10px;
            font-weight: bold;
            text-align: center;
            font-family: Arial, Helvetica, sans-serif;
            border-collapse: collapse;
            border-bottom: #000 3px solid;  
        }
        /* Mobile Devices (max-width: 600px) */
        @media only screen and (max-width: 600px) {
            #alarmsTable {
                width: 100%;
                font-size: 12px;
                overflow-x: hidden;
            }
            #alarmsTable thead th, #alarmsTable td {
                padding: 5px;
                font-size: 10px;
            }
            /* Specific Header Font Sizes */
            #alarmsTable thead th:nth-child(1) { /* Alarm Type - نوع الخطأ */
                font-size: 10px; /* Largest font */

            }
            
            #alarmsTable thead th:nth-child(2) { /* Date - التاريخ */
                font-size: 10px; /* Slightly smaller */
                width:30px;
            }
            
            #alarmsTable thead th:nth-child(3) { /* Document Number - رقم المستند */
                font-size: 10px; /* Smallest font */
                width:10px;
            }
            #alarmsContainer {
                max-height: 97vh; /* ضبط ارتفاع الحاوية للهواتف */
                
            }
        }
        /* Tablets (min-width: 601px and max-width: 1024px) */
        @media only screen and (min-width: 601px) and (max-width: 1024px) {
            #alarmsTable {
                width: 100%;
                font-size: 14px;
                overflow-x: hidden;
            }
            
            #alarmsContainer {
                max-height: 80vh; /* ضبط ارتفاع الحاوية للأجهزة اللوحية */
                 
            }


            #alarmsTable thead th, #alarmsTable td {
                padding: 8px;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(style);

    // Wrap the results in a container with flex grow to fill empty space
    const alarmsContainer = `
        <div id="alarmsContainer">
            <table id="alarmsTable">
                <thead>
                    <tr>
                        <th>Alarm Type - نوع الخطأ</th>
                        <th>Date - التاريخ</th>
                        <th>Document Number - رقم المستند</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;
    resultsContainer.append(alarmsContainer);
    const tableBody = $('#alarmsTable tbody');

    /*console.log("Starting to process alarms...");*/

    if (alarms && Array.isArray(alarms) && alarms.length > 0) {
        const alarmEntries = []; // مصفوفة لتخزين بيانات التنبيهات
    
        alarms.forEach((alarmData, alarmIndex) => {
    
            const alarmRows = alarmData.split('\n');
            let alarmType = '';
            let date = '';
            let documentNumber = '';
    
            alarmRows.forEach((row, rowIndex) => {
                row = row.trim();
    
                // التحقق من رقم المستند
                if (row.match(/^\d+$/)) {
                    documentNumber = row;
                } 
                // التحقق إذا كان الصف يحتوي فقط على تاريخ
                else if (row.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    date = row;
                } 
                // الكشف عن بداية إدخال تنبيه جديد
                else if (row.match(/^\d+-/)) {
                    // إضافة الإدخال السابق إذا كانت جميع الحقول مكتملة
                    if (alarmType && date && documentNumber) {
                        alarmEntries.push({
                            alarmType,
                            date,
                            documentNumber
                        });
                    }
    
                    // إعادة تعيين وبدء الإدخال الجديد
                    alarmType = row.replace(/^\d+-/, '').trim();
                    date = '';
                    documentNumber = '';
                }
    
                // إضافة الإدخال إذا كانت جميع الحقول مكتملة
                if (alarmType && date && documentNumber) {
                    alarmEntries.push({
                        alarmType,
                        date,
                        documentNumber
                    });
    
                    // مسح المتغيرات بعد الجمع
                    alarmType = '';
                    date = '';
                    documentNumber = '';
                }
            });
    
            // في حالة وجود إدخال في نهاية التنبيهات
            if (alarmType && date && documentNumber) {
                alarmEntries.push({
                    alarmType,
                    date,
                    documentNumber
                });
            }
        });
    
        // ترتيب المصفوفة بناءً على التواريخ من الأحدث إلى الأقدم
        alarmEntries.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // الترتيب التنازلي
        });
    
    
        // إضافة البيانات المرتبة إلى جدول البيانات
        alarmEntries.forEach(entry => {
            tableBody.append(`
                <tr>
                    <td>${entry.alarmType}</td>
                    <td>${entry.date}</td>
                    <td>${entry.documentNumber}</td>
                </tr>
            `);
        });
    } else {
        tableBody.append(`<tr><td colspan="3">لا يوجد أخطاء في الفواتير</td></tr>`);
    }
    
    scrollToResults();
}
// Function to scroll to the results container
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