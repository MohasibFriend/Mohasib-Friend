// Fetch registration number from sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // Get registration number from sessionStorage
if (sessionStorage.getItem("userId")) {
    // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
} else {
    console.error("User ID is missing from sessionStorage. Handling Cognito callback.");
    window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login/continue?client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https%3A%2F%2Fmohasibfriend.github.io%2FMohasib-Friend%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
    //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
}
/**
 * Function to show the spinner
 */
function showSpinner() {
    const spinner = document.getElementById('spinner'); // Ensure your spinner element has this ID
    if (spinner) {
        spinner.style.display = 'block'; // Show the spinner
    }
}

/**
 * Function to hide the spinner
 */
function hideSpinner() {
    const spinner = document.getElementById('spinner'); // Ensure your spinner element has this ID
    if (spinner) {
        spinner.style.display = 'none'; // Hide the spinner
    }
}


// Function to display the fetched file in a container with a download button
function displayFile(file) {
    const resultContainer = document.getElementById('RESULT'); // Target the 'RESULT' container
    resultContainer.innerHTML = ''; // Clear any existing content

    // Check if the file object exists and has the required keys
    if (!file || !file.s3_key || !file.download_url) {
        resultContainer.innerHTML = `<p>No file available for download.</p>`;
        return;
    }

    // Add inline CSS for better UI
    const style = document.createElement('style');
    style.innerHTML = `
        .file-container {
            margin: 20px;
            padding: 10px;
            border: 2px solid #000;
            border-radius: 20px;
            text-align: center;
            animation: dropEffect 0.5s ease-in-out;
            
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

    // Create a container for the file
    const fileContainer = document.createElement('div');
    fileContainer.classList.add('file-container');

    // Add a header for the file
    const fileHeader = document.createElement('h3');
    fileHeader.innerText = 'قائمة الدخل'; // Arabic text for "Income Statement"
    fileContainer.appendChild(fileHeader);

    // Add a download button
    const downloadButton = document.createElement('button');
    downloadButton.classList.add('download-btn');
    downloadButton.innerText = 'Download';

    // Set the download URL from the response
    downloadButton.addEventListener('click', function () {
        const link = document.createElement('a');
        link.href = file.download_url;
        link.target = "_blank"; // Open in a new tab
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    fileContainer.appendChild(downloadButton);
    resultContainer.appendChild(fileContainer);
}

// Function to fetch the file from the Lambda API
async function fetchFile() {
    // Show spinner before starting the fetch operation
    showSpinner();

    if (!registrationNumber) {
        console.error("Registration number is missing!");
        alert("Registration number is missing! Please complete your profile.");
        hideSpinner(); // Hide spinner if validation fails
        return;
    }


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
            const data = await response.json();

            // Parse the body if it is a stringified JSON
            let parsedBody;
            if (typeof data.body === 'string') {
                parsedBody = JSON.parse(data.body); // Properly parse the stringified JSON
            } else {
                parsedBody = data.body; // Use it directly if it's already an object
            }

            displayFile(parsedBody); // Pass the parsed object to displayFile
        } else {
            console.error("Failed to fetch file. Status:", response.status);
            displayFile({});
        }
    } catch (error) {
        console.error("Error fetching file:", error);
        displayFile({});
        alert("Error: " + error.message);
    } finally {
        // Hide spinner after the fetch operation completes
        hideSpinner();
    }
}


console.log("Ready to fetch file...");
fetchFile(); // Fetch the file using the registration number from sessionStorage

// Function to clear session storage and log out the user
function logOutAndClearSession() {
    // Clear all items in session storage
    sessionStorage.clear();

    // Redirect to the login page
    window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
}

// Get the existing logout button by its ID
const logoutButton = document.getElementById("logoutbutton");

// Add click event to the existing button
if (logoutButton) {
    logoutButton.addEventListener("click", logOutAndClearSession);
}

// Function to show information modal
function showInfo() {
    document.getElementById("infoModal").style.display = "block";
}

// Function to close modal
function closeModal() {
    document.getElementById("infoModal").style.display = "none";
}

// Close the modal when clicking outside the content
window.onclick = function (event) {
    if (event.target == document.getElementById("infoModal")) {
        closeModal();
    }
};


// إضافة مستمع حدث للضغط على مفتاح
window.addEventListener('keydown', function(event) {
    // التحقق مما إذا كان المفتاح المضغوط هو Esc
    if (event.key === 'Escape' || event.key === 'Esc') {
        closeModal();
    }
});