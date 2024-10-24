// Load jQuery if it's not already loaded
if (typeof jQuery === 'undefined') {
    var script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {
        console.log("jQuery loaded successfully.");

        // Ensure the DOM is ready and only then bind the button click event
        $(document).ready(function () {
            console.log("DOM fully loaded and ready.");
            addEventListeners();  // Add event listener for Save button
            addInstructions();    // Add instructions to the screen
            createDataTable();    // Create the table to display data
        });
    };
    script.onerror = function () {
        console.error("Failed to load jQuery.");
    };
    document.head.appendChild(script);
} else {
    console.log("jQuery already loaded.");

    // If jQuery is already loaded, bind the click event immediately
    $(document).ready(function () {
        console.log("DOM fully loaded and ready.");
        addEventListeners();  // Add event listener for Save button
        addInstructions();    // Add instructions to the screen
        createDataTable();    // Create the table to display data
    });
}

// Function to add event listeners
function addEventListeners() {
    // Event listener for saveButton click
    $('.saveButton').on('click', saveClientCredentials);
}

// Function to handle the save button click event
function saveClientCredentials() {
    // Remove focus (blur) from the saveButton
    $('.saveButton').blur();

    // Retrieve input values from the form
    var registrationNumber = $('.input1').val().trim();
    var clientid = $('.input2').val().trim();
    var client_secret = $('.input3').val().trim();

    // Retrieve userId from session storage
    var userId = sessionStorage.getItem('userId');
    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    // Log captured values to console for debugging
    console.log("Captured values:", registrationNumber, clientid, client_secret, userId);

    console.log("Validation passed. Preparing to upload credentials...");

    // Call the API and handle success or error responses
    uploadClientCredentials(userId, registrationNumber, clientid, client_secret)
        .then(function (result) {
            if (result && result.success) {
                console.log("Upload Success: " + result.message);  // Log success
                alert("Credentials saved successfully.");
                
                // Update table with the new data
                updateDataTable(registrationNumber, clientid, client_secret);
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
function updateDataTable(registrationNumber, clientid, client_secret) {
    // Clear existing table data
    $('#dataTable tbody').empty();

    // Add new data as a row in the table
    var newRow = `
        <tr>
            <td>${registrationNumber}</td>
            <td>${clientid}</td>
            <td>${client_secret}</td>
        </tr>
    `;

    $('#dataTable tbody').append(newRow);
}
// Function to validate inputs using regex and check for empty values
function validateInputs(registrationNumber, clientid, client_secret) {
    var minLength = 3;
    var regexPattern = '^[a-zA-Z0-9]{' + minLength + ',}$';
    var registrationRegex = new RegExp(regexPattern);
    var clientidRegex = new RegExp(regexPattern);
    var clientSecretRegex = new RegExp(regexPattern);

    // Check if registration number is empty or doesn't match the regex
    if (!registrationNumber || !registrationNumber.match(registrationRegex)) {
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
async function uploadClientCredentials(userId, registration_number, client_id, client_secret) {
    var payload = {
        user_id: userId,
        registration_number: registration_number,
        clientid: client_id,
        client_secret: client_secret
    };

    var apiUrl = 'https://ai5un58stf.execute-api.us-east-1.amazonaws.com/PROD/MFCC'; // Original API URL

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

            // Show success message
            alert("Success: " + data.body);

            // Return success
            return { success: true, message: data.body };
        } else {
            var errorData = await response.json();  // Parse error response
            var errorMessage = errorData.message || 'Status code ' + response.status;
            alert("Error: " + errorMessage);

            // Return failure
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error("Error during API request:", error);
        alert("Error: " + error.message);

        // Return failure
        return { success: false, message: error.message };
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
        console.log('Instructions already exist, not adding again.');
        return; // Prevent adding instructions again
    }

    // Create container for English instructions
    var englishContainer = $('<div></div>').addClass('instruction-container-english-instructions');

    // English text content
    englishContainer.html(`
        <h3>Instructions for Entering Credentials:</h3>
        <p><strong>Registration No.:</strong> Enter your unique registration number issued by the ETA.</p>
        <p><strong>Client ID & Client Secret:</strong> Log into the <a href="https://invoicing.eta.gov.eg" target="_blank">ETA portal</a>, go to your taxpayer profile, and under ERP Integration generate these keys.</p>
    `);
    

    // Create container for Arabic instructions
    var arabicContainer = $('<div></div>').addClass('instruction-container-arabic-instructions');

    // Arabic text content
    arabicContainer.html(`
        <h3>:إرشادات لإدخال البيانات</h3>
        <p><strong>رقم التسجيل:</strong> أدخل رقم التسجيل الفريد الخاص بك كما هو صادر عن مصلحة الضرائب المصرية.</p>
        <p><strong>معرّف العميل والسر السري:</strong> قم بتسجيل الدخول إلى <a href="https://invoicing.eta.gov.eg" target="_blank">بوابة الفاتورة الإلكترونية</a>، وانتقل إلى ملفك الشخصي، وقم بتوليد هذه المفاتيح تحت قسم تكامل ERP.</p>
    `);

    // Insert both containers into the DOM positioned near the central box
    englishContainer.insertBefore(centerBox);  // Insert English text before the center box
    
    arabicContainer.insertBefore(centerBox);    // Append Arabic text after the center box
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
