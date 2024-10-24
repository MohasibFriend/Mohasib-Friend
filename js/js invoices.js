// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage

// Load jQuery and execute logic when DOM is ready
if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {
        console.log("jQuery loaded successfully.");

        $(document).ready(function () {
            console.log("DOM fully loaded and ready.");
            initializePage();
        });
    };
    script.onerror = function () {
        console.error("Failed to load jQuery.");
    };
    document.head.appendChild(script);
} else {
    console.log("jQuery already loaded.");

    $(document).ready(function () {
        console.log("DOM fully loaded and ready.");
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
            <div style="margin-bottom: 20px;  padding: 15px;background-color: #f0f8ff;border: 3px solid #000;border-radius: 20px;width: 100%; font-size: 18px;">
                <h3 style="text-align: center; font-weight: bold; font-size: 18px; color: #000;">دليل الصفحة</h3>
                <p style="text-align: right; font-weight: bold; font-size: 18px; color: #000;">
                    هذه الصفحة مخصصة لعرض الفواتير الخاطئة التي تم إصدارها للعميل بناءً على بياناته المدخلة في صفحة الملف الشخصي.
                    بعد أن يقوم المستخدم بإدخال بيانات الاعتماد الصحيحة في صفحة الملف الشخصي (مثل رقم التسجيل)، يمكنه الانتقال إلى هذه
                    .الصفحة للاطلاع على قائمة الفواتير التي تحتوي على أخطاء أو مشاكل
                </p>
            </div>
        `;

        const pageDescriptionEnglish = `
            <div class="page-description">
            <div style="margin-bottom: 20px;  padding: 15px;background-color: #f0f8ff;border: 3px solid #000;border-radius: 20px;width: 100%; font-size: 18px;">
                <h3 style="text-align: center; font-weight: bold; font-size: 18px; color: #000;">Page Guide</h3>
                <p style="text-align: left; font-weight: bold; font-size: 18px; color: #000;">
                    This page is dedicated to displaying incorrect invoices that have been issued to the client based on the information provided in the profile page.
                    After the user inputs valid credentials in the profile page (such as the registration number), they can access this page to view a list of invoices
                    that contain errors or issues.
                </p>
            </div>
        `;

        pageDescriptionContainer.append(pageDescriptionArabic);
        pageDescriptionContainer.append(pageDescriptionEnglish);
    }

    // جلب وعرض التنبيهات
    fetchAlarms(registrationNumber);
}

// Function to fetch and display the alarm results in the table
async function fetchAlarms(registrationNumber) {
    console.log("Fetching alarms for registration number:", registrationNumber);

    // API URL (no query string, as the registration number will be sent in the body)
    const apiUrl = 'https://7qmz80p3ik.execute-api.us-east-1.amazonaws.com/DEV/FetchInvoiceAlarms';

    // Log the URL to verify it's correct
    console.log("API URL:", apiUrl);

    try {
        // Sending the registrationNumber as part of queryStringParameters in the body
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
            console.log("Successfully fetched alarms from API.");
            const data = await response.json();

            // Log the full response to check the structure
            console.log("API Response:", data);

            // Call function to parse and display the alarms
            if (data && data.body) {
                const parsedBody = JSON.parse(data.body);
                if (parsedBody.alarms) {
                    displayAlarms(parsedBody.alarms);
                } else {
                    console.warn("No alarms data found in API response body.");
                    displayAlarms([]);
                }
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
            border-collapse: separate;
            width: 100%;
            border-spacing: 10px;
        }
        #alarmsTable thead th {
            border: 3px solid black;
            padding: 10px;
            background-color: #a3b6e5;
            color: black;
            font-weight: bold;
            font-family: Arial, Helvetica, sans-serif;
            border-radius: 10px;
            text-align: center;
        }
        #alarmsTable td {
            padding: 10px;
            font-weight: bold;
            text-align: center;
            font-family: Arial, Helvetica, sans-serif;
        }
        /* Mobile Devices (max-width: 600px) */
        @media only screen and (max-width: 600px) {
            #alarmsTable {
                width: 100%;
                font-size: 12px;
            }
            #alarmsTable thead th, #alarmsTable td {
                padding: 5px;
                font-size: 10px;
            }
             #alarmsContainer {
                max-height: 75vh; /* ضبط ارتفاع الحاوية للهواتف */
                
            }
        }
        /* Tablets (min-width: 601px and max-width: 1024px) */
        @media only screen and (min-width: 601px) and (max-width: 1024px) {
            #alarmsTable {
                width: 100%;
                font-size: 14px;
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
                        <th>Message - رسالة</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    `;
    resultsContainer.append(alarmsContainer);
    const tableBody = $('#alarmsTable tbody');

    // Fill table with alarms data
    if (alarms && Array.isArray(alarms) && alarms.length > 0) {
        alarms.forEach((alarmData) => {
            const alarmRows = alarmData.split('\n');
            alarmRows.forEach((row) => {
                if (row.trim()) {
                    const alarmDetails = row.split(':');
                    const newRow = `<tr>
                        <td>${alarmDetails[0]?.trim() || '-'}</td>
                        <td>${alarmDetails[1]?.trim() || '-'}</td>
                        <td>${alarmDetails.slice(2).join(':').trim() || '-'}</td>
                    </tr>`;
                    tableBody.append(newRow);
                }
            });
        });
    } else {
        tableBody.append(`<tr><td colspan="3">No alarms on your invoices</td></tr>`);
    }

    // Scroll to the results container smoothly after displaying alarms
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
