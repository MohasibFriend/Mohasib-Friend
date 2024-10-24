// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage

// Function to dynamically create the upload input and button
function createUploadElements() {
    const container = document.getElementById('UPLOAD2');  // Target the container with ID 'UPLOAD2'

    if (!container) {
        console.error("No container found with ID 'UPLOAD2'.");
        return;
    }

    // Style container with padding, border, and center alignment
    container.style.textAlign = 'center';
    container.style.padding = '20px';
    container.style.border = '3px solid #000000';
    container.style.borderRadius = '10px';
    container.style.marginTop = '90px';
    container.style.width = '97%';
    container.style.height = '850px';
    container.style.margin = 'auto';
    container.style.backgroundColor = '#ffffff';
    
    // Create file input container
    const fileInputContainer = document.createElement('div');
    fileInputContainer.className = 'custom-file-upload';  // Apply the custom class for styling
    fileInputContainer.style.display = 'inline-block';
    fileInputContainer.style.padding = '10px';
    fileInputContainer.style.border = '3px solid #5f85d4';
    fileInputContainer.style.borderRadius = '10px';
    fileInputContainer.style.backgroundColor = '#fff';
    fileInputContainer.style.marginBottom = '10px';
    fileInputContainer.style.marginTop = '300px';
    fileInputContainer.style.width = '90%';

    // Create file input (Upload1) as a visible input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'Upload1';
    fileInput.name = 'file';
    fileInput.accept = '.xlsx';
    fileInput.style.display = 'inline-block';

    // Append the input to the custom container
    fileInputContainer.appendChild(fileInput);

    // Append the styled file input container to the main container
    container.appendChild(fileInputContainer);

    // Create a break for spacing (optional)
    container.appendChild(document.createElement('br'));

    // Create the upload button (UPLOAD) with styling
    const uploadButton = document.createElement('button');
    uploadButton.id = 'UPLOAD';
    uploadButton.textContent = 'Upload';
    uploadButton.style.backgroundColor = '#5f85d4';
    uploadButton.style.color = '#fff';
    uploadButton.style.border = '#000000 solid 2px';
    uploadButton.style.borderRadius = '10px';
    uploadButton.style.padding = '10px 20px';
    uploadButton.style.fontSize = '16px';
    uploadButton.style.fontWeight = 'bold';
    uploadButton.style.cursor = 'pointer';
    uploadButton.style.marginTop = '10px';

    // Add hover effect for the button
    uploadButton.onmouseover = function () {
        uploadButton.style.backgroundColor = '#3d5c9a';
    };
    uploadButton.onmouseout = function () {
        uploadButton.style.backgroundColor = '#5f85d4';
    };

    container.appendChild(uploadButton);  // Append the button to the container

    // Add media queries styling
    const style = document.createElement('style');
    style.innerHTML = `
        /* Media queries for different device sizes */

        @media only screen and (max-width: 1366px) {
            #UPLOAD2 {
                width: 96% !important;
                padding: 10px;
                margin-top: 50px;
            }
            .custom-file-upload {
                width: 100%;
                padding: 5px;
            }
            #UPLOAD {
                font-size: 14px;
                padding: 8px 16px;
            }
        }

        /* Mobile devices */
        @media only screen and (max-width: 600px) {
            #UPLOAD2 {
                width: 90% !important;
                padding: 10px;
                margin-top: 50px;
            }
            .custom-file-upload {
                width: 100%;
                padding: 5px;
            }
            #UPLOAD {
                font-size: 14px;
                padding: 8px 16px;
            }
        }

        /* Tablets */
        @media only screen and (min-width: 601px) and (max-width: 1024px) {
            #UPLOAD2 {
                width: 95% !important;
                padding: 15px;
                margin-top: 70px;
            }
            .custom-file-upload {
                width: 85%;
                padding: 8px;
            }
            #UPLOAD {
                font-size: 15px;
                padding: 9px 18px;
            }
        }

        /* Desktop devices */
        @media only screen and (min-width: 1025px) {
            #UPLOAD2 {
                width: 60%;
                padding: 20px;
                margin-top: 90px;
            }
            .custom-file-upload {
                width: 80%;
                padding: 10px;
            }
            #UPLOAD {
                font-size: 16px;
                padding: 10px 20px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Function to handle file upload and call the API
async function uploadExcelFile() {
    const registrationNumber = sessionStorage.getItem('registrationNumber');
    if (!registrationNumber) {
        alert('Registration number is missing! Please complete your profile.');
        console.error("No registration number provided!");
        return;
    }

    const fileInput = document.getElementById('Upload1');
    if (!fileInput) {
        alert('File input not found.');
        console.error("No file input found with ID 'Upload1'.");
        return;
    }

    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const fileContent = event.target.result;
        const base64Excel = btoa(String.fromCharCode(...new Uint8Array(fileContent)));

        const data = {
            registration_number: registrationNumber,
            file: {
                content: base64Excel
            }
        };

        try {
            const response = await fetch('https://csgb1q3p7h.execute-api.us-east-1.amazonaws.com/DEV/mfexpenseslist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                alert(`File uploaded successfully! Message: ${result.body}`);
            } else {
                const errorText = await response.text();
                alert(`Failed to upload file. Error: ${errorText}`);
            }
        } catch (err) {
            console.error('Error uploading file: ', err);
            alert('Error uploading file. Check console for details.');
        }
    };

    reader.readAsArrayBuffer(file);
}

// Function to add event listeners for the dynamically created Upload button
function addEventListeners() {
    const uploadButton = document.getElementById('UPLOAD');
    if (!uploadButton) {
        console.error("Upload button not found.");
        return;
    }

    uploadButton.addEventListener('click', uploadExcelFile);
}

// Initialize the app (ensure everything is set up after jQuery is loaded)
function initApp() {
    $(document).ready(function () {
        console.log("DOM fully loaded and ready.");

        createUploadElements();
        addEventListeners();
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
