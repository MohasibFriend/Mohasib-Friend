// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage
const subscriptionStatus = sessionStorage.getItem('subscriptionStatus'); // جلب حالة الاشتراك من Session Storage
if (sessionStorage.getItem("userId")) {
  // إذا وجد userId في sessionStorage يمكن إكمال الكود هنا
} else {
  console.error("User ID is missing from sessionStorage. Handling Cognito callback.");
  window.location.href = "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login/continue?client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https%3A%2F%2Fmohasibfriend.github.io%2FMohasib-Friend%2Fhome.html&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
  //handleCognitoCallback(); // مُعلق وفق طلبك دون تغيير أي شيء آخر
}
// الحصول على الشهر الحالي
const currentMonth = new Date().getMonth() + 1; // getMonth() يعيد شهر من 0-11، لذا نضيف 1

// Function to create dynamic elements on the page inside "Result" container
function createPageElements() {
  const resultContainer = document.getElementById("Result");
  if (!resultContainer) {
    alert("Result container not found.");
    return;
  }

  const spinner = document.createElement("div");
  spinner.id = "loadingSpinner";
  spinner.style.position = "absolute";
  spinner.style.top = "70%";
  spinner.style.left = "50%";
  spinner.style.transform = "translate(-50%, -50%)";
  spinner.style.width = "80px";
  spinner.style.height = "80px";
  spinner.style.border = "8px solid #f3f3f3";
  spinner.style.borderTop = "8px solid #3498db";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 1s linear infinite";
  spinner.style.display = "none";
  resultContainer.appendChild(spinner);

  // Media query for tablet
  if (window.matchMedia("(max-width: 768px)").matches) { // Adjust for tablets
      spinner.style.width = "60px";
      spinner.style.height = "60px";
      spinner.style.top = "90%";
      spinner.style.left = "40%";
  }
  
  const container = document.createElement("div");
  container.style.width = "99%";
  container.style.height = "1055px";
  container.style.padding = "5px";
  container.style.backgroundColor = "rgb(163, 182, 229)"; // Set the background color as required
  container.style.border = "3px solid black";
  container.style.borderRadius = "20px";
  container.style.marginBottom = "50px";
  container.id = "tt";
  container.className = "tt";

  const resultDiv = document.createElement("div");
  resultDiv.style.height = "1000px";
  resultDiv.style.marginTop = "15px";
  resultDiv.style.padding = "10px";
  resultDiv.style.border = "3px solid black";
  resultDiv.style.borderRadius = "10px";
  resultDiv.style.overflowY = "scroll";
  resultDiv.id = "resultDiv";

  resultDiv.style.backgroundColor = "#fff"; // Set a background color to make the text readable

  container.appendChild(resultDiv);
  resultContainer.appendChild(container);

  fetchDataByRegistrationNumber(resultDiv, spinner);
}

// Function to format the date with leading zeros if necessary
function formatMonth(month) {
  return month.toString().padStart(2, "0");
}

// Fetch data from API using registration number and update result div
async function fetchDataByRegistrationNumber(resultDiv, spinner) {
    try {
        // Show the spinner while loading data for the table
        spinner.style.display = 'block';

        // Prepare the request body with the registration number
        const requestBody = {
            registration_number: registrationNumber
        };

        // Log to check if the request is being made

        // Log to check if the request is being made

        // Make the request to the Lambda function via the API Gateway
        const response = await fetch('https://2wpehvwkpa.execute-api.us-east-1.amazonaws.com/PROD/MFMD', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        // Log the status of the response to check if the request was successful
        // Parse the JSON response
        const responseData = await response.json();
        // Check if the response is successful and contains the declarations
        if (response.ok) {
            // Parse the `body` if it is a string and wrapped as a JSON string
            const parsedBody = JSON.parse(responseData.body);  // Ensure to parse the body string
            // Display sales and purchases in the table
            displayDeclarations(resultDiv, parsedBody);
        } else {
            resultDiv.textContent = `Error fetching data: ${responseData.message || 'Unknown error'}`;
        }
    } catch (error) {
        console.error('Error fetching declarations:', error);
        resultDiv.textContent = 'Error fetching declarations';
    } finally {
        // Hide the loading spinner once data is loaded
        spinner.style.display = 'none';
    }
}


// Function to display the fetched sales and purchases in a table
function displayDeclarations(resultDiv, data) {
  const sales = (data.sales || []).sort((a, b) =>
    a.s3_key.localeCompare(b.s3_key)
  );
  const purchases = (data.purchases || []).sort((a, b) =>
    a.s3_key.localeCompare(b.s3_key)
  );

  const salesMonths = new Map();
  const purchasesMonths = new Map();

  sales.forEach((sale) => {
    const month = sale.s3_key.split("_").pop().split(".")[0];
    salesMonths.set(month, sale);
  });

  purchases.forEach((purchase) => {
    const month = purchase.s3_key.split("_").pop().split(".")[0];
    purchasesMonths.set(month, purchase);
  });

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.maxHeight = "calc(100vh - 110px)";
  table.style.overflowY = "auto";
  table.style.margin = "20px auto";
  table.style.textAlign = "center";
  // Apply animation to the table
  table.style.animation = "dropEffect 0.3s ease-out"; // تطبيق تأثير الهبوط على الجدول

  const headerRow = document.createElement("tr");
  const headers = ["تاريخ الإقرار", "تحميل المبيعات", "تحميل المشتريات"];
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.id="th";
    th.style.padding = "15px";
    th.style.border = "3px solid black";
    th.style.borderRadius = "15px";
    th.style.backgroundColor = "rgb(163, 182, 229)";
    th.style.borderCollapse = "separate";
    th.style.fontSize = "18px";
    th.style.fontWeight = "bold";
    th.style.width="25%";
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  for (let month = 1; month <= 12; month++) {
    const formattedMonth = formatMonth(month);

    const row = document.createElement("tr");

    const dateCell = document.createElement("td");
    dateCell.style.padding = "10px";
    dateCell.style.fontSize = "15px";
    dateCell.style.fontWeight = "bold";
    dateCell.style.borderCollapse = "collapse";
    dateCell.style.borderBottom = "3px solid #000"; 
    dateCell.textContent = formattedMonth;
    row.appendChild(dateCell);

    // Helper function to create buttons based on subscription status
    function createButton(downloadUrl, text, isEnabled) {
      if (isEnabled) {
        const button = document.createElement("a");
        button.href = downloadUrl;
        button.textContent = text;
        button.style.padding = "10px";
        button.style.border = "3px solid black";
        button.style.borderRadius = "8px";
        button.style.textDecoration = "none";
        button.style.backgroundColor = "rgb(86, 123, 216)";
        button.style.color = "white";
        button.style.fontWeight = "bold";
        button.style.width = "90%";
        button.style.marginLeft = "-10px";
        button.style.alignItems = "center";
        button.style.display = "inline-block";
        button.target = "_blank"; // فتح الرابط في تبويب جديد
        return button;
      } else {
        const button = document.createElement("button");
        button.textContent = "للمشتركين فقط";
        button.style.padding = "10px";
        button.style.border = "3px solid gray";
        button.style.borderRadius = "8px";
        button.style.backgroundColor = "gray";
        button.style.color = "white";
        button.style.fontWeight = "bold";
        button.style.width = "90%";
        button.style.marginLeft = "-10px";
        button.style.cursor = "not-allowed";
        button.disabled = true;
        return button;
      }
    }

    // Create Sales Cell
    const salesCell = document.createElement("td");
    salesCell.style.padding = "20px";
    salesCell.style.borderCollapse = "collapse";
    salesCell.style.borderBottom = "3px solid #000"; 
    if (salesMonths.has(formattedMonth)) {
      const sale = salesMonths.get(formattedMonth);
      if (
        subscriptionStatus === 'ACTIVE' || 
        (subscriptionStatus === 'FREE_TRIAL' && (month === 1 || month === 6 || month === currentMonth -1))
      ) {
        const salesButton = createButton(sale.download_url, "تحميل المبيعات", true);
        salesCell.appendChild(salesButton);
      } else {
        const salesButton = createButton(null, "للمشتركين فقط", false);
        salesCell.appendChild(salesButton);
      }
      // إضافة مجموع عمود V (الإجمالي) تحت مجموع عمود W
      const sumVDiv = document.createElement("div");
      sumVDiv.textContent = `إجمالي المبيعات: ${sale.sum_v.toLocaleString()}`;
      sumVDiv.style.marginTop = "5px";
      sumVDiv.style.padding="5px";
      sumVDiv.style.fontSize = "14px";
      sumVDiv.style.color="#000";
      sumVDiv.style.borderRadius="5px";
      sumVDiv.style.fontWeight = "bold";
      salesCell.appendChild(sumVDiv);
      // إضافة مجموع عمود W (الضريبة) تحت الزر
      const sumWDiv = document.createElement("div");
      sumWDiv.textContent = `إجمالي الضريبة : ${sale.sum_w.toLocaleString()}`;
      sumWDiv.style.marginTop = "5px";
      sumWDiv.style.padding="5px";
      sumWDiv.style.fontSize = "14px";
      sumWDiv.style.color="#000";
      sumWDiv.style.fontWeight = "bold";
      salesCell.appendChild(sumWDiv);

      
    } else {
      salesCell.textContent = "لا يوجد إقرار"; // خلية فارغة إذا لم توجد بيانات مبيعات
      salesCell.style.fontWeight = "bold";
      salesCell.style.fontSize = "20px";
    }
    row.appendChild(salesCell);

    // Create Purchases Cell
    const purchasesCell = document.createElement("td");
    purchasesCell.style.padding = "20px";
    purchasesCell.style.borderCollapse = "collapse";
    purchasesCell.style.borderBottom = "3px solid #000"; 
    if (purchasesMonths.has(formattedMonth)) {
      const purchase = purchasesMonths.get(formattedMonth);
      if (
        subscriptionStatus === 'ACTIVE' || 
        (subscriptionStatus === 'FREE_TRIAL' && (month === 1 || month === 6 ||  month === currentMonth-1))
      ) {
        const purchasesButton = createButton(purchase.download_url, "تحميل المشتريات", true);
        purchasesCell.appendChild(purchasesButton);
      } else {
        const purchasesButton = createButton(null, "للمشتركين فقط", false);
        purchasesCell.appendChild(purchasesButton);
      }
      // إضافة مجموع عمود V (الإجمالي) تحت مجموع عمود W
      const sumVDiv = document.createElement("div");
      sumVDiv.textContent = `إجمالي المشتريات : ${purchase.sum_v.toLocaleString()}`;
      sumVDiv.style.marginTop = "5px";
      sumVDiv.style.padding="5px";     
      sumVDiv.style.fontSize = "14px";
      sumVDiv.style.color="#000";
      sumVDiv.style.fontWeight = "bold";
      purchasesCell.appendChild(sumVDiv);

      // إضافة مجموع عمود W (الضريبة) تحت الزر
      const sumWDiv = document.createElement("div");
      sumWDiv.textContent = `إجمالي الضريبة : ${purchase.sum_w.toLocaleString()}`;
      sumWDiv.style.marginTop = "5px";
      sumWDiv.style.padding="5px";
      sumWDiv.style.fontSize = "14px";
      sumWDiv.style.color="#000";
      sumWDiv.style.fontWeight = "bold";
      sumWDiv.style.borderRadius="5px";
      purchasesCell.appendChild(sumWDiv);

      
    } else {
      purchasesCell.textContent = "لا يوجد إقرار"; // خلية فارغة إذا لم توجد بيانات مشتريات
      purchasesCell.style.fontWeight = "bold";
      purchasesCell.style.fontSize = "20px";
    }
    row.appendChild(purchasesCell);

    table.appendChild(row);
  }
  
//----------------------------------------------------------------------------------------------------------------------------------
 // إنشاء صف جديد في الجدول
const aggregateRow = document.createElement("tr");

// خلية السنة 
const yearCell = document.createElement("td");
yearCell.style.padding = "10px";
yearCell.style.fontSize = "15px";
yearCell.style.fontWeight = "bold";
yearCell.style.borderCollapse = "collapse";
yearCell.style.borderBottom = "3px solid #000"; 

// استخراج السنة من رابط المبيعات أو المشتريات إذا كانت متاحة
let year = "غير متاح";
if (data.aggregate_purchases_url) {
  const match = data.aggregate_purchases_url.match(/(?:Purchases|Sales)_(\d{4})\.xlsx/);
  if (match) {
    year = match[1]; // استخراج السنة من الرابط
  }
} else if (data.aggregate_sales_url) {
  const match = data.aggregate_sales_url.match(/(?:Purchases|Sales)_(\d{4})\.xlsx/);
  if (match) {
    year = match[1]; // استخراج السنة من الرابط
  }
}
yearCell.textContent = year;
aggregateRow.appendChild(yearCell);

// خلية المبيعات للتجميع السنوي
const salesAggregateCell = document.createElement("td");
salesAggregateCell.style.padding = "20px";
salesAggregateCell.style.borderCollapse = "collapse";
salesAggregateCell.style.borderBottom = "3px solid #000"; 

if (data.aggregate_sales_url) {
  if (subscriptionStatus === 'ACTIVE') {
    const salesAggregateButton = createButton(data.aggregate_sales_url, "تحميل المبيعات", true);
    salesAggregateButton.style.display="none";
    salesAggregateCell.appendChild(salesAggregateButton);
  } else {
    const salesAggregateButton = createButton(null, "للمشتركين فقط", false);
    salesAggregateButton.style.display="none";

    salesAggregateCell.appendChild(salesAggregateButton);
  }

  // إضافة مجموع عمود W (الضريبة) تحت الزر
  const aggregateSumWDiv = document.createElement("div");
  aggregateSumWDiv.textContent = `مجموع الضريبة: ${data.aggregate_sales_sum_w.toLocaleString()}`;
  aggregateSumWDiv.style.marginTop = "5px";
  aggregateSumWDiv.style.padding="5px";
  aggregateSumWDiv.style.fontSize = "14px";
  aggregateSumWDiv.style.display = "inline-block"; // عرض العمود الأول
  aggregateSumWDiv.style.marginRight = "10px"; // مسافة صغيرة بين العناصر
  aggregateSumWDiv.style.display = "inline-block"; // عرض العمود الثاني
  aggregateSumWDiv.style.backgroundColor="rgb(86, 123, 216)";
  aggregateSumWDiv.style.border="#000 solid 3px";
  aggregateSumWDiv.style.borderRadius="5px";
  aggregateSumWDiv.style.color="#fff";
  aggregateSumWDiv.style.fontWeight = "bold";
  salesAggregateCell.appendChild(aggregateSumWDiv);

  // إضافة مجموع عمود V (الإجمالي) تحت مجموع عمود W
  const aggregateSumVDiv = document.createElement("div");
  aggregateSumVDiv.textContent = `إجمالي المبيعات: ${data.aggregate_sales_sum_v.toLocaleString()}`;
  aggregateSumVDiv.style.marginTop = "5px";
  aggregateSumVDiv.style.padding="5px";
  aggregateSumVDiv.style.fontSize = "14px";
  aggregateSumVDiv.style.display = "inline-block"; // عرض العمود الأول
  aggregateSumVDiv.style.marginRight = "10px"; // مسافة صغيرة بين العناصر
  aggregateSumVDiv.style.display = "inline-block"; // عرض العمود الثاني
  aggregateSumVDiv.style.backgroundColor="rgb(86, 123, 216)";
  aggregateSumVDiv.style.border="#000 solid 3px";
  aggregateSumVDiv.style.borderRadius="5px";
  aggregateSumVDiv.style.color="#fff";
  aggregateSumVDiv.style.fontWeight = "bold";
  salesAggregateCell.appendChild(aggregateSumVDiv);
} else {
  salesAggregateCell.textContent = "لا يوجد إقرار";
  salesAggregateCell.style.fontWeight = "bold";
  salesAggregateCell.style.fontSize = "20px";
}
aggregateRow.appendChild(salesAggregateCell);

// خلية المشتريات للتجميع السنوي
const purchasesAggregateCell = document.createElement("td");
purchasesAggregateCell.style.padding = "20px";
purchasesAggregateCell.style.borderCollapse = "collapse";
purchasesAggregateCell.style.borderBottom = "3px solid #000"; 

if (data.aggregate_purchases_url) {
  if (subscriptionStatus === 'ACTIVE') {
    const purchasesAggregateButton = createButton(data.aggregate_purchases_url, "تحميل المشتريات", true);
    purchasesAggregateButton.style.display="none";
    purchasesAggregateCell.appendChild(purchasesAggregateButton);
  } else {
    const purchasesAggregateButton = createButton(null, "للمشتركين فقط", false);
    purchasesAggregateButton.style.display="none";
    purchasesAggregateCell.appendChild(purchasesAggregateButton);
  }

  // إضافة مجموع عمود W (الضريبة) تحت الزر
  const aggregateSumWDiv = document.createElement("div");
  aggregateSumWDiv.textContent = `مجموع الضريبة: ${data.aggregate_purchases_sum_w.toLocaleString()}`;
  aggregateSumWDiv.style.marginTop = "5px";
  aggregateSumWDiv.style.padding="5px";
  aggregateSumWDiv.style.fontSize = "14px";
  aggregateSumWDiv.style.display = "inline-block"; // عرض العمود الأول
  aggregateSumWDiv.style.marginRight = "10px"; // مسافة صغيرة بين العناصر
  aggregateSumWDiv.style.display = "inline-block"; // عرض العمود الثاني
  aggregateSumWDiv.style.backgroundColor="rgb(86, 123, 216)";
  aggregateSumWDiv.style.border="#000 solid 3px";
  aggregateSumWDiv.style.borderRadius="5px";
  aggregateSumWDiv.style.color="#fff";
  aggregateSumWDiv.style.fontWeight = "bold";
  purchasesAggregateCell.appendChild(aggregateSumWDiv);

  // إضافة مجموع عمود V (الإجمالي) تحت مجموع عمود W
  const aggregateSumVDiv = document.createElement("div");
  aggregateSumVDiv.textContent = `إجمالي المشتريات: ${data.aggregate_purchases_sum_v.toLocaleString()}`;
  aggregateSumVDiv.style.marginTop = "5px";
  aggregateSumVDiv.style.padding="5px";
  aggregateSumVDiv.style.fontSize = "14px";
  aggregateSumVDiv.style.display = "inline-block"; // عرض العمود الأول
  aggregateSumVDiv.style.marginRight = "10px"; // مسافة صغيرة بين العناصر
  aggregateSumVDiv.style.display = "inline-block"; // عرض العمود الثاني
  aggregateSumVDiv.style.backgroundColor="rgb(86, 123, 216)";
  aggregateSumVDiv.style.border="#000 solid 3px";
  aggregateSumVDiv.style.borderRadius="5px";
  aggregateSumVDiv.style.color="#fff";
  aggregateSumVDiv.style.fontWeight = "bold";
  purchasesAggregateCell.appendChild(aggregateSumVDiv);
} else {
  purchasesAggregateCell.textContent = "لا يوجد إقرار";
  purchasesAggregateCell.style.fontWeight = "bold";
  purchasesAggregateCell.style.fontSize = "20px";
}
aggregateRow.appendChild(purchasesAggregateCell);

table.appendChild(aggregateRow);

  // Append the table to the resultDiv
  resultDiv.appendChild(table);
}

// Helper function to create a button
function createButton(downloadUrl, text, isEnabled = true) {
  if (isEnabled && downloadUrl) {
    const button = document.createElement("a");
    button.href = downloadUrl;
    button.textContent = text;
    button.style.padding = "10px";
    button.style.border = "3px solid black";
    button.style.borderRadius = "8px";
    button.style.textDecoration = "none";
    button.style.backgroundColor = "rgb(86, 123, 216)";
    button.style.color = "white";
    button.style.fontWeight = "bold";
    button.style.width = "90%";
    button.style.marginLeft = "-10px";
    button.style.alignItems = "center";
    button.style.display = "inline-block";
    button.target = "_blank"; // فتح الرابط في تبويب جديد
    return button;
  } else {
    const button = document.createElement("button");
    button.textContent = "للمشتركين فقط";
    button.style.padding = "10px";
    button.style.border = "3px solid gray";
    button.style.borderRadius = "8px";
    button.style.backgroundColor = "gray";
    button.style.color = "white";
    button.style.fontWeight = "bold";
    button.style.width = "90%";
    button.style.marginLeft = "-10px";
    button.style.cursor = "not-allowed";
    button.disabled = true;
    return button;
  }
}
// Helper function to create a button
function createButton(downloadUrl, text) {
  const button = document.createElement("a");
  button.href = downloadUrl;
  button.textContent = text;
  button.target = "_blank"; // Open link in a new tab
  return button;
}

// Helper function to extract the month from the key
function getMonthFromKey(key) {
  const parts = key.split("_");
  return parts[parts.length - 1].split(".")[0];
}

// Helper function to format the month as two digits
function formatMonth(month) {
  return month.toString().padStart(2, "0");
}

// Function to create dynamic elements on the page inside "Result" container
function createPageElements() {
  const resultContainer = document.getElementById("Result");
  if (!resultContainer) {
    alert("Result container not found.");
    return;
  }

  const spinner = document.createElement("div");
  spinner.id = "loadingSpinner";
  spinner.style.position = "absolute";
  spinner.style.top = "70%";
  spinner.style.left = "50%";
  spinner.style.transform = "translate(-50%, -50%)";
  spinner.style.width = "80px";
  spinner.style.height = "80px";
  spinner.style.border = "8px solid #f3f3f3";
  spinner.style.borderTop = "8px solid #3498db";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 1s linear infinite";
  spinner.style.display = "none";
  resultContainer.appendChild(spinner);

  // Media query for tablet
  if (window.matchMedia("(max-width: 768px)").matches) { // Adjust for tablets
      spinner.style.width = "60px";
      spinner.style.height = "60px";
      spinner.style.top = "90%";
      spinner.style.left = "40%";
  }
  
  const container = document.createElement("div");
  container.style.width = "99%";
  container.style.height = "1055px";
  container.style.padding = "5px";
  container.style.backgroundColor = "rgb(163, 182, 229)"; // Set the background color as required
  container.style.border = "3px solid black";
  container.style.borderRadius = "20px";
  container.style.marginBottom = "50px";
  container.id = "tt";
  container.className = "tt";

  const resultDiv = document.createElement("div");
  resultDiv.style.height = "1000px";
  resultDiv.style.marginTop = "15px";
  resultDiv.style.padding = "10px";
  resultDiv.style.border = "3px solid black";
  resultDiv.style.borderRadius = "10px";
  resultDiv.style.overflowY = "scroll";
  resultDiv.id = "resultDiv";

  resultDiv.style.backgroundColor = "#fff"; // Set a background color to make the text readable

  container.appendChild(resultDiv);
  resultContainer.appendChild(container);

  fetchDataByRegistrationNumber(resultDiv, spinner);
}

// Initialize the app when the document is fully loaded
function initApp() {
  $(document).ready(function () {
    createPageElements();
  });
}

// Dynamically load jQuery if it's not already loaded
if (typeof jQuery === "undefined") {
  const script = document.createElement("script");
  script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
  script.onload = function () {
    initApp();
  };
  script.onerror = function () {
    console.error("Failed to load jQuery.");
  };
  document.head.appendChild(script);
} else {
  initApp();
}

/* Add the keyframes for the animations */
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
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
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

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
