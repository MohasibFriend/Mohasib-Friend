// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage


// List of document types (rows for the table)
const documents = [
    'Tax Card - البطاقة الضريبية',
    'Commercial Register - السجل التجاري',
    'Operating License - رخصة التشغيل',
    'Industrial Register - السجل الصناعي',
    'Chamber of Commerce Subscription - اشتراك الغرفة التجارية',
    'Value Added Tax Certificate - شهادة ضريبة القيمة المضافة',
    'Egyptian Federation for Construction and Building Contractors Registration - تسجيل الاتحاد المصري لمقاولي التشييد والبناء',
    'Industrial Chambers Registration - اشتراك الغرف الصناعية',
    'Small and Medium Enterprises Registration - تسجيل المشروعات الصغيرة والمتوسطة',
    'Certificate of Import for Raw Materials, Production Supplies, Machinery, and Equipment - شهادة استيراد لخامات ومستلزمات الانتاج والالات والمعدات ',
    'Company Products Export Certificate - شهادة  تصدير منتجات الشركة',
    'Needs Card - بطاقة الاحتياجات',
    'Importers Register - سجل المستوردين',
    'Exporters Register - سجل المصدرين',
    'Commercial Agents Register - سجل وكلاء الشركة',
    'Lease contracts - عقود ايجار',
    'Car licenses - رخص سيارات',
    'Insurance Subscription -اشتراك التأمينات',
    'Renewal of Token (e-Invoice / e-Signature / Social Insurance) - تجديد التوكن ( الفاتورة الالكترونية / التوقيع الالكتروني / التأمينات )',
    'Other - وثيقة أخرى'
];

// Object to store selected files and their related names
let selectedFiles = {};

// Function to create dynamic elements on the page inside "Result" container
function createPageElements() {
    const resultContainer = document.getElementById('Result');
    if (!resultContainer) {
        alert('Result container not found.');
        return;
    }

    const container = document.createElement('div');
    container.style.width = '97%';
    container.style.height = 'auto';
    container.style.padding = '20px';
    container.style.backgroundColor = '#a3b6e5';
    container.style.border = '3px solid black';
    container.style.borderRadius = '20px';
    container.id = 'mainContainer'; // Added ID for applying media query

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.border = '3px solid black';
    table.style.borderRadius = '15px';
    table.style.marginTop = '20px';
    table.style.backgroundColor = '#ffffff';
    table.id = 'documentTable'; // Added ID for applying media query

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Document Name', 'Select File', 'Upload', 'Status', 'Expiry Date', 'Days Remaining', 'Download'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '3px solid black';
        th.style.padding = '10px';
        th.style.borderRadius = '10px';
        th.style.backgroundColor = '#a3b6e5';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    documents.forEach((documentName, index) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = documentName;
        nameCell.style.textAlign = 'center';
        nameCell.style.fontWeight = 'bold';
        row.appendChild(nameCell);

        const fileCell = document.createElement('td');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = `file${index + 1}`;
        fileInput.accept = '.pdf,.doc,.docx,.jpg,.png,.xlsx';
        fileInput.style.backgroundColor = '#a3b6e5';
        fileInput.style.border = '2px solid black';
        fileInput.style.borderRadius = '10px';
        fileInput.style.fontWeight = 'bold';
        fileInput.style.display = 'block';
        fileInput.style.margin = '0 auto';
        fileInput.style.width = '90%';

        // Handle file selection
        fileInput.addEventListener('change', function () {
            if (fileInput.files.length > 0) {
                selectedFiles[documentName] = fileInput.files[0];
                console.log(`${documentName} file selected:`, fileInput.files[0].name);
            }
        });
        fileCell.appendChild(fileInput);
        row.appendChild(fileCell);

        // Upload button column
        const uploadCell = document.createElement('td');
        const uploadButton = document.createElement('button');

        // إضافة الكلمتين "Upload" و"رفع" إلى الزر بحيث يكونان تحت بعضهما
        const firstWord = document.createElement('span');
        firstWord.textContent = 'Upload';
        firstWord.style.display = 'block'; // لضمان أن تكون الكلمة في سطر منفصل

        const secondWord = document.createElement('span');
        secondWord.textContent = 'رفع';
        secondWord.style.display = 'block'; // لضمان أن تكون الكلمة في سطر منفصل

        // إضافة الكلمتين إلى الزر
        uploadButton.appendChild(firstWord);
        uploadButton.appendChild(secondWord);

        // تنسيقات الزر
        uploadButton.style.display = 'block';
        uploadButton.style.padding = '10px';
        uploadButton.style.backgroundColor = '#a3b6e5';
        uploadButton.style.border = '2px solid black';
        uploadButton.style.borderRadius = '10px';
        uploadButton.style.width = '100%';
        uploadButton.style.fontWeight = 'bold';

        // إضافة الزر إلى الخلية
        uploadCell.appendChild(uploadButton);

        uploadButton.addEventListener('click', async () => {
            const file = selectedFiles[documentName];
            if (!file) {
                alert('برجاء اختيار الملف الذي تريد رفعه');
                return;
            }
            console.log(`Uploading file for ${documentName}`);
            await uploadDocument(file, documentName, row);
        });
        uploadCell.appendChild(uploadButton);
        row.appendChild(uploadCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = 'No File Uplouded';
        statusCell.style.textAlign = 'center';
        statusCell.style.fontWeight = 'bold';
        row.appendChild(statusCell);

        const expiryDateCell = document.createElement('td');
        expiryDateCell.textContent = 'Fetching...';
        expiryDateCell.style.textAlign = 'center';
        expiryDateCell.style.fontWeight = 'bold';
        row.appendChild(expiryDateCell);

        const daysRemainingCell = document.createElement('td');
        daysRemainingCell.textContent = 'Fetching...';
        daysRemainingCell.style.textAlign = 'center';
        daysRemainingCell.style.fontWeight = 'bold';
        row.appendChild(daysRemainingCell);

        // Download button column
        const downloadCell = document.createElement('td');
        const downloadButton = document.createElement('button');

        // إضافة الكلمتين "Download" و"تحميل" إلى الزر بحيث يكونان تحت بعضهما
        const firstWordDownload = document.createElement('span');
        firstWordDownload.textContent = 'Download';
        firstWordDownload.style.display = 'block'; // لضمان أن تكون الكلمة في سطر منفصل

        const secondWordDownload = document.createElement('span');
        secondWordDownload.textContent = 'تحميل';
        secondWordDownload.style.display = 'block'; // لضمان أن تكون الكلمة في سطر منفصل

        // إضافة الكلمتين إلى الزر
        downloadButton.appendChild(firstWordDownload);
        downloadButton.appendChild(secondWordDownload);

        // تنسيقات الزر
        downloadButton.style.color = '#000000';
        downloadButton.style.padding = '10px';
        downloadButton.style.backgroundColor = '#a3b6e5';
        downloadButton.style.border = '2px solid black';
        downloadButton.style.borderRadius = '10px';
        downloadButton.style.width = '100%';
        downloadButton.style.fontWeight = 'bold';
        downloadButton.disabled = true; // Initially disabled until file is uploaded

        // إضافة الزر إلى الخلية
        downloadCell.appendChild(downloadButton);
        row.appendChild(downloadCell);

        // إضافة الصف إلى tbody
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.appendChild(table);
    resultContainer.appendChild(container);
}

// Function to convert file to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get only the Base64 data (without the prefix)
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Upload document to Lambda
async function uploadDocument(file, docName, row) {
    const uploadApiUrl = 'https://7vj4phsced.execute-api.us-east-1.amazonaws.com/PROD/MFCDUF';  // Replace with actual Lambda URL

    try {
        const fileBase64 = await toBase64(file);

        const payload = {
            registration_number: registrationNumber,
            file_name: docName,
            file_content: fileBase64
        };

        const response = await fetch(uploadApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data) {
            alert(`تم رفع الملف بنجاح ${docName}`);
            row.querySelector('td:nth-child(4)').textContent = 'Uploaded';
            row.querySelector('td:nth-child(7) button').disabled = false;
        } else {
            console.error(`Error uploading document for ${docName}:`, data.message || data);
            alert(`Error: ${data.message || 'Failed to upload document.'}`);
        }
    } catch (error) {
        console.error(`خطأ في رفع ملف ${docName}:`, error);
        alert('Upload failed. Please try again.');
    }
}

// Fetch document statuses from Lambda
async function fetchDocumentStatuses() {
    const fetchApiUrl = 'https://7vj4phsced.execute-api.us-east-1.amazonaws.com/PROD/MFCDUF';  // Replace with your actual Lambda URL

    try {
        const response = await fetch(fetchApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                registration_number: registrationNumber  // Registration number sent in the payload
            })
        });

        const data = await response.json();
        
        // Log the data to inspect its structure
        console.log('Fetched data:', data);

        // Check if 'data' contains the expected array of documents
        if (response.ok && Array.isArray(data)) {
            updateTableWithStatus(data);  // Assuming 'data' contains the list of documents
        } else {
            console.error('Data is not an array or no data returned:', data);
            alert('Failed to fetch document statuses.');
        }
    } catch (error) {
        console.error('Error fetching document statuses:', error);
        alert('Failed to fetch document statuses. Please try again.');
    }
}

// Update table with fetched status details
function updateTableWithStatus(fileDetails) {
    const tbody = document.querySelector('tbody');
    fileDetails.forEach((fileDetail, index) => {
        const row = tbody.children[index];
        row.querySelector('td:nth-child(5)').textContent = fileDetail.expiry_date || 'N/A';
        row.querySelector('td:nth-child(6)').textContent = fileDetail.days_left || 'N/A';
        row.querySelector('td:nth-child(4)').textContent = fileDetail.alarm_status || 'No alarm';

        const downloadButton = row.querySelector('td:nth-child(7) button');
        if (fileDetail.download_url) {
            downloadButton.disabled = false;
            downloadButton.addEventListener('click', () => {
                window.open(fileDetail.download_url, '_blank');
            });
        } else {
            downloadButton.disabled = true;
        }
    });
}

// Initialize the app
function initApp() {
    $(document).ready(function () {
        console.log("DOM fully loaded and ready.");
        createPageElements();
        fetchDocumentStatuses();  // Fetch document statuses on page load
    });
}




// Dynamically load jQuery if it's not already loaded
if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {
        console.log("jQuery loaded successfully.");
        initApp();
    };
    script.onerror = function () {
        console.error("Failed to load jQuery.");
    };
    document.head.appendChild(script);
} else {
    console.log("jQuery already loaded.");
    initApp();
}

/* CSS Media Query added below */
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        #mainContainer {
            padding: 10px;
        }
        #documentTable {
            font-size: 12px;
        }
        th, td {
            padding: 5px;
        }
        input[type="file"], button {
            font-size: 12px;
            width: 100%;
        }
    }
    @media (max-width: 480px) {
        #mainContainer {
            padding: 1px;
        }
        #documentTable {
            font-size: 7px;
            width: 100%;
            margin-left: -20px;
        }
        th, td {
            padding: 2px;
        }
        input[type="file"], button {
            font-size: 7px;
            width: 100%;
        }
    }
`;
document.head.appendChild(style);
