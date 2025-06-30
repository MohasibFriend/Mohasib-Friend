// جلب الرقم التسجيلي من الـ sessionStorage لاحقاً (مؤقت)
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage
const userId =sessionStorage.getItem('userId')

/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
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
 * دالة لإظهار السبينر
 */
function showSpinner() {
    if (typeof $ !== 'undefined') {
        $("#spinner").show();
    } else {
        console.warn("jQuery غير محملة. لا يمكن إظهار السبينر.");
    }
}

/**
 * دالة لإخفاء السبينر
 */
function hideSpinner() {
    if (typeof $ !== 'undefined') {
        $("#spinner").hide();
    } else {
        console.warn("jQuery غير محملة. لا يمكن إخفاء السبينر.");
    }
}

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
    container.style.background = 'var(--background-navbar)';
    
    // Create file input container
    const fileInputContainer = document.createElement('div');
    fileInputContainer.className = 'custom-file-upload';  // Apply the custom class for styling
    fileInputContainer.style.display = 'inline-block';
    fileInputContainer.style.padding = '10px';
    fileInputContainer.style.border = '3px solid #000';
    fileInputContainer.style.borderRadius = '10px';
    fileInputContainer.style.backgroundColor = 'var(--background-nav)';
    fileInputContainer.style.marginBottom = '10px';
    fileInputContainer.style.marginTop = '50px';
    fileInputContainer.style.width = '90%';
    fileInputContainer.style.height='20px';



    // Create file input (Upload1) as a visible input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'Upload1';
    fileInput.name = 'file';
    fileInput.accept = '.xlsx';
    fileInput.style.display = 'inline-block';
    fileInput.style.width='100%';
    fileInput.style.position='absolute';
    fileInput.style.marginLeft='-100px';
    fileInput.style.color="var(--text-color)";

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
    uploadButton.style.backgroundColor = 'var(--background-nav)';
    uploadButton.style.color = '#fff';
    uploadButton.style.border = '#000000 solid 2px';
    uploadButton.style.borderRadius = '10px';
    uploadButton.style.padding = '10px 20px';
    uploadButton.style.fontSize = '16px';
    uploadButton.style.fontWeight = 'bold';
    uploadButton.style.cursor = 'pointer';
    uploadButton.style.marginTop = '10px';
    uploadButton.style.transition='0.3s';

    // Add hover effect for the button
    uploadButton.onmouseover = function () {
        uploadButton.style.backgroundColor = '#3d5c9a';
        uploadButton.style.transform = 'scale(1.05)'; // تأثير تكبير خفيف
    };
    uploadButton.onmouseout = function () {
        uploadButton.style.backgroundColor = 'var(--background-nav)';
        uploadButton.style.transform = 'scale(1)'; // إعادة الحجم الأصلي
    };

    container.appendChild(uploadButton);  // Append the button to the container

    // Create the upload button (UPLOAD) with styling
    const emptybtn = document.createElement('button');
    emptybtn.id = 'emptybtn';
    emptybtn.textContent = 'Download Empty File';
    emptybtn.style.backgroundColor = 'var(--background-nav)';
    emptybtn.style.color = '#fff';
    emptybtn.style.border = '#000000 solid 2px';
    emptybtn.style.borderRadius = '10px';
    emptybtn.style.padding = '10px 20px';
    emptybtn.style.fontSize = '16px';
    emptybtn.style.fontWeight = 'bold';
    emptybtn.style.cursor = 'pointer';
    emptybtn.style.marginTop = '10px';
    emptybtn.style.marginLeft='10px';
    emptybtn.style.transition='0.3s';

    // Add click event to download the file
    const fileUrl = 'https://docs.google.com/spreadsheets/d/1jp6rjXEaAVyS0GrFtNWz8S42ldf3Nvrt/export?format=xlsx';
    emptybtn.onclick = () => {
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = 'EmptyFile.xlsx'; // The name for the downloaded file
    anchor.click();
};
    // Add hover effect for the button
    emptybtn.onmouseover = function () {
        emptybtn.style.backgroundColor = '#3d5c9a';
        emptybtn.style.transform = 'scale(1.05)'; // تأثير تكبير خفيف
    };
    emptybtn.onmouseout = function () {
        emptybtn.style.backgroundColor = 'var(--background-nav)';
        emptybtn.style.transform = 'scale(1)'; // إعادة الحجم الأصلي
    };

    container.appendChild(emptybtn);  // Append the button to the container
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
        @media only screen and (max-width: 768px) {
            #UPLOAD2 {
                width: 85% !important;
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
    // إظهار السبينر قبل بدء عملية الجلب
    showSpinner();

    if (!registrationNumber) {
        alert('Registration number is missing! Please complete your profile.');
        console.error("No registration number provided!");
        hideSpinner();
        return;
    }

    const fileInput = document.getElementById('Upload1');
    if (!fileInput) {
        alert('File input not found.');
        console.error("No file input found with ID 'Upload1'.");
        hideSpinner();
        return;
    }

    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        hideSpinner();
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const fileContent = event.target.result;
        const base64Excel = btoa(String.fromCharCode(...new Uint8Array(fileContent)));

        const data = {
            userId: userId,
            file: {
                content: base64Excel
            }
        };

        try {
            const response = await fetch('https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_expinses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
               // عرض النافذة الناجحة
                showSuccessModal();
                // Optionally, you might want to refresh the presigned URL after upload
                fetchPresignedUrl(); // Fetch the presigned URL again after successful upload
            } else {
                const errorText = await response.text();
                alert(`Failed to upload file. Error: ${errorText}`);
            }
        } catch (err) {
            console.error('Error uploading file: ', err);
            alert('Error uploading file. Check console for details.');
        } finally {
            // إخفاء السبينر بعد انتهاء العملية سواء نجحت أم لا
            hideSpinner();
        }
    };

    reader.readAsArrayBuffer(file);
}

// دالة لجلب الـ presigned URL عند تحميل الصفحة
async function fetchPresignedUrl() {
    // إظهار السبينر قبل بدء عملية الجلب
    showSpinner();

    if (!registrationNumber) {
        console.error("رقم التسجيل مفقود. لا يمكن جلب الـ presigned URL.");
        hideSpinner();
        return;
    }

    const data = {
        userId: userId
        // لا يتم تضمين ملف هنا
    };

    try {
        const response = await fetch('https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_expinses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            let presignedUrl = '';

            if (result.body) {
                const body = JSON.parse(result.body);
                presignedUrl = body.presigned_url;
            } else if (result.presigned_url) {
                presignedUrl = result.presigned_url;
            }

            const container = document.getElementById('download');
            if (!container) {
                console.error("لا توجد حاوية ذات الـ ID 'download'.");
                hideSpinner();
                return;
            }

            // تنظيف محتويات الحاوية أولاً
            container.innerHTML = '';

            if (presignedUrl) {
                createDownloadButton(presignedUrl);
            } else {
                // لا تقم بإنشاء رابط التنزيل إذا لم يكن هناك presignedUrl
                // بدلاً من ذلك، قم بإظهار رسالة أو عرض صورة غير قابلة للنقر
                const message = document.createElement('p');
                message.textContent = 'لا يوجد ملف متاح للتنزيل.';
                message.style.color = '#ff0000'; // لون النص الأحمر للفت الانتباه
                message.style.fontWeight = 'bold';
                container.appendChild(message);

                // **إزالة أي رابط تنزيل موجود مسبقًا**
                const existingDownloadLink = container.querySelector('a');
                if (existingDownloadLink) {
                    existingDownloadLink.remove();
                }
            }
        } else {
            const errorText = await response.text();
            console.error(`فشل في جلب presigned URL. الخطأ: ${errorText}`);
            // يمكنك عرض رسالة للمستخدم هنا إذا رغبت
            const container = document.getElementById('download');
            if (container) {
                container.innerHTML = '';
                const message = document.createElement('p');
                message.textContent = 'حدث خطأ أثناء جلب رابط التنزيل.';
                message.style.color = '#ff0000';
                message.style.fontWeight = 'bold';
                container.appendChild(message);
            }
        }
    } catch (err) {
        console.error('خطأ في جلب presigned URL: ', err);
        // يمكنك عرض رسالة للمستخدم هنا إذا رغبت
        const container = document.getElementById('download');
        if (container) {
            container.innerHTML = '';
            const message = document.createElement('p');
            message.textContent = 'حدث خطأ غير متوقع.';
            message.style.color = '#ff0000';
            message.style.fontWeight = 'bold';
            container.appendChild(message);
        }
    } finally {
        // إخفاء السبينر بعد انتهاء العملية سواء نجحت أم لا
        hideSpinner();
    }
}

function createDownloadButton(presignedUrl) {
    const container = document.getElementById('download');

    if (!container) {
        console.error("لا توجد حاوية ذات الـ ID 'download'.");
        return;
    }

    // تنظيف محتويات الحاوية
    container.innerHTML = '';

    // إنشاء رابط التنزيل
    const downloadLink = document.createElement('a');
    downloadLink.href = presignedUrl;
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
    downloadLink.id = 'downloadLink'; // Assign a unique ID for easy reference

    // إنشاء عنصر الصورة
    const downloadImage = document.createElement('img');
    downloadImage.className = 'downloadImage';
    downloadImage.src = 'img/Expinses.png'; // استبدل هذا بالمسار إلى أيقونة إكسل الخاصة بك
    downloadImage.alt = 'تنزيل شيت إكسل';
    downloadImage.style.cursor = 'pointer';
    downloadImage.style.width = '40%';
    downloadImage.style.height = '400px';
    downloadImage.style.border = '3px solid #000';
    downloadImage.style.borderRadius = '20px';

    // إضافة تأثير عند المرور بالماوس فوق الصورة
    downloadImage.onmouseover = function () {
        downloadImage.style.opacity = '0.9';
    };
    downloadImage.onmouseout = function () {
        downloadImage.style.opacity = '1';
    };

    // إضافة الصورة إلى الرابط
    downloadLink.appendChild(downloadImage);

    // إضافة الرابط إلى الحاوية
    container.appendChild(downloadLink);
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

        createUploadElements();
        addEventListeners();

        // Fetch the presigned URL and create download button
        fetchPresignedUrl();
    });
}

/**
 * عرض نافذة النجاح بعد حذف الحساب
 */
function showSuccessModal() {
    // إزالة أي نافذة منبثقة حالية
    const existingModal = document.getElementById("successModal");
    if (existingModal) {
      existingModal.remove();
    }
  
    // إنشاء طبقة تغطية النافذة المنبثقة
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "successModal";
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.zIndex = "1000";
  
    // إنشاء محتوى النافذة المنبثقة
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "20px";
    modalContent.style.textAlign = "center";
    modalContent.style.maxWidth = "350px";
    modalContent.style.width = "80%";
    modalContent.style.border = "rgb(131, 155, 218) 16px solid";
  
    // إنشاء أيقونة العلامة الخضراء
    const checkmark = document.createElement("div");
    checkmark.innerHTML = "&#10004;"; // Unicode for checkmark
    checkmark.style.fontSize = "50px";
    checkmark.style.color = "#28a745"; // green color
    checkmark.style.marginBottom = "20px";
  
    // إنشاء الرسالة
    const messagePara = document.createElement("p");
    messagePara.innerHTML = ".تم حفظ مصروفاتك بنجاح<br>!شكرًا لاستخدامك محاسب فريند";

    messagePara.style.fontSize="18px";
    messagePara.style.fontWeight="bold";
  
    // إنشاء زر OK
    const okButton = document.createElement("button");
    okButton.textContent = "موافق";
    okButton.id = "okButton";
    okButton.style.marginTop = "20px";
    okButton.style.padding = "10px 20px";
    okButton.style.border = "none";
    okButton.style.backgroundColor = "#5581ed"; // primary color
    okButton.style.color = "#fff";
    okButton.style.borderRadius = "5px";
    okButton.style.cursor = "pointer";
    okButton.style.fontSize = "14px";
    okButton.style.fontWeight = "bold";
    okButton.style.transition="0.3s";

    okButton.addEventListener("mouseover", function () {
      okButton.style.backgroundColor = "rgb(50, 77, 145)"; // تغيير لون الخلفية عند التمرير
      okButton.style.color = "white"; // تغيير لون النص عند التمرير
      okButton.style.transform = "scale(1.05)"; // تأثير تكبير خفيف
      okButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.5)"; // إضافة ظل
    });
  
    okButton.addEventListener("mouseout", function () {
      okButton.style.backgroundColor = "#5581ed"; // اللون الأصلي
      okButton.style.color = "#fff"; // اللون الأصلي للنص
      okButton.style.transform = "scale(1)"; // إعادة الحجم الأصلي
      okButton.style.boxShadow = "none"; // إزالة الظل
    });
  
    // إضافة العناصر إلى محتوى النافذة المنبثقة
    modalContent.appendChild(checkmark);
    modalContent.appendChild(messagePara);
    modalContent.appendChild(okButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  
    // إضافة مستمع للزر OK
    okButton.addEventListener("click", function () {
      // مسح sessionStorage
      window.location.href = 'home.html';
      
    });
  
    // إضافة مستمع للزر OK
    modalOverlay.addEventListener("click", function () {
     
      window.location.href = 'home.html';
      
    });
  }



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

// Dynamically load jQuery if it's not already loaded
if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
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
