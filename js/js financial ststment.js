// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage
const subscriptionStatus = sessionStorage.getItem('subscriptionStatus'); // جلب حالة الاشتراك من Session Storage
/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
const userId =sessionStorage.getItem('userId')

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


document.addEventListener('DOMContentLoaded', () => {
    // جلب الثيم من localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // يمكنك إضافة المزيد من الكود هنا للتعامل مع الإشعارات إذا لزم الأمر
});


/**
 * Function to show the spinner
 */
function showSpinner() {
    const spinner = document.getElementById('spinner'); // تأكد من وجود عنصر سبينر بالـ ID "spinner"
    if (spinner) {
        spinner.style.display = 'block';
    }
}

/**
 * Function to hide the spinner
 */
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}


/**
 * Function to display the fetched files (financial statements) in the container with download buttons.
 * @param {Array} files - مصفوفة الكائنات التي تحتوي على بيانات الملفات.
 * @param {boolean} animateDrop - إذا كانت true يتم تطبيق تأثير dropEffect، وإذا كانت false فلا يُطبَّق.
 */
function displayFiles(files, animateDrop = true) {
    const resultContainer = document.getElementById('RESULT'); // العنصر الذي سيتم عرض الملفات فيه
    resultContainer.innerHTML = ''; // مسح المحتويات السابقة

    if (!files || files.length === 0) {
        resultContainer.innerHTML = `<p>لا توجد ملفات متاحة للتحميل.</p>`;
        return;
    }

    // إضافة CSS مضمّن لتحسين واجهة المستخدم (يمكنك تغييره إذا رغبت)
    const style = document.createElement('style');
    style.innerHTML = `
        .file-container {
            margin: 20px;
            padding: 20px;
            border: 2px solid #000;
            border-radius: 20px;
            text-align: center;
            background-color: var(--background-navbar);
            color: var(--text-color);
        }
        .download-btn {
            padding: 10px 20px;
            margin-top: 10px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            background-color: #5f85d4;
            color: white;
            border-radius: 5px;
            transition: 0.5s;
        }
        .download-btn:hover {
            background-color: #0056b3;
        }
        .disabled-button {
            background-color: #2c2c2c !important;
            cursor: not-allowed;
            opacity: 0.6;
            color: #fff !important;
            font-weight: bold;
            font-size: 18px;
        }
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
    `;
    document.head.appendChild(style);

    files.forEach(file => {
        // إنشاء حاوية لكل ملف
        const fileContainer = document.createElement('div');
        fileContainer.classList.add('file-container');
        if (animateDrop) {
            fileContainer.style.animation = 'dropEffect 0.5s ease-in-out';
        } else {
            fileContainer.style.animation = 'none';
        }

        // تحديد السنة بناءً على اسم الملف أو حقل 'year'
        let yearLabel = file.year || "2025"; // الافتراضي لعام 2025
        if (file.s3_key && file.s3_key.includes('_2024')) {
            yearLabel = "2024";
        }

        // إضافة عنوان السنة
        const fileHeader = document.createElement('h3');
        fileHeader.innerText = yearLabel;
        fileContainer.appendChild(fileHeader);

        // إنشاء زر التحميل
        const downloadButton = document.createElement('button');
        downloadButton.classList.add('download-btn');
        downloadButton.innerText = 'Download';

        // التحقق من حالة الاشتراك
        if (subscriptionStatus === 'ACTIVE') {
            downloadButton.addEventListener("click", function () {
                const link = document.createElement("a");
                link.href = file.download_url;
                link.target = "_blank"; // فتح في تبويب جديد
                link.download = file.s3_key; // اسم الملف عند التنزيل
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        } else if (subscriptionStatus === 'FREE_TRIAL') {
            downloadButton.innerText = "للمشتركين فقط";
            downloadButton.disabled = true;
            downloadButton.classList.add("disabled-button");
        }

        fileContainer.appendChild(downloadButton);
        resultContainer.appendChild(fileContainer);
    });
}


/**
 * Function to load files (financial statements) from sessionStorage if available.
 * @returns {Array|null} - المصفوفة المحملة أو null إذا لم توجد بيانات.
 */
function loadFilesFromSession() {
    const sessionData = sessionStorage.getItem("financialStatements");
    if (sessionData) {
        try {
            return JSON.parse(sessionData);
        } catch (e) {
            console.error("Error parsing financial statements from sessionStorage:", e);
            return null;
        }
    }
    return null;
}


/**
 * Function to fetch the files from the Lambda API for financial statements.
 * @param {boolean} showSpinnerFlag - إذا كانت true يتم إظهار السبينر وتطبيق تأثير drop، وإذا false فلا.
 */
async function fetchFiles(showSpinnerFlag = true) {
    if (showSpinnerFlag) {
        showSpinner();
    }

    if (!registrationNumber) {
        console.error("Registration number is missing!");
        alert("Registration number is missing! Please complete your profile.");
        if (showSpinnerFlag) {
            hideSpinner();
        }
        return;
    }

    const apiUrl = 'https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_income_statment';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId
            })
        });

        if (response.ok) {
            const data = await response.json();

            // Parse the body (if it is a stringified JSON)
            let parsedBody;
            if (typeof data.body === 'string') {
                parsedBody = JSON.parse(data.body);
            } else {
                parsedBody = data.body;
            }

            const files = parsedBody.files || [];

            // تحديث بيانات الـ sessionStorage بالبيانات الجديدة
            sessionStorage.setItem("financialStatements", JSON.stringify(files));

            // عرض الملفات؛ إذا كان showSpinnerFlag true (أي لم توجد بيانات مسبقة) يتم تطبيق تأثير drop
            displayFiles(files, showSpinnerFlag);
        } else {
            console.error("Failed to fetch files. Status:", response.status);
            displayFiles([], showSpinnerFlag);
        }
    } catch (error) {
        console.error("Error fetching files:", error);
        displayFiles([], showSpinnerFlag);
        alert("Error: " + error.message);
    } finally {
        if (showSpinnerFlag) {
            hideSpinner();
        }
    }
}


/**
 * Initialization: يتم تحميل الملفات من الـ sessionStorage إن وُجدت ثم جلب البيانات من الـ API.
 */
function initializePage() {
    const cachedFiles = loadFilesFromSession();
    if (cachedFiles) {
        // عرض البيانات المحملة مسبقًا بدون تأثير drop
        displayFiles(cachedFiles, false);
    }
    // استدعاء الفيتش؛ إذا لم توجد بيانات مخزنة يتم تفعيل السبينر وتطبيق تأثير drop
    fetchFiles(!cachedFiles);
}


// Function to clear session storage and log out the user
function logOutAndClearSession() {
    sessionStorage.clear();
    window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazonaws.com/login?response_type=code&client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
}

const logoutButton = document.getElementById("logoutbutton");
if (logoutButton) {
    logoutButton.addEventListener("click", logOutAndClearSession);
}


// Load jQuery and initialize the page when DOM is ready
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


// Modal functions for showing information
function showInfo() {
    document.getElementById("infoModal").style.display = "block";
}

function closeModal() {
    document.getElementById("infoModal").style.display = "none";
}

window.onclick = function (event) {
    if (event.target == document.getElementById("infoModal")) {
        closeModal();
    }
};

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        closeModal();
    }
});
