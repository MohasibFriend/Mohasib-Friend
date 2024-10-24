// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage

// Define the animation in JavaScript
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
    
    table {
        animation: dropEffect 0.4s ease-out;
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Function to create dynamic elements on the page inside "Result" container
function createPageElements() {
    // Find the "Result" container
    const resultContainer = document.getElementById('Result');
    if (!resultContainer) {
        alert('Result container not found.');
        return;
    }

    // Create file input button outside of the table container
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileUpload';
    fileInput.accept = '.xlsx'; // Accept only .xlsx files
    fileInput.style.marginLeft = '-0px';
    fileInput.style.marginTop = '10px';
    fileInput.style.fontWeight = 'bold';
    fileInput.style.fontFamily ='Arial, Helvetica, sans-serif';
    fileInput.style.backgroundColor = '#a3b6e5';
    fileInput.style.borderRadius = '20px';
    fileInput.style.border = '3px solid black';

    // Create table to display uploaded files
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.height = '100%';
    table.style.backgroundColor = '#fff';
    table.style.border = '0px solid black';
    table.style.marginTop = '20px';
    table.style.fontFamily ='Arial, Helvetica, sans-serif';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Date', 'Download', 'Update'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '3px solid black';
        th.style.borderRadius = '10px';
        th.style.backgroundColor = 'rgb(163, 182, 229)';
        th.style.padding = '10px';
        th.style.textAlign = 'center';  // Center align the text
        th.style.height = '50px';  // Set a height for header cells
        th.style.width = '150px';  // Set a width for header cells
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody with one row to display the file
    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');

    // Create empty cells for Date, Download, and Update
    const dateCell = document.createElement('td');
    const downloadCell = document.createElement('td');
    const updateCell = document.createElement('td');

    // Center align the content in cells
    downloadCell.style.textAlign = 'center';
    updateCell.style.textAlign = 'center';

    row.appendChild(dateCell);
    row.appendChild(downloadCell);
    row.appendChild(updateCell);
    tbody.appendChild(row);

    table.appendChild(tbody);

    // Append the file input and the table to the "Result" container directly
    resultContainer.appendChild(fileInput);
    resultContainer.appendChild(table);

    // Fetch and display the existing file from the database
    fetchAndDisplayExistingFile();
}

// Function to handle file upload
async function uploadFile() {
    const fileInput = document.getElementById('fileUpload');
    if (!fileInput || !fileInput.files[0]) {
        alert('Please select a file.');
        return;
    }

    const file = fileInput.files[0];

    // Check if the file is an Excel .xlsx file
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx') {
        alert('Error: Please upload an Excel file with .xlsx extension.');
        return; // Stop the upload process
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async function(event) {
        const base64File = event.target.result.split(',')[1];  // Remove "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," prefix

        // Prepare the payload with registration number and base64 file content
        const payload = {
            registration_number: registrationNumber,
            file_content: base64File
        };

        
    };
    reader.readAsDataURL(file);
}

// Function to fetch and display the existing file from the database
async function fetchAndDisplayExistingFile() {
    if (!registrationNumber) {
        console.error('Registration number not found in session storage.');
        return;
    }

    try {
        const response = await fetch('https://wxgf8057ci.execute-api.us-east-1.amazonaws.com/PROD/MFJAPI', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'registration_number': registrationNumber
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.download_url) {
                updateTable(data.download_url);
            } else {
                console.warn('No download URL found in the response.');
            }
        } else {
            console.error('Failed to fetch existing file from database.');
        }
    } catch (error) {
        console.error('Error fetching existing file:', error);
    }
}

// Function to update the table after file upload
function updateTable(downloadUrl) {
    const tbody = document.querySelector('tbody');
    const row = tbody.querySelector('tr'); // Use the single existing row

    // Update date cell with the current date and time
    const dateCell = row.cells[0];
    const currentDateTime = new Date();
    const formattedDate = currentDateTime.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
    const formattedTime = currentDateTime.toTimeString().split(' ')[0]; // Get time in HH:MM:SS format
    dateCell.textContent = `${formattedDate} ${formattedTime}`; // Combine date and time
    dateCell.style.fontSize = '18px';
    dateCell.style.fontWeight = 'bold';
    dateCell.style.textAlign = 'center';
    dateCell.style.fontFamily ='Arial, Helvetica, sans-serif';

    // Update download cell with the download button
    const downloadCell = row.cells[1];
    downloadCell.innerHTML = ''; // Clear previous content
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.style.fontWeight = 'bold';
    downloadBtn.style.fontFamily ='Arial, Helvetica, sans-serif';
    downloadBtn.style.display = 'block';  // Make it block level to stack it
    downloadBtn.style.margin = '10px auto';  // Center the button
    downloadBtn.style.width = '100%';  // Match the width of header cells
    downloadBtn.style.height = '50px';  // Match the height of header cells
    downloadBtn.style.backgroundColor = 'rgb(163, 182, 229)';
    downloadBtn.style.border = '2px solid black';
    downloadBtn.style.padding = '10px';
    downloadBtn.style.borderRadius = '10px';
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'file_downloaded.xlsx';
        link.click();
    });
    downloadCell.appendChild(downloadBtn);

    // Update update cell with the update button
    const updateCell = row.cells[2];
    updateCell.innerHTML = ''; // Clear previous content
    const updateBtn = document.createElement('button');
    updateBtn.textContent = 'Update';
    updateBtn.style.fontWeight = 'bold';
    updateBtn.style.fontFamily ='Arial, Helvetica, sans-serif';
    updateBtn.style.display = 'block';  // Make it block level to stack it
    updateBtn.style.margin = '10px auto';  // Center the button
    updateBtn.style.width = '100%';  // Match the width of header cells
    updateBtn.style.height = '50px';  // Match the height of header cells
    updateBtn.style.backgroundColor = 'rgb(163, 182, 229)';
    updateBtn.style.border = '2px solid black';
    updateBtn.style.padding = '10px';
    updateBtn.style.borderRadius = '10px';
    updateBtn.addEventListener('click', () => {
        // Simulate a click on the hidden file input when "Update" is clicked
        const fileInput = document.getElementById('fileUpload');
        if (fileInput) {
            fileInput.click();  // Trigger the file selection dialog
        }
    });
    updateCell.appendChild(updateBtn);
}

// Function to add event listener to the existing "Upload" button on the page
function addUploadButtonListener() {
    const uploadButton = document.getElementById('UPLOAD');
    if (!uploadButton) {
        alert('Upload button not found.');
        return;
    }

    // Add event listener for the existing "Upload" button
    uploadButton.addEventListener('click', uploadFile);
}

// Initialize the app
function initApp() {
    $(document).ready(function () {
        console.log("DOM fully loaded and ready.");
        createPageElements();  // Create the dynamic page elements inside "Result"
        addUploadButtonListener();  // Add event listener to the existing "Upload" button
    });
}

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

// Dynamically load jQuery if it's not already loaded
if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {
        console.log("jQuery loaded successfully.");
        initApp();  // Initialize the app once jQuery is loaded
    };
    script.onerror = function () {
        console.error("Failed to load jQuery.");
    };
    document.head.appendChild(script);
} else {
    console.log("jQuery already loaded.");
    initApp();  // Initialize the app if jQuery is already loaded
}

// الحصول على العنصر الذي سنراقبه
const loadingBadge = document.getElementById("loadingBadge");

// زر UPLOAD
const uploadButton = document.getElementById("UPLOAD");

// وظيفة لإظهار شارة اللودينج
function showLoadingBadge() {
  loadingBadge.style.display = "block";
}

// وظيفة لإخفاء شارة اللودينج
function hideLoadingBadge() {
  loadingBadge.style.display = "none";
}

// إضافة مستمع الحدث للنقر على زر UPLOAD
uploadButton.addEventListener("click", async () => {
  // عرض شارة اللودينج عند الضغط على الزر
  showLoadingBadge();

  try {
    // هنا يمكنك إضافة منطق الرفع الفعلي (مثل رفع ملف، إلخ.)
    const response = await fetch("https://wxgf8057ci.execute-api.us-east-1.amazonaws.com/PROD/MFJAPI", {
      method: "POST",
      // يمكن إضافة معلومات الملف هنا
    });

    if (response.ok) {
      const data = await response.json();
      alert('تم رفع اليوميه بنجاح');
      updateTable(data.download_url);
    } else {
      alert('حدث خطأ في رفع اليوميه يرجى إعادة المحاولة');
    }
  } catch (error) {
    alert('حدث خطأ غير متوقع: ' + error.message);
  } finally {
    // إخفاء شارة اللودينج بعد الانتهاء من العملية، سواء كانت ناجحة أم لا
    hideLoadingBadge();
  }
});
