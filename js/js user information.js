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

// Define CONFIG globally with updated Cognito settings
const CONFIG = {
  app: {
    getRegistrationNumberApi:
      "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_reg_num",
    getNotificationsApi:
      "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_notification",
    /*userProfileScreenUrl: "https://mohasibfriend.github.io/Mohasib-Friend/index%20profile.html",*/
    notificationIconSelector: "#notificationicon",
    popupMessage: "Please complete your profile in order to use the platform.",
    loginScreenUrl:
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login?client_id=1v5jdad42jojr28bcv13sgds5r&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html",
    userPoolId: "us-east-1_ASnAeUUfL",
    clientId: "1v5jdad42jojr28bcv13sgds5r",
  },
};

/**
 * دالة لإظهار السبينر
 */
function showSpinner() {
  $("#spinner").show();
}

/**
 * دالة لإخفاء السبينر
 */
function hideSpinner() {
  $("#spinner").hide();
}


document.addEventListener("DOMContentLoaded", () => {
  // Retrieve raw values from sessionStorage
  const rawYear  = sessionStorage.getItem("yearDays");
  const rawMonth = sessionStorage.getItem("monthDays");

  // Parse to integers or leave as null
  let yearDays  = rawYear  !== null ? parseInt(rawYear, 10)  : null;
  let monthDays = rawMonth !== null ? parseInt(rawMonth, 10) : null;

  // Treat non-numeric values as 0
  if (yearDays  !== null && isNaN(yearDays))  yearDays  = 0;
  if (monthDays !== null && isNaN(monthDays)) monthDays = 0;

  // Calculate total days if at least one value exists
  const totalDays = (yearDays  ?? 0) + (monthDays ?? 0);
  let expiryDate;

  if (yearDays === null && monthDays === null) {
    expiryDate = "Not available";
  } else {
    // Get current time in Cairo timezone
    const nowCairo = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" })
    );
    // Add totalDays in milliseconds
    const expiry = new Date(nowCairo.getTime() + totalDays * 24 * 60 * 60 * 1000);
    // Format as MM/DD/YYYY in Cairo timezone
    expiryDate = expiry.toLocaleDateString("en-US", {
      timeZone: "Africa/Cairo",
      year:  "numeric",
      month: "2-digit",
      day:   "2-digit"
    });
  }

  const data = {
    name:               sessionStorage.getItem("name")               || "غير متوقر",
    username:           sessionStorage.getItem("username")           || "غير متوقر",
    email:              sessionStorage.getItem("email")              || "غير متوقر",
    phone_number:       sessionStorage.getItem("phone_number")       || "غير متوقر",
    registrationNumber: sessionStorage.getItem("registrationNumber") || "غير متوقر",
    expiredate:         expiryDate
  };

  // Update DOM
  document.getElementById("name").textContent               = data.name;
  document.getElementById("username").textContent           = data.username;
  document.getElementById("email").textContent              = data.email;
  document.getElementById("phone_number").textContent       = data.phone_number;
  document.getElementById("registrationNumber").textContent = data.registrationNumber;
  document.getElementById("expiredate").textContent         = data.expiredate;
});



// Fetch client credentials and update table
/*async function fetchClientCredentials() {
  showSpinner();
  try {
    const registrationNumber = sessionStorage.getItem("registrationNumber"); // Replace with your dynamic value
    const apiUrl =
      "https://ai5un58stf.execute-api.us-east-1.amazonaws.com/PROD/MFCC";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registration_number: registrationNumber }),
    });

    if (response.ok) {
      const result = await response.json();
      const credentials = JSON.parse(result.body).credentials[0];

      if (credentials) {
        sessionStorage.setItem("clientid", credentials.clientid);
        sessionStorage.setItem("client_secret", credentials.client_secret);

        document.getElementById("clientid").textContent = credentials.clientid;
        document.getElementById("client_secret").textContent =
          credentials.client_secret;
      }
    } else {
      console.error("Failed to fetch credentials:", response.status);
    }
  } catch (error) {
    console.error("Error fetching credentials:", error);
  } finally {
    // إخفاء السبينر بعد انتهاء العملية سواء نجحت أم لا
    hideSpinner();
  }
}*/

// التحقق من تحميل مكتبة AmazonCognitoIdentity، إذا لم تكن محملة، قم بتحميلها
function loadCognitoSDK(callback) {
  if (typeof AmazonCognitoIdentity === "undefined") {
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/amazon-cognito-identity-js@5.2.4/dist/amazon-cognito-identity.min.js";

    script.onload = function () {
      callback();
    };
    script.onerror = function () {
      /* alert("فشل تحميل مكتبة Amazon Cognito Identity SDK.");*/
    };
    document.head.appendChild(script);
  } else {
    callback();
  }
}

// الحصول على زر حذف الحساب وإضافة مستمع الحدث له
document.addEventListener("DOMContentLoaded", function () {
  const deleteAccountButton = document.getElementById("deleteAccount");

  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", function (event) {
      event.preventDefault();
      showDeleteAccountConfirmation();
    });
  }
});

/**
 * عرض نافذة تأكيد حذف الحساب
 */
function showDeleteAccountConfirmation() {
  // إزالة النافذة المنبثقة الحالية إذا كانت موجودة
  const existingModal = document.getElementById("deleteAccountModal");
  if (existingModal) {
    existingModal.remove();
  }

  // إنشاء طبقة تغطية النافذة المنبثقة
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "deleteAccountModal";
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
  modalContent.style.borderRadius = "5px";
  modalContent.style.textAlign = "center";
  modalContent.style.maxWidth = "400px";
  modalContent.style.width = "60%";
  modalContent.style.border = "rgb(131, 155, 218) 16px solid";

  // إنشاء الرسالة
  const messagePara = document.createElement("p");
  messagePara.textContent =
    "هل أنت متأكد أنك تريد حذف حسابك؟ سيتم حذف جميع بياناتك بشكل دائم.";

  // إنشاء الأزرار
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "تأكيد حذف الحساب";
  confirmButton.style.marginTop = "15px";
  confirmButton.style.padding = "10px 20px";
  confirmButton.style.fontFamily = " Arial, Helvetica, sans-serif";
  confirmButton.style.border = "none";
  confirmButton.style.backgroundColor = "#7692d7"; // لون الخطر
  confirmButton.style.color = "#fff";
  confirmButton.style.borderRadius = "5px";
  confirmButton.style.cursor = "pointer";
  confirmButton.style.transition = "0.3s";
  confirmButton.style.fontSize = "14px";
  confirmButton.style.fontWeight = "bold";

  confirmButton.addEventListener("mouseover", function () {
    confirmButton.style.backgroundColor = "#8b0e0e"; // تغيير لون الخلفية عند التمرير
    confirmButton.style.color = "white"; // تغيير لون النص عند التمرير
    confirmButton.style.transform = "scale(1.05)"; // تأثير تكبير خفيف
    confirmButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 5)"; // إضافة ظل
  });

  confirmButton.addEventListener("mouseout", function () {
    confirmButton.style.backgroundColor = "#7692d7"; // اللون الأصلي
    confirmButton.style.color = "#fff"; // اللون الأصلي للنص
    confirmButton.style.transform = "scale(1)"; // إعادة الحجم الأصلي
    confirmButton.style.boxShadow = "none"; // إزالة الظل
  });

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "إلغاء";
  cancelButton.style.marginTop = "15px";
  cancelButton.style.padding = "10px 20px";
  cancelButton.style.border = "none";
  cancelButton.style.backgroundColor = "#6c757d"; // لون ثانوي
  cancelButton.style.color = "#fff";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.marginRight = "10px";

  // إضافة العناصر إلى محتوى النافذة المنبثقة
  modalContent.appendChild(messagePara);
  modalContent.appendChild(confirmButton);
  modalContent.appendChild(cancelButton);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // إضافة مستمعات الأحداث للأزرار
  confirmButton.addEventListener("click", function () {
    // الانتقال إلى نافذة إدخال كلمة المرور
    modalOverlay.remove();
    showPasswordConfirmationModal();
  });

  cancelButton.addEventListener("click", function () {
    // إغلاق النافذة المنبثقة
    modalOverlay.remove();
  });

  // إغلاق النافذة المنبثقة عند النقر خارج المحتوى
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

/**
 * عرض نافذة إدخال كلمة المرور لتأكيد حذف الحساب
 */
function showPasswordConfirmationModal() {
  // إزالة النافذة المنبثقة الحالية إذا كانت موجودة
  const existingModal = document.getElementById("passwordConfirmationModal");
  if (existingModal) {
    existingModal.remove();
  }

  // إنشاء طبقة تغطية النافذة المنبثقة
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "passwordConfirmationModal";
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
  modalContent.style.borderRadius = "10px";
  modalContent.style.textAlign = "center";
  modalContent.style.maxWidth = "400px";
  modalContent.style.width = "60%";
  modalContent.style.border = "rgb(131, 155, 218) 16px solid";
  modalContent.style.position = "relative"; // for positioning error message

  // إنشاء الرسالة
  const messagePara = document.createElement("p");
  messagePara.textContent =
    "يرجى إدخال كلمة المرور الخاصة بك لتأكيد حذف الحساب.";

  // إنشاء حاوية إدخال كلمة المرور والايكون
  const passwordContainer = document.createElement("div");
  passwordContainer.style.position = "relative";
  passwordContainer.style.marginTop = "10px";

  // إنشاء حقل إدخال كلمة المرور
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.id = "passwordInput";
  passwordInput.placeholder = "كلمة المرور";
  passwordInput.style.width = "75%";
  passwordInput.style.padding = "20px"; // space for icon
  passwordInput.style.marginRight = "-18px";
  passwordInput.style.border = "3px solid #000";
  passwordInput.style.borderRadius = "4px";
  passwordInput.style.fontWeight = "bold";
  passwordInput.style.color = "#000";

  // إنشاء الايكون (عين)
  const togglePassword = document.createElement("span");
  togglePassword.innerHTML = "&#128065;"; // Unicode for eye
  togglePassword.id = "togglePassword";
  togglePassword.style.position = "absolute";
  togglePassword.style.right = "5.5%";
  togglePassword.style.top = "46%";
  togglePassword.style.transform = "translateY(-50%)";
  togglePassword.style.cursor = "pointer";
  togglePassword.style.userSelect = "none";

  // إضافة الايكون إلى حاوية الإدخال
  passwordContainer.appendChild(passwordInput);
  passwordContainer.appendChild(togglePassword);

  // إنشاء عنصر لعرض رسالة الخطأ
  const errorMessage = document.createElement("span");
  errorMessage.id = "passwordError";
  errorMessage.style.color = "#dc3545"; // red color
  errorMessage.style.fontSize = "14px";
  errorMessage.style.display = "none"; // hidden by default
  errorMessage.style.marginTop = "5px";
  errorMessage.textContent = "كلمة المرور غير صحيحة، يرجى إعادة المحاولة.";

  // إنشاء الأزرار
  const confirmButton = document.createElement("button");
  confirmButton.textContent = " حذف الحساب";
  confirmButton.style.marginTop = "15px";
  confirmButton.style.padding = "10px 20px";
  confirmButton.style.border = "none";
  confirmButton.style.backgroundColor = "#dc3545"; // لون الخطر
  confirmButton.style.color = "#fff";
  confirmButton.style.borderRadius = "5px";
  confirmButton.style.cursor = "pointer";
  confirmButton.style.transition = "0.3s";
  confirmButton.style.fontSize = "14px";
  confirmButton.style.fontWeight = "bold";

  confirmButton.addEventListener("mouseover", function () {
    confirmButton.style.backgroundColor = "#8b0e0e"; // تغيير لون الخلفية عند التمرير
    confirmButton.style.color = "white"; // تغيير لون النص عند التمرير
    confirmButton.style.transform = "scale(1.05)"; // تأثير تكبير خفيف
    confirmButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 5)"; // إضافة ظل
  });

  confirmButton.addEventListener("mouseout", function () {
    confirmButton.style.backgroundColor = "#dc3545"; // اللون الأصلي
    confirmButton.style.color = "#fff"; // اللون الأصلي للنص
    confirmButton.style.transform = "scale(1)"; // إعادة الحجم الأصلي
    confirmButton.style.boxShadow = "none"; // إزالة الظل
  });

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "إلغاء";
  cancelButton.style.marginTop = "15px";
  cancelButton.style.padding = "10px 20px";
  cancelButton.style.border = "none";
  cancelButton.style.backgroundColor = "#6c757d"; // لون ثانوي
  cancelButton.style.color = "#fff";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.marginRight = "10px";

  // إضافة العناصر إلى محتوى النافذة المنبثقة
  modalContent.appendChild(messagePara);
  modalContent.appendChild(passwordContainer);
  modalContent.appendChild(errorMessage);
  modalContent.appendChild(confirmButton);
  modalContent.appendChild(cancelButton);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // إضافة مستمع للايكون لتبديل رؤية كلمة المرور
  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.innerHTML = "&#128065;"; // Unicode for eye 👁
    } else {
      passwordInput.type = "password";
      togglePassword.innerHTML = "&#128065;"; // Unicode for eye 👁
    }
  });

  // إضافة مستمعات الأحداث للأزرار
  confirmButton.addEventListener("click", function () {
    const password = passwordInput.value.trim();
    if (password) {
      // إخفاء رسالة الخطأ السابقة إذا كانت موجودة
      errorMessage.style.display = "none";
      loadCognitoSDK(function () {
        validatePasswordAndDeleteAccount(password, errorMessage, modalOverlay);
      });
    } else {
      // إظهار رسالة الخطأ إذا كانت كلمة المرور فارغة
      errorMessage.textContent = "يرجى إدخال كلمة المرور.";
      errorMessage.style.display = "block";
    }
  });

  cancelButton.addEventListener("click", function () {
    // إغلاق النافذة المنبثقة
    modalOverlay.remove();
  });

  // إغلاق النافذة المنبثقة عند النقر خارج المحتوى
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

/**
 * التحقق من كلمة المرور وحذف الحساب
 * @param {string} password - كلمة المرور المدخلة
 * @param {HTMLElement} errorMessage - عنصر عرض رسالة الخطأ
 * @param {HTMLElement} modalOverlay - العنصر الذي يحتوي النافذة المنبثقة
 */
function validatePasswordAndDeleteAccount(
  password,
  errorMessage,
  modalOverlay
) {
  showSpinner();

  const username = sessionStorage.getItem("username");
  const userId = sessionStorage.getItem("userId");


  if (!username || !userId) {
    alert("لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.");
    window.location.href = CONFIG.app.loginScreenUrl;
    return;
  }

  // إعداد بيانات الـ User Pool
  const poolData = {
    UserPoolId: CONFIG.app.userPoolId, // استبدلها بـ User Pool ID الخاص بك
    ClientId: CONFIG.app.clientId, // استبدلها بـ Client ID الخاص بك
  };

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    {
      Username: username,
      Password: password,
    }
  );

  // عملية المصادقة
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {

      // حذف المستخدم
      cognitoUser.deleteUser(function (err, result) {
        hideSpinner();
        if (err) {
          console.error("حدث خطأ أثناء حذف المستخدم:", err);
          // عرض رسالة خطأ حمراء داخل النافذة المنبثقة
          errorMessage.textContent = err.message || "حدث خطأ أثناء حذف الحساب.";
          errorMessage.style.display = "block";
          return;
        }
        // عرض النافذة الناجحة
        showSuccessModal();
      });
    },
    onFailure: function (err) {
      hideSpinner();
      console.error("فشل المصادقة:", err);
      if (err.code === "NotAuthorizedException") {
        // إظهار رسالة الخطأ تحت إدخال كلمة المرور
        errorMessage.textContent =
          "كلمة المرور غير صحيحة، يرجى إعادة المحاولة.";
        errorMessage.style.display = "block";
      } else {
        // عرض رسالة خطأ عامة داخل النافذة المنبثقة
        errorMessage.textContent =
          err.message || "حدث خطأ أثناء عملية المصادقة.";
        errorMessage.style.display = "block";
      }
    },
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
  modalContent.style.borderRadius = "5px";
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
  messagePara.textContent = "تم حذف حسابك بنجاح.";

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
    sessionStorage.clear();
    // الانتقال إلى صفحة تسجيل الدخول
    window.location.replace(CONFIG.app.loginScreenUrl); // استخدام replace بدلاً من href
  });

  // إضافة مستمع للزر OK
  modalOverlay.addEventListener("click", function () {
    // مسح sessionStorage
    sessionStorage.clear();
    // الانتقال إلى صفحة تسجيل الدخول
    window.location.replace(CONFIG.app.loginScreenUrl); // استخدام replace بدلاً من href
  });
}

function onLoginSuccess(username) {
  sessionStorage.setItem("username", username);

  // أي إجراءات أخرى بعد تسجيل الدخول الناجح
}

function signOutAndClearSession() {
  // مسح جميع البيانات من sessionStorage
  sessionStorage.clear();

  // إعادة التوجيه إلى صفحة تسجيل الدخول بعد تسجيل الخروج
  window.location.href =
    "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login?client_id=1v5jdad42jojr28bcv13sgds5r&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html"; // تعديل الرابط إلى صفحة تسجيل الدخول الخاصة بك
}

// ربط الدالة بزر تسجيل الخروج
document
  .getElementById("okButton")
  .addEventListener("click", signOutAndClearSession);

// استمع إلى حدث الضغط على زر "Logout"
document.getElementById("okButton").addEventListener("click", function () {
  // تخزين قيمة في sessionStorage للإشارة إلى تسجيل الخروج
  sessionStorage.setItem("logoutInitiated", "true");
});

// منع الرجوع إلى الصفحات المحمية بعد تسجيل الخروج
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    // التحقق مما إذا كان المستخدم قد ضغط على زر "Logout" قبل ذلك
    if (sessionStorage.getItem("logoutInitiated") === "true") {
      // إذا كان sessionStorage فارغًا (المستخدم مسجل الخروج)، إعادة التوجيه إلى صفحة تسجيل الدخول
      sessionStorage.removeItem("logoutInitiated"); // إزالة القيمة بعد الاستخدام
      window.location.href =
        "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login?client_id=1v5jdad42jojr28bcv13sgds5r&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html";
    }
  }
});

/**
 * عرض نافذة تحرير البيانات
 * @param {string} field - حقل البيانات المراد تحريره (name، username، email، phone_number)
 */
function showEditModal(field) {
  // إزالة أي نافذة منبثقة حالية
  const existingModal = document.getElementById("editModal");
  if (existingModal) {
    existingModal.remove();
  }

  // إنشاء طبقة تغطية النافذة المنبثقة
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "editModal";
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
  modalContent.style.borderRadius = "10px";
  modalContent.style.textAlign = "center";
  modalContent.style.maxWidth = "350px";
  modalContent.style.width = "60%";
  modalContent.style.border = "rgb(131, 155, 218) 16px solid";

  // إنشاء الرسالة
  const messagePara = document.createElement("p");
  messagePara.textContent = `تعديل ${getFieldLabel(field)}`;
  messagePara.style.marginBottom = "15px";
  modalContent.appendChild(messagePara);

  // تعريف inputElement و errorMessage
  let inputElement;
  let errorMessage;

  if (field === "phone_number") {
    // إنشاء حاوية لإدخال رقم الهاتف مع +20 كجزء ثابت
    const phoneContainer = document.createElement("div");
    phoneContainer.style.display = "flex";
    phoneContainer.style.justifyContent = "center";
    phoneContainer.style.alignItems = "center";
    phoneContainer.style.width = "100%";
    phoneContainer.style.marginBottom = "5px";

    // إنشاء حقل الإدخال للأرقام بعد +20
    const phoneInput = document.createElement("input");
    phoneInput.type = "text";
    phoneInput.placeholder = "1061234567";
    phoneInput.style.flex = "1";
    phoneInput.style.padding = "10px";
    phoneInput.style.width = "90%";
    phoneInput.style.border = "3px solid #000";
    phoneInput.style.borderRadius = "0 4px 4px 0";
    phoneInput.style.fontWeight = "bold";
    phoneInput.style.color = "#000";
    phoneInput.maxLength = 10; // لضمان إدخال 10 أرقام بعد +20
    phoneInput.pattern = "\\d{10}"; // التأكد من أن المدخلات أرقام فقط

    // إنشاء العنصر الثابت +20
    const prefix = document.createElement("span");
    prefix.textContent = "20+";
    prefix.style.padding = "2px";
    prefix.style.borderRadius = "4px 0 0 4px";
    prefix.style.fontWeight = "bold";
    prefix.style.color = "#000";
    prefix.style.width = "60px";
    prefix.style.textAlign = "center";
    prefix.style.boxSizing = "border-box";

    // إضافة عناصر الحاوية

    phoneContainer.appendChild(phoneInput);
    phoneContainer.appendChild(prefix);
    modalContent.appendChild(phoneContainer);

    inputElement = phoneInput; // تعيين inputElement ليكون phoneInput

    // إنشاء عنصر لعرض رسالة الخطأ تحت حقل إدخال رقم الهاتف
    errorMessage = document.createElement("span");
    errorMessage.id = "phoneNumberError";
    errorMessage.classList.add("error-message");
    errorMessage.textContent =
      "يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام بعد +20.";
    errorMessage.style.color = "red";
    errorMessage.style.fontSize = "12px";
    errorMessage.style.display = "none"; // إخفاء رسالة الخطأ افتراضيًا
    modalContent.appendChild(errorMessage);
  } else {
    // إنشاء حقل الإدخال العادي
    inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.placeholder = `${getFieldLabel(field)} الجديد`;
    inputElement.style.width = "90%";
    inputElement.style.padding = "10px";
    inputElement.style.border = "3px solid #000";
    inputElement.style.borderRadius = "4px";
    inputElement.style.fontWeight = "bold";
    inputElement.style.color = "#000";
    inputElement.style.marginBottom = "5px";
    modalContent.appendChild(inputElement);

    // إنشاء عنصر لعرض رسالة الخطأ (إذا لزم الأمر)
    errorMessage = document.createElement("span");
    errorMessage.id = "editFieldError";
    errorMessage.classList.add("error-message");
    errorMessage.textContent = `يرجى إدخال ${getFieldLabel(field)} صالح.`;
    errorMessage.style.color = "red";
    errorMessage.style.fontSize = "12px";
    errorMessage.style.display = "none"; // إخفاء رسالة الخطأ افتراضيًا
    modalContent.appendChild(errorMessage);
  }

  // إنشاء زر الحفظ
  const saveButton = document.createElement("button");
  saveButton.textContent = "حفظ";
  saveButton.style.marginTop = "15px";
  saveButton.style.padding = "10px 20px";
  saveButton.style.border = "none";
  saveButton.style.backgroundColor = "#7692d7"; // لون النجاح
  saveButton.style.color = "#fff";
  saveButton.style.borderRadius = "5px";
  saveButton.style.cursor = "pointer";
  saveButton.style.transition = "0.3s";
  saveButton.style.fontSize = "14px";
  saveButton.style.fontWeight = "bold";

  saveButton.addEventListener("mouseover", function () {
    saveButton.style.backgroundColor = "#242d43";
    saveButton.style.transform = "scale(1.05)";
  });

  saveButton.addEventListener("mouseout", function () {
    saveButton.style.backgroundColor = "#7692d7";
    saveButton.style.transform = "scale(1)";
  });

  // إنشاء زر الإلغاء
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "إلغاء";
  cancelButton.style.marginTop = "15px";
  cancelButton.style.padding = "10px 20px";
  cancelButton.style.border = "none";
  cancelButton.style.backgroundColor = "#6c757d"; // لون ثانوي
  cancelButton.style.color = "#fff";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.marginRight = "10px"; // تغيير من marginRight إلى marginLeft لضمان الترتيب الصحيح

  // إضافة الأزرار إلى المحتوى
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.marginTop = "10px";
  buttonsContainer.appendChild(saveButton);
  buttonsContainer.appendChild(cancelButton);
  modalContent.appendChild(buttonsContainer);

  // إضافة المحتوى إلى الطبقة
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // مستمعات الأزرار
  saveButton.addEventListener("click", function () {
    let newValue = inputElement.value.trim();
    let isValid = true;

    if (field === "phone_number") {
      // تحقق من أن المستخدم أدخل 10 أرقام بعد +20
      if (!/^\d{10}$/.test(newValue)) {
        // عرض رسالة الخطأ تحت حقل إدخال رقم الهاتف
        errorMessage.style.display = "block";
        isValid = false;
      } else {
        // إخفاء رسالة الخطأ إذا كانت تظهر
        errorMessage.style.display = "none";
        newValue = "+20" + newValue; // إضافة +20
      }
    } else {
      // تحقق من أن الحقل غير فارغ
      if (!newValue) {
        // عرض رسالة الخطأ تحت حقل الإدخال
        errorMessage.textContent = `يرجى إدخال ${getFieldLabel(field)} صالح.`;
        errorMessage.style.display = "block";
        isValid = false;
      } else {
        // إخفاء رسالة الخطأ إذا كانت تظهر
        errorMessage.style.display = "none";
      }
    }

    if (isValid) {
      // إخفاء النافذة الحالية وطلب كلمة المرور
      modalOverlay.remove();
      showPasswordForEdit(field, newValue);
    }
  });

  cancelButton.addEventListener("click", function () {
    modalOverlay.remove();
  });

  // إضافة مستمع لحدث keydown على حقل الإدخال
  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      saveButton.click();
    }
  });

  // إضافة مستمع لحدث keydown لمفتاح Esc لإغلاق النافذة
  function handleEscape(event) {
    if (event.key === "Escape") {
      modalOverlay.remove();
      document.removeEventListener("keydown", handleEscape);
    }
  }
  document.addEventListener("keydown", handleEscape);

  // إغلاق النافذة عند النقر خارج المحتوى
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

/**
 * عرض نافذة إدخال كلمة المرور لتأكيد التعديل
 * @param {string} field - حقل البيانات المراد تعديله
 * @param {string} newValue - القيمة الجديدة المراد تعيينها
 */
function showPasswordForEdit(field, newValue) {
  // إزالة أي نافذة منبثقة حالية
  const existingModal = document.getElementById("passwordEditModal");
  if (existingModal) {
    existingModal.remove();
  }

  // إنشاء طبقة تغطية النافذة المنبثقة
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "passwordEditModal";
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
  modalContent.style.borderRadius = "10px";
  modalContent.style.textAlign = "center";
  modalContent.style.maxWidth = "400px";
  modalContent.style.width = "60%";
  modalContent.style.border = "rgb(131, 155, 218) 16px solid";

  // إنشاء الرسالة
  const messagePara = document.createElement("p");
  messagePara.textContent = "يرجى إدخال كلمة المرور لتأكيد التعديل.";
  messagePara.style.marginBottom = "15px";
  modalContent.appendChild(messagePara);

  // إنشاء حاوية إدخال كلمة المرور والايكون
  const passwordContainer = document.createElement("div");
  passwordContainer.style.position = "relative";
  passwordContainer.style.marginBottom = "5px";

  // إنشاء حقل إدخال كلمة المرور
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "كلمة المرور";
  passwordInput.style.width = "76%";
  passwordInput.style.padding = "20px"; // space for icon
  passwordInput.style.marginRight = "-3px";
  passwordInput.style.border = "3px solid #000";
  passwordInput.style.borderRadius = "4px";
  passwordInput.style.fontWeight = "bold";
  passwordInput.style.color = "#000";
  // إنشاء الايكون (عين)
  const togglePassword = document.createElement("span");
  togglePassword.innerHTML = "&#128065;"; // Unicode for eye
  togglePassword.id = "togglePassword";
  togglePassword.style.position = "absolute";
  togglePassword.style.right = "28px";
  togglePassword.style.top = "46%";
  togglePassword.style.transform = "translateY(-50%)";
  togglePassword.style.cursor = "pointer";
  togglePassword.style.userSelect = "none";

  // إضافة الايكون إلى حاوية الإدخال
  passwordContainer.appendChild(passwordInput);
  passwordContainer.appendChild(togglePassword);
  modalContent.appendChild(passwordContainer);

  // إنشاء عنصر لعرض رسالة الخطأ
  const errorMessage = document.createElement("span");
  errorMessage.id = "passwordEditError";
  errorMessage.classList.add("error-message");
  errorMessage.textContent = "كلمة المرور غير صحيحة، يرجى إعادة المحاولة.";
  errorMessage.style.color = "red";
  errorMessage.style.fontSize = "12px";
  errorMessage.style.display = "none"; // إخفاء رسالة الخطأ افتراضيًا
  modalContent.appendChild(errorMessage);

  // إنشاء الأزرار
  const verifyButton = document.createElement("button");
  verifyButton.textContent = "تأكيد";
  verifyButton.style.marginTop = "15px";
  verifyButton.style.padding = "10px 20px";
  verifyButton.style.border = "none";
  verifyButton.style.backgroundColor = "#7692d7"; // لون النجاح
  verifyButton.style.color = "#fff";
  verifyButton.style.borderRadius = "5px";
  verifyButton.style.cursor = "pointer";
  verifyButton.style.transition = "0.3s";
  verifyButton.style.fontSize = "14px";
  verifyButton.style.fontWeight = "bold";

  verifyButton.addEventListener("mouseover", function () {
    verifyButton.style.backgroundColor = "#242d43"; // تغيير لون الخلفية عند التمرير
    verifyButton.style.color = "white"; // تغيير لون النص عند التمرير
    verifyButton.style.transform = "scale(1.05)";
    verifyButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.5)";
  });

  verifyButton.addEventListener("mouseout", function () {
    verifyButton.style.backgroundColor = "#7692d7"; // اللون الأصلي
    verifyButton.style.color = "#fff"; // اللون الأصلي للنص
    verifyButton.style.transform = "scale(1)";
    verifyButton.style.boxShadow = "none";
  });

  // إنشاء زر الإلغاء
  const cancelButton = document.createElement("button");
  cancelButton.textContent = "إلغاء";
  cancelButton.style.marginTop = "15px";
  cancelButton.style.padding = "10px 20px";
  cancelButton.style.border = "none";
  cancelButton.style.backgroundColor = "#6c757d"; // لون ثانوي
  cancelButton.style.color = "#fff";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.cursor = "pointer";
  cancelButton.style.marginRight = "10px";

  // إضافة الأزرار إلى المحتوى
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.marginTop = "10px";
  buttonsContainer.appendChild(verifyButton);
  buttonsContainer.appendChild(cancelButton);
  modalContent.appendChild(buttonsContainer);

  // إضافة المحتوى إلى الطبقة
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // إضافة مستمع للايكون لتبديل رؤية كلمة المرور
  togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.innerHTML = "&#128065;"; // Unicode for eye 👁
    } else {
      passwordInput.type = "password";
      togglePassword.innerHTML = "&#128065;"; // Unicode for eye 👁
    }
  });

  // إضافة مستمعات الأحداث للأزرار
  verifyButton.addEventListener("click", function () {
    const password = passwordInput.value.trim();
    if (password) {
      // إخفاء رسالة الخطأ السابقة إذا كانت موجودة
      errorMessage.style.display = "none";
      loadCognitoSDK(function () {
        validatePasswordAndUpdateAccount(
          field,
          newValue,
          password,
          modalOverlay
        );
      });
    } else {
      // إظهار رسالة الخطأ إذا كانت كلمة المرور فارغة
      errorMessage.textContent = "يرجى إدخال كلمة المرور.";
      errorMessage.style.display = "block";
    }
  });

  cancelButton.addEventListener("click", function () {
    // إغلاق النافذة المنبثقة
    modalOverlay.remove();
  });

  // إضافة مستمع لحدث keydown لمفتاح Esc لإغلاق النافذة
  function handleEscape(event) {
    if (event.key === "Escape") {
      modalOverlay.remove();
      document.removeEventListener("keydown", handleEscape);
    }
  }
  document.addEventListener("keydown", handleEscape);

  // إضافة مستمع لحدث keydown على زر OK لتفعيل الزر عند الضغط على Enter
  modalContent.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      okButton.click();
    }
  });
  // إضافة مستمع لحدث keydown على زر OK لتفعيل الزر عند الضغط على Enter
  modalContent.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      verifyButton.click();
    }
  });

  // إغلاق النافذة عند النقر خارج المحتوى
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

/**
 * تحديث خاصية معينة للمستخدم في Cognito
 * @param {CognitoUser} cognitoUser - كائن المستخدم من Cognito
 * @param {string} attribute - اسم الخاصية المراد تحديثها
 * @param {string} value - القيمة الجديدة
 * @param {HTMLElement} modalOverlay - العنصر الذي يحتوي النافذة المنبثقة
 */
function updateUserAttribute(cognitoUser, attribute, value, modalOverlay) {
  let valueToSend = value;

  // في هذه الحالة، تم تضمين +20 بالفعل في القيمة المرسلة من showEditModal
  // لذلك لا حاجة لإضافة +20 هنا مرة أخرى

  const attributeData = {
    Name: attribute,
    Value: valueToSend,
  };

  const attributeObj = new AmazonCognitoIdentity.CognitoUserAttribute(
    attributeData
  );

  cognitoUser.updateAttributes([attributeObj], function (err, result) {
    hideSpinner();
    if (err) {
      console.error("حدث خطأ أثناء تحديث الخاصية:", err);
      // عرض رسالة خطأ حمراء داخل النافذة المنبثقة
      const errorSpan = modalOverlay.querySelector("#passwordEditError");
      if (errorSpan) {
        errorSpan.textContent = err.message || "حدث خطأ أثناء تحديث البيانات.";
        errorSpan.style.display = "block";
      }
      return;
    }

    // تحديث sessionStorage والواجهة
    // في حالة رقم الهاتف، نحتاج إلى تخزين القيمة بدون +20
    if (attribute === "phone_number") {
      const displayedValue = valueToSend.startsWith("+20")
        ? valueToSend.slice(3)
        : valueToSend;
      sessionStorage.setItem(attribute, displayedValue);
      const displayElement = document.getElementById(attribute);
      if (displayElement) {
        displayElement.textContent = displayedValue;
      }
    } else {
      sessionStorage.setItem(attribute, value);
      const displayElement = document.getElementById(attribute);
      if (displayElement) {
        displayElement.textContent = value;
      }
    }

    // عرض رسالة النجاح
    showUpdateSuccessModal(attribute);
  });
}

/**
 * التحقق من كلمة المرور وتحديث البيانات
 * @param {string} field - حقل البيانات المراد تعديله
 * @param {string} newValue - القيمة الجديدة
 * @param {string} password - كلمة المرور المدخلة
 * @param {HTMLElement} modalOverlay - العنصر الذي يحتوي النافذة المنبثقة
 */
function validatePasswordAndUpdateAccount(
  field,
  newValue,
  password,
  modalOverlay
) {
  showSpinner();

  const username = sessionStorage.getItem("username");
  const userId = sessionStorage.getItem("userId");


  if (!username || !userId) {
    alert("لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.");
    window.location.href = CONFIG.app.loginScreenUrl;
    return;
  }

  // إعداد بيانات الـ User Pool
  const poolData = {
    UserPoolId: CONFIG.app.userPoolId, // استبدلها بـ User Pool ID الخاص بك
    ClientId: CONFIG.app.clientId, // استبدلها بـ Client ID الخاص بك
  };

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    {
      Username: username,
      Password: password,
    }
  );

  // عملية المصادقة
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {

      // تحديث البيانات بناءً على الحقل
      switch (field) {
        case "name":
          // افترض أن هناك API لتحديث الاسم
          updateUserAttribute(cognitoUser, "name", newValue, modalOverlay);
          break;
        case "username":
          // تحديث اسم المستخدم قد يتطلب إجراءات خاصة في Cognito
          alert("تحديث اسم المستخدم غير مدعوم مباشرةً.");
          hideSpinner();
          break;
        case "email":
          // تحديث البريد الإلكتروني
          updateUserAttribute(cognitoUser, "email", newValue, modalOverlay);
          break;
        case "phone_number":
          // تحديث البريد الإلكتروني
          updateUserAttribute(
            cognitoUser,
            "phone_number",
            newValue,
            modalOverlay
          );
          break;
        default:
          console.error("حقل غير معروف:", field);
          hideSpinner();
      }
    },
    onFailure: function (err) {
      hideSpinner();
      console.error("فشل المصادقة:", err);
      if (err.code === "NotAuthorizedException") {
        // إظهار رسالة الخطأ تحت إدخال كلمة المرور
        const errorSpan = modalOverlay.querySelector("#passwordEditError");
        if (errorSpan) {
          errorSpan.textContent = "كلمة المرور غير صحيحة، يرجى إعادة المحاولة.";
          errorSpan.style.display = "block";
        }
      } else {
        // عرض رسالة خطأ عامة داخل النافذة المنبثقة
        const errorSpan = modalOverlay.querySelector("#passwordEditError");
        if (errorSpan) {
          errorSpan.textContent =
            err.message || "حدث خطأ أثناء عملية المصادقة.";
          errorSpan.style.display = "block";
        }
      }
    },
  });
}

/**
 * تحديث خاصية معينة للمستخدم في Cognito
 * @param {CognitoUser} cognitoUser - كائن المستخدم من Cognito
 * @param {string} attribute - اسم الخاصية المراد تحديثها
 * @param {string} value - القيمة الجديدة
 * @param {HTMLElement} modalOverlay - العنصر الذي يحتوي النافذة المنبثقة
 */
function updateUserAttribute(cognitoUser, attribute, value, modalOverlay) {
  let valueToSend = value;

  // في هذه الحالة، تم تضمين +20 بالفعل في القيمة المرسلة من showEditModal
  // لذلك لا حاجة لإضافة +20 هنا مرة أخرى

  const attributeData = {
    Name: attribute,
    Value: valueToSend,
  };

  const attributeObj = new AmazonCognitoIdentity.CognitoUserAttribute(
    attributeData
  );

  cognitoUser.updateAttributes([attributeObj], function (err, result) {
    hideSpinner();
    if (err) {
      console.error("حدث خطأ أثناء تحديث الخاصية:", err);
      // عرض رسالة خطأ حمراء داخل النافذة المنبثقة
      const errorSpan = modalOverlay.querySelector("#passwordEditError");
      if (errorSpan) {
        errorSpan.textContent = err.message || "حدث خطأ أثناء تحديث البيانات.";
        errorSpan.style.display = "block";
      }
      return;
    }

    // تحديث sessionStorage والواجهة
    // في حالة رقم الهاتف، نحتاج إلى تخزين القيمة بدون +20
    if (attribute === "phone_number") {
      const displayedValue = valueToSend.startsWith("+20")
        ? valueToSend.slice(3)
        : valueToSend;
      sessionStorage.setItem(attribute, displayedValue);
      const displayElement = document.getElementById(attribute);
      if (displayElement) {
        displayElement.textContent = displayedValue;
      }
    } else {
      sessionStorage.setItem(attribute, value);
      const displayElement = document.getElementById(attribute);
      if (displayElement) {
        displayElement.textContent = value;
      }
    }

    // عرض رسالة النجاح
    showUpdateSuccessModal(attribute);
  });
}

/**
 * عرض نافذة النجاح بعد تحديث البيانات
 * @param {string} field - حقل البيانات الذي تم تحديثه
 */
function showUpdateSuccessModal(field) {
  // إزالة أي نافذة منبثقة حالية
  const existingModal = document.getElementById("updateSuccessModal");
  if (existingModal) {
    existingModal.remove();
  }

  // إنشاء طبقة تغطية النافذة المنبثقة
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "updateSuccessModal";
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
  modalContent.style.borderRadius = "5px";
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
  messagePara.textContent = `تم تحديث ${getFieldLabel(field)} بنجاح.`;

  // إنشاء زر OK
  const okButton = document.createElement("button");
  okButton.textContent = "موافق";
  okButton.style.marginTop = "20px";
  okButton.style.padding = "10px 20px";
  okButton.style.border = "none";
  okButton.style.backgroundColor = "#5581ed"; // primary color
  okButton.style.color = "#fff";
  okButton.style.borderRadius = "5px";
  okButton.style.cursor = "pointer";
  okButton.style.fontSize = "14px";
  okButton.style.fontWeight = "bold";

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

  // مستمع للزر OK
  okButton.addEventListener("click", function () {
    modalOverlay.remove();
    // تحديث الصفحة
    location.reload();
  });
}

/**
 * الحصول على تسمية الحقل بناءً على اسمه
 * @param {string} field - اسم الحقل
 * @returns {string} - التسمية المقابلة
 */
function getFieldLabel(field) {
  switch (field) {
    case "name":
      return "الاسم الكامل";
    case "username":
      return "اسم المستخدم";
    case "email":
      return "البريد الإلكتروني";
    case "phone_number":
      return "رقم التلفون";
    default:
      return field;
  }
}
