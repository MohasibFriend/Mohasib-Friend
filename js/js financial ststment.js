// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage

// دالة لعرض الملفات المحملة في حاويات مناسبة مع أزرار التحميل
function displayFiles(files) {
    console.log("دخلت الدالة displayFiles بالملفات:", files); // تأكيد استدعاء الدالة
    const resultContainer = document.getElementById('RESULT'); // استهداف الحاوية 'RESULT'
    resultContainer.innerHTML = ''; // مسح أي محتوى موجود بالفعل

    // التحقق إذا كان كائن الملفات يحتوي على أي مفاتيح
    if (!files || Object.keys(files).length === 0) {
        resultContainer.innerHTML = `<p>No files available for download.</p>`;
        return;
    }

    // إضافة CSS المدمج للحاويات والأزرار، بما في ذلك التأثيرات المتحركة
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

        .file-container {
            margin-top: 80px;
            padding: 20px;
            border: 3px solid #000;
            border-radius: 15px;
            background-color: #d8dff2;
            
            position: relative;
            animation: dropEffect 0.5s ease-out; /* تطبيق تأثير السقوط */
            opacity: 1;
            transform: translateY(0);
        }
        .file-container h3 {
            margin-bottom: 10px;
            margin-left: 20px;
            font-weight: bold;
            font-size: 18px;
            color: #000;
        }
        .download-btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: rgb(119 148 220);
            color: white;
            border: 3px solid #000;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            text-decoration: none;
            cursor: pointer;
        }
        .download-btn:hover {
            background-color: rgb(163, 182, 229);
        }
        .no-file {
            color: red;
            font-weight: bold;
            margin-top: 10px;
        }

        /* استعلامات الوسائط للأجهزة المحمولة (عرض أقل من 600 بكسل) */
        @media only screen and (max-width: 600px) {
            .file-container {
                margin-top: 20px;
                padding: 15px;
            }
            .file-container h3 {
                font-size: 16px;
                margin-left: 10px;
            }
            .download-btn {
                padding: 8px 15px;
                font-size: 14px;
                
                margin: 10px auto;
            }
        }

        /* استعلامات الوسائط للأجهزة اللوحية (عرض بين 601 و 1024 بكسل) */
        @media only screen and (min-width: 601px) and (max-width: 1024px) {
            .file-container {
                margin-top: 40px;
                padding: 18px;
            }
            .file-container h3 {
                font-size: 17px;
                margin-left: 15px;
            }
            .download-btn {
                padding: 10px 18px;
                font-size: 16px;
                
                margin: 15px auto;
            }
        }
    `;
    document.head.appendChild(style); // إضافة الأنماط إلى رأس المستند

    // دالة لتنزيل الملف باستخدام رابط التنزيل المسبق
    function downloadFile(downloadUrl) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.target = "_blank"; // الفتح في علامة تبويب جديدة
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // عرض الحاوية الأولى لـ "مركز مالي"
    const financialContainer = document.createElement('div');
    financialContainer.classList.add('file-container');
    financialContainer.id = 'financial-container';

    // تعيين عنوان الحاوية
    const financialHeader = document.createElement('h3');
    financialHeader.innerText = 'مركز مالي';
    financialContainer.appendChild(financialHeader);

    // التحقق من توفر الملف وإضافة الزر أو رسالة عدم التوفر
    if (files['mfbs/'] && files['mfbs/'].length > 0) {
        const downloadButton = document.createElement('button');
        downloadButton.classList.add('download-btn');
        downloadButton.innerText = 'Download';

        // استخدام رابط التنزيل من استجابة الخادم الخلفي
        const downloadUrl = files['mfbs/'][0].download_url;

        // إضافة حدث النقر مع استخدام رابط التنزيل
        downloadButton.addEventListener('click', function () {
            downloadFile(downloadUrl);
        });

        financialContainer.appendChild(downloadButton);
    } else {
        const noFileMessage = document.createElement('p');
        noFileMessage.classList.add('no-file');
        noFileMessage.innerText = 'No file available for download';
        financialContainer.appendChild(noFileMessage);
    }

    // إلحاق الحاوية المالية بحاوية النتائج
    resultContainer.appendChild(financialContainer);

    // عرض الحاوية الثانية لـ "قائمة الدخل"
    const incomeStatementContainer = document.createElement('div');
    incomeStatementContainer.classList.add('file-container');
    incomeStatementContainer.id = 'income-statement-container';

    // تعيين عنوان الحاوية
    const incomeStatementHeader = document.createElement('h3');
    incomeStatementHeader.innerText = 'قائمة الدخل';
    incomeStatementContainer.appendChild(incomeStatementHeader);

    // التحقق من توفر الملف وإضافة الزر أو رسالة عدم التوفر
    if (files['mfis/'] && files['mfis/'].length > 0) {
        const downloadButton = document.createElement('button');
        downloadButton.classList.add('download-btn');
        downloadButton.innerText = 'Download';

        // استخدام رابط التنزيل من استجابة الخادم الخلفي
        const downloadUrl = files['mfis/'][0].download_url;

        // إضافة حدث النقر مع استخدام رابط التنزيل
        downloadButton.addEventListener('click', function () {
            downloadFile(downloadUrl);
        });

        incomeStatementContainer.appendChild(downloadButton);
    } else {
        const noFileMessage = document.createElement('p');
        noFileMessage.classList.add('no-file');
        noFileMessage.innerText = 'No file available for download';
        incomeStatementContainer.appendChild(noFileMessage);
    }

    // إلحاق حاوية قائمة الدخل بحاوية النتائج
    resultContainer.appendChild(incomeStatementContainer);
}

// دالة لجلب الملفات وعرضها في الحاويات المناسبة
async function fetchFiles() {
    if (!registrationNumber) {
        console.error("لا يوجد رقم تسجيل!"); // سجل خطأ إذا لم يتم العثور على الرقم التسجيلي
        alert("رقم التسجيل مفقود! يرجى إكمال ملفك الشخصي.");
        return;
    }

    console.log("جلب الملفات للرقم التسجيلي:", registrationNumber); // سجل الرقم التسجيلي قبل استدعاء API

    const apiUrl = 'https://rzba6zeshb.execute-api.us-east-1.amazonaws.com/PROD/MFISBS';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                registration_number: registrationNumber
            })
        });

        if (response.ok) {
            console.log("تم جلب الملفات بنجاح من API."); // سجل نجاح استدعاء API
            const data = await response.json();

            if (data && data.body) {
                const parsedBody = JSON.parse(data.body); // تأكد من أن البيانات تم تحليلها بشكل صحيح
                console.log("البيانات متاحة، استدعاء displayFiles...");
                displayFiles(parsedBody); // مرر كائن الملفات إلى الدالة لعرضه
            } else {
                console.warn("لا توجد بيانات ملفات في استجابة API.");
                displayFiles({}); // مرر كائن فارغ إذا لم يتم إرجاع ملفات
            }
        } else {
            console.error("فشل في جلب الملفات. الحالة:", response.status);
            displayFiles({});
        }
    } catch (error) {
        console.error("خطأ في جلب الملفات:", error);
        displayFiles({});
        alert("خطأ: " + error.message);
    }
}

console.log("جاهز لجلب الملفات...");
fetchFiles(); // جلب الملفات مباشرة باستخدام الرقم التسجيلي من session storage

// Function to clear session storage and log out the user
function logOutAndClearSession() {
    // Clear all items in session storage
    sessionStorage.clear();

    // Redirect to the login page
   window.location.href = "https://mohasibfriend.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6oefeov5mb34okbe1fgf5l6lbd&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
}

// Get the existing logout button by its ID
const logoutButton = document.getElementById("logoutbutton");

// Add click event to the existing button
if (logoutButton) {
 logoutButton.addEventListener("click", logOutAndClearSession);
}
// Prevent going back to protected pages after logout
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        // If sessionStorage is empty (user is logged out), redirect to login page
        if (!sessionStorage.getItem("isLoggedIn")) {
            window.location.href = "https://mohasibfriend.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6oefeov5mb34okbe1fgf5l6lbd&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
        }
    }
});
