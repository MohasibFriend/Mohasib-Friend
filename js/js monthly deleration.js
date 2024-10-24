// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage

// Function to create dynamic elements on the page inside "Result" container
function createPageElements() {
    // Find the "Result" container
    const resultContainer = document.getElementById('Result');
    if (!resultContainer) {
        alert('Result container not found.');
        return;
    }

    // Create a container for the fields inside the "Result" container
    const container = document.createElement('div');
    container.style.width = '98.5%';
    container.style.height = '100%';
    container.style.padding = '5px';
    container.style.backgroundColor = 'rgb(163, 182, 229)'; // Set the background color as required
    container.style.border = '3px solid black';
    container.style.borderRadius = '20px';

    // Create div to display data instead of textarea
    const resultDiv = document.createElement('div');
    /*resultDiv.style.width = '100%';*/
    resultDiv.style.height = '400px';
    resultDiv.style.marginTop = '15px';
    resultDiv.style.padding = '10px';
    resultDiv.style.border = '3px solid black';
    resultDiv.style.borderRadius = '10px';
    resultDiv.style.overflowY = 'scroll';
    resultDiv.style.backgroundColor = '#fff';  // Set a background color to make the text readable

    // Add a date picker (month and year only) and search button
    const searchContainer = document.createElement('div');
    searchContainer.style.marginBottom = '20px';
    searchContainer.style.textAlign = 'center'; // Center the search elements

    // Date input for month and year
    const dateInput = document.createElement('input');
    dateInput.type = 'month';  // This will allow selecting only month and year
    dateInput.id = 'datePicker';
    
    dateInput.style.fontWeight = 'bold';
    dateInput.style.marginLeft = '20px';
    dateInput.style.marginTop = '10px';
    dateInput.style.width = '150px';
    dateInput.style.height = '25px';
    dateInput.style.border = '3px solid #000';
    dateInput.style.borderRadius = '15px';
    dateInput.style.padding = '10px';
    searchContainer.appendChild(dateInput);

    // Search button
    const searchButton = document.createElement('button');
    searchButton.textContent = 'بحث';
    searchButton.style.padding = '10px';
    searchButton.style.fontWeight = 'bold';
    searchButton.style.width = '150px';
    searchButton.style.height = '50px';
    searchButton.style.marginLeft ='20px';
    searchButton.style.marginTop = '10px';
    searchButton.style.border = '3px solid black';
    searchButton.style.borderRadius = '15px';
    searchButton.style.backgroundColor = 'rgb(86 123 216)';
    searchButton.style.color = 'white';
    searchButton.onclick = function () {
        const selectedDate = dateInput.value;  // Get selected month and year
        if (selectedDate) {
            filterDeclarationsByDate(resultDiv, selectedDate);
        } else {
            alert('Please select a valid month and year.');
        }
    };
    searchContainer.appendChild(searchButton);

    // Append the search container inside the main container
    container.appendChild(searchContainer);

    // Append result div (for the table) to the container
    container.appendChild(resultDiv);

    // Append the container to the "Result" container
    resultContainer.appendChild(container);

    // Fetch data for the table
    fetchDataByRegistrationNumber(resultDiv);
}

// Function to format the date with dashes (YYYY-MM-DD)
function formatDate(dateString) {
    if (dateString.length === 8) {
        return `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6)}`;
    }
    return dateString;  // Return the original string if it's not in the expected format
}

// Fetch data from API using registration number and update result div
async function fetchDataByRegistrationNumber(resultDiv) {
    try {
        // Prepare the request body with the registration number
        const requestBody = {
            registration_number: registrationNumber
        };

        // Log to check if the request is being made
        console.log("Sending request with body:", requestBody);

        // Make the request to the Lambda function via the API Gateway
        const response = await fetch('https://2wpehvwkpa.execute-api.us-east-1.amazonaws.com/PROD/MFMD', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        // Log the status of the response to check if the request was successful
        console.log("API Response Status:", response.status);

        // Parse the JSON response
        const responseData = await response.json();
        console.log("API Response Data:", responseData);  // Log the response data

        // Check if the response is successful and contains the declarations
        if (response.ok) {
            // Parse the `body` if it is a string and wrapped as a JSON string
            const parsedBody = JSON.parse(responseData.body);  // Ensure to parse the body string
            console.log("Parsed Data:", parsedBody);

            // Display sales and purchases in the table
            displayDeclarations(resultDiv, parsedBody);
        } else {
            resultDiv.textContent = `Error fetching data: ${responseData.message || 'Unknown error'}`;
        }
    } catch (error) {
        console.error('Error fetching declarations:', error);
        resultDiv.textContent = 'Error fetching declarations';
    }
}

// Function to display the fetched sales and purchases in a table
function displayDeclarations(resultDiv, data) {
    // Create table
    const table = document.createElement('table');
    table.style.width = '97.4%';
    table.style.maxHeight ='calc(100vh - 110px)';
    table.style.overflowY ='auto';
    table.style.margin = '20px auto';
    table.style.textAlign = 'center';

    // Apply animation to the table
    table.style.animation = 'dropEffect 0.3s ease-out';  // Apply the dropEffect animation to the table

    // Table header row
    const headerRow = document.createElement('tr');
    const headers = ['تاريخ الإقرار', 'تحميل المبيعات', 'تحميل المشتريات'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '15px';
        th.style.border = '3px solid black';
        th.style.borderRadius = '15px';
        th.style.backgroundColor = 'rgb(163, 182, 229)';
        th.style.borderCollapse = 'separate';
        th.style.fontSize = '18px';
        th.style.fontWeight = 'bold';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Process sales and purchases
    const sales = data.sales || [];  // Default to empty array if undefined
    const purchases = data.purchases || [];  // Default to empty array if undefined

    // Loop over each sale and purchase
    for (let i = 0; i < Math.max(sales.length, purchases.length); i++) {
        const row = document.createElement('tr');

        // Date column
        const dateCell = document.createElement('td');
        dateCell.style.padding = '10px';
        dateCell.style.fontSize = '15px';
        dateCell.style.fontWeight = 'bold';
        dateCell.style.borderRadius = '15px';

        const saleDate = sales[i] ? formatDate(sales[i].s3_key.split('_').pop().split('.')[0]) : '';
        const purchaseDate = purchases[i] ? formatDate(purchases[i].s3_key.split('_').pop().split('.')[0]) : '';
        dateCell.textContent = saleDate || purchaseDate;
        row.appendChild(dateCell);

        // Sales download column
        const salesCell = document.createElement('td');
        salesCell.style.padding = '20px';

        if (sales[i]) {
            const salesButton = document.createElement('a');
            salesButton.href = sales[i].download_url;
            salesButton.textContent = 'تحميل المبيعات';
            salesButton.style.padding = '10px';
            salesButton.style.border = '3px solid black';
            salesButton.style.borderRadius = '8px';
            salesButton.style.textDecoration = 'none';
            salesButton.style.backgroundColor = 'rgb(86 123 216)';
            salesButton.style.color = 'white';
            salesButton.style.fontWeight = 'bold';
            salesButton.style.width = '100%';
            salesCell.appendChild(salesButton);
        }
        row.appendChild(salesCell);

        // Purchases download column
        const purchasesCell = document.createElement('td');
        purchasesCell.style.padding = '20px';

        if (purchases[i]) {
            const purchasesButton = document.createElement('a');
            purchasesButton.href = purchases[i].download_url;
            purchasesButton.textContent = 'تحميل المشتريات';
            purchasesButton.style.padding = '10px';
            purchasesButton.style.border = '3px solid black';
            purchasesButton.style.borderRadius = '8px';
            purchasesButton.style.textDecoration = 'none';
            purchasesButton.style.backgroundColor = 'rgb(86 123 216)';
            purchasesButton.style.color = 'white';
            purchasesButton.style.fontWeight = 'bold';
            purchasesButton.style.width = '100%';
            purchasesCell.appendChild(purchasesButton);
        }
        row.appendChild(purchasesCell);

        table.appendChild(row);
    }

    // Append table to resultDiv
    resultDiv.appendChild(table);
}

// Filter declarations based on the selected date (month and year)
function filterDeclarationsByDate(resultDiv, selectedDate) {
    const rows = resultDiv.querySelectorAll('table tr:not(:first-child)'); // Select all rows except the header row
    rows.forEach(row => {
        const dateCell = row.querySelector('td').textContent;
        const formattedSelectedDate = selectedDate.replace('-', '');  // Format selected date as YYYYMM
        const rowDate = dateCell.replace('-', '');  // Format row date as YYYYMM
        if (rowDate.startsWith(formattedSelectedDate)) {
            row.style.display = '';  // Show row if it matches the selected date
        } else {
            row.style.display = 'none';  // Hide row if it doesn't match
        }
    });
}




// Initialize the app when the document is fully loaded
function initApp() {
    $(document).ready(function () {
        console.log("DOM fully loaded and ready.");
        createPageElements();  // Create the dynamic page elements inside "Result"

        // Check for undefined or null elements
        try {
            if (typeof hasNavigationWidgets !== 'undefined' && hasNavigationWidgets !== null) {
                console.log("Navigation widgets are defined.");
                // Further actions if needed
            } else {
                console.warn("hasNavigationWidgets is undefined or null.");
            }
        } catch (error) {
            console.error("Error checking navigation widgets:", error);
        }
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

/* Add the keyframes for the dropEffect animation */
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
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
document.head.appendChild(styleSheet);


