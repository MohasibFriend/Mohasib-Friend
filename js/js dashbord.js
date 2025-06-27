// Define CONFIG globally
const CONFIG = {
  app: {
    // Update these URLs with your actual API endpoints
    getRegistrationNumberApi: "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_reg_num",
    getNotificationsApi: "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_notification",
    generatePaymentLinkApi: "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_genrate_pament_link",
    checkSubscriptionStatusApi: "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_subscription_states",
    // New API endpoint for creating subscription data (may be redundant based on Lambda)
    notificationIconSelector: "#notificationicon",
    popupMessage: "يرجى إكمال ملفك الشخصي لاستخدام المنصة.",
    userPoolId: "us-east-1_ASnAeUUfL",
    clientId: "1v5jdad42jojr28bcv13sgds5r",
  },
};

//sessionStorage.setItem("userId","84c89448-10c1-70b2-afec-779114a2db39")
let subscriptionDays = null;

/*sessionStorage.setItem("userId","55555")*/
// home-script.js
document.addEventListener('DOMContentLoaded', () => {
  // الحصول على عناصر السويتش
  const themeSwitch = document.getElementById('theme-switch');

  if (themeSwitch) {
      // تحميل الثيم المحفوظ من localStorage
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeSwitch.checked = savedTheme === 'light';

      // تحديث الثيم عند تغيير السويتش
      themeSwitch.addEventListener('change', () => {
          const theme = themeSwitch.checked ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('theme', theme);
      });
  }
});;

const userId = sessionStorage.getItem("userId");
// Load jQuery and execute logic when DOM is ready
if (typeof jQuery === "undefined") {
  const script = document.createElement("script");
  script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
  script.onload = function () {
    initializeApp();
    showSpinner();
    updateSubscriptionUI();
    handleCognitoCallback();
  };
  document.head.appendChild(script);
} else {
  $(document).ready(function () {
    initializeApp();
  });
}



function initializeApp() {
  (function () {
    // Flag to prevent multiple initializations
    let isDashboardInitialized = false;
    
    /**
     * Function to show the spinner
     */
    function showSpinner() {
      $("#spinner").show();
    }

    /**
     * Function to hide the spinner
     */
    function hideSpinner() {
      $("#spinner").hide();
    }

    /**
     * Fetches the registration number using the user ID
     * @param {string} userId - The user ID
     * @returns {Promise<string|null>} - The registration number or null if not found
     */
    async function fetchRegistrationNumber(userId) {
      // Show spinner before starting the fetch
      showSpinner();
      try {

        const response = await $.ajax({
          url: CONFIG.app.getRegistrationNumberApi,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ userId }),
        });

        // Access the 'body' field first and then extract 'registrationNumber'
        let registrationNumber;

        if (response && response.body) {
          if (typeof response.body === "string") {
            // If 'body' is a JSON string, parse it
            const parsedBody = JSON.parse(response.body);
            registrationNumber = parsedBody.registrationNumber;
          } else if (typeof response.body === "object") {
            // If 'body' is already an object
            registrationNumber = response.body.registrationNumber;
          }
        }

        // As a fallback, try extracting 'registrationNumber' directly
        if (!registrationNumber && response.registrationNumber) {
          registrationNumber = response.registrationNumber;
        }

        if (registrationNumber) {
          registrationNumber = registrationNumber.replace(/\.[^/.]+$/, "");

          // Store 'registrationNumber' in sessionStorage
          sessionStorage.setItem("registrationNumber", registrationNumber);
          

          return registrationNumber;
        } else {
          console.warn("Registration number not found in API response:", response);
          return null;
        }
      } catch (error) {
        console.error("Error fetching registration number:", error);
        return null;
      } finally {
        // Hide spinner after the operation ends
        hideSpinner();
      }
    }

    /**
     * Fetches the subscription status from the API and stores it in sessionStorage
     * يمكن استدعاء هذه الدالة مع المعامل forceActive = true لفرض اشتراك ACTIVE في حال نجاح الدفع
     * @param {boolean} forceActive - إذا true يتم تحديث الاشتراك بالقيمة ACTIVE فوراً
     * @returns {Promise<string|null>} - The subscription status or null if not found
     */
      async function fetchSubscriptionStatus(forceActive = false, days = null) {
        showSpinner();
        try {
          const userId       = sessionStorage.getItem("userId");
          const accessToken  = sessionStorage.getItem("accessToken");
          const username     = sessionStorage.getItem("username");
          const name         = sessionStorage.getItem("name");
          const email        = sessionStorage.getItem("email");
          const phone_number = sessionStorage.getItem("phone_number");

          if (!userId) {
            console.error("User ID not found in sessionStorage.");
            navigateTo(CONFIG.app.loginScreenUrl);
            return null;
          }

          const userInfo = { username, name, email, phone_number };

          const payload = { userId, userInfo };
          if (forceActive) payload.forceActive = true;
          if (days)        payload.subscriptionDays = days;

          const response = await $.ajax({
            url:   CONFIG.app.checkSubscriptionStatusApi,
            method:"POST",
            headers:{
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            data: JSON.stringify(payload)
          });

          // --- فك الاستجابة
          const body = typeof response.body === "string"
                        ? JSON.parse(response.body)
                        : response;

          const { status, monthDays = 0, yearDays = 0 } = body || {};

          if (status) {
            sessionStorage.setItem("subscriptionStatus", status);
            sessionStorage.setItem("monthDays" , monthDays.toString());
            sessionStorage.setItem("yearDays"  , yearDays.toString());
            return status;
          }

          console.warn("Subscription status not found:", response);
          return null;

        } catch (err) {
          console.error("Error fetching subscription status:", err);
          return null;
        } finally {
          hideSpinner();
        }
      }

    /**
     * New function to fetch client credentials and store them in sessionStorage only
     */
    /*async function fetchClientCredentials() {
      showSpinner();
      try {
        // Retrieve registrationNumber from sessionStorage
        const registrationNumber = sessionStorage.getItem("registrationNumber");
        if (!registrationNumber) {
          console.warn("Registration number not found in session storage. Skipping fetch.");
          return;
        }

        const apiUrl = "https://ai5un58stf.execute-api.us-east-1.amazonaws.com/PROD/MFCC";

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ registration_number: registrationNumber }),
        });

        if (response.ok) {
          const result = await response.json();
          const parsedBody = JSON.parse(result.body);
          const credentials = parsedBody.credentials && parsedBody.credentials[0];

          if (credentials) {
            sessionStorage.setItem("clientid", credentials.clientid);
            sessionStorage.setItem("client_secret", credentials.client_secret);
          } else {
            console.warn("No credentials found in the API response.");
          }
        } else {
          console.error("Failed to fetch credentials. Status Code:", response.status);
        }
      } catch (error) {
        console.error("Error fetching client credentials:", error);
      } finally {
        hideSpinner();
      }
    }*/

    /**
     * Initializes the dashboard by fetching the registration number, subscription status, and storing them in sessionStorage
     */
    async function initializeDashboard() {
      if (isDashboardInitialized) {
        return;
      }

      isDashboardInitialized = true;

      try {
        const userId = sessionStorage.getItem("userId");

        // Fetch registration number and subscription status concurrently
        const [registrationNumber, subscriptionStatus] = await Promise.all([
          fetchRegistrationNumber(userId),
          fetchSubscriptionStatus()
        ]);

        if (!registrationNumber) {
          console.warn("Registration number is missing. Redirecting to profile page.");
          await showPopup(CONFIG.app.popupMessage);
          return;
        }

        if (!subscriptionStatus) {
          console.warn("Subscription status is missing.");
          // Optional: Add additional logic if needed
        }

        // Call the new function to fetch client credentials and store them in sessionStorage
        //await fetchClientCredentials();

        // Fetch notifications using the registration number
        const notifications = await fetchNotifications(userId);
        updateNotificationIcon(notifications);

        // Update subscription UI based on status
        updateSubscriptionUI();
        
        // Display the user's name in the dashboard
        displayname();
      } catch (error) {
        console.error("Error during dashboard initialization:", error);
      }
    }

    $(document).ready(async function () {
      // استدعاء الدالة handleCognitoCallback وانتظار اكتمالها
      await handleCognitoCallback();
      
      // بعد انتهاء handleCognitoCallback، التحقق من وجود userId في sessionStorage
      if (sessionStorage.getItem("userId")) {
        initializeDashboard();
      } else {
        console.error("User ID is missing from sessionStorage. Redirecting to Sign-in page.");
        window.location.href = "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login?client_id=1v5jdad42jojr28bcv13sgds5r&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html";  
       
       } 
      displayname();
      updateSubscriptionUI();
      // Add event listener for the Subscribe button
      const subscribeButton = document.getElementById("subscribeButton");
      if (subscribeButton) {
        subscribeButton.addEventListener("click", handleSubscribeClick);
      }
    });

    /**
     * Handles the Cognito authentication callback.
     */
    async function handleCognitoCallback() {
      const queryParams = getQueryParams();
      const authCode = queryParams.code;

      if (authCode) {
        try {
          const clientId = CONFIG.app.clientId;
          const redirectUri = "https://mohasibfriend.com/home.html";

          // Fetch access token using the authorization code
          const tokenResponse = await fetch(
            "https://us-east-1ASnAeUUfL.auth.us-east-1.amazoncognito.com/oauth2/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `grant_type=authorization_code&client_id=${clientId}&code=${authCode}&redirect_uri=${encodeURIComponent(
                redirectUri
              )}`,
            }
          );

          if (!tokenResponse.ok) {
            throw new Error("Failed to fetch access token.");
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          // Fetch user information using the access token
          const userInfoResponse = await fetch(
            "https://us-east-1ASnAeUUfL.auth.us-east-1.amazoncognito.com/oauth2/userInfo",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!userInfoResponse.ok) {
            throw new Error("Failed to fetch user information.");
          }

          const userInfo = await userInfoResponse.json();
          const userId = userInfo.sub;

          // Get the username from userInfo
          const username = userInfo.email || userInfo.username;

          // Store userId and username in sessionStorage
          if (userId) {
            sessionStorage.setItem("userId", userId);
          }

          if (userInfo.username) {
            sessionStorage.setItem("username", userInfo.username);
          }
          // Store name, email, phone_number, etc.
          if (userInfo.name) {
            sessionStorage.setItem("name", userInfo.name);
          }
          
          if (userInfo.email) {
            sessionStorage.setItem("email", userInfo.email);
          }

          if (userInfo.phone_number) {
            sessionStorage.setItem("phone_number", userInfo.phone_number);
          }

          // Store the accessToken in sessionStorage
          sessionStorage.setItem("accessToken", accessToken);

          // Initialize the dashboard
          await initializeDashboard();
        } catch (error) {
          console.error("Error handling Cognito callback:", error);
        }
      }
    }

    /**
     * Display the user's name in the dashboard
     */
    function isArabic(text) {
      const arabicPattern = /[\u0600-\u06FF]/;
      return arabicPattern.test(text);
    }

    function displayname() {
      const name = sessionStorage.getItem("name");
      const nameDisplay = document.getElementById("nameDisplay");
      if (name) {
        if (nameDisplay) {
          if (isArabic(name)) {
            nameDisplay.textContent = `أهلاً شركة ${name}`;
          } else {
            nameDisplay.textContent = `Hi company ${name}`;
          }
        } else {
          console.warn("Element with ID 'nameDisplay' not found.");
        }
      } else {
        console.warn("Name not found in sessionStorage.");
      }
    }

    // Utility function to parse query parameters from the URL
    function getQueryParams() {
      const params = {};
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
      return params;
    }

    /**
     * Utility function to show a popup message to the user
     * @param {string} message - The message to display
     * @returns {Promise} - Resolves when the user closes the popup
     */
    function showPopup(message) {
      return new Promise((resolve) => {
        // Remove existing modal if present
        if ($("#custom-modal").length) {
          $("#custom-modal").remove();
        }

        // Create a simple modal
        const modal = $("<div>", { id: "custom-modal" }).css({
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1000",
        });

        const modalContent = $("<div>").css({
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "5px",
          textAlign: "center",
          maxWidth: "400px",
          width: "80%",
        });

        const messagePara = $("<p>").text(message);

        const okButton = $("<button>").text("OK").css({
          marginTop: "15px",
          padding: "10px 20px",
          border: "none",
          backgroundColor: "#007BFF",
          color: "#fff",
          borderRadius: "5px",
          cursor: "pointer",
        });

        okButton.on("click", () => {
          modal.remove();
          resolve();
        });

        modalContent.append(messagePara, okButton);
        modal.append(modalContent);
        $("body").append(modal);
      });
    }

    /**
     * Navigates the user to a specified URL
     * @param {string} url - The URL to navigate to
     */
    function navigateTo(url) {
      window.location.href = url;
    }

    /**
     * Makes an API call using jQuery AJAX
     * @param {string} url - The API endpoint
     * @param {object} options - AJAX options (method, headers, data, etc.)
     * @returns {Promise<object>} - The JSON response
     */
    function apiCall(url, options) {
      return $.ajax({
        url: url,
        method: options.method || "POST",
        headers: options.headers || {},
        data: options.data || {},
        contentType: options.contentType || "application/json",
        dataType: "json",
      })
        .done((data) => {
          return data;
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          console.error(`API call failed: ${jqXHR.status} - ${textStatus} - ${errorThrown}`);
          throw new Error(
            `API call failed with status ${jqXHR.status}, status text: ${textStatus}, error: ${errorThrown}`
          );
        });
    }

    /**
     * Fetches notifications using the registration number
     * @param {string} registrationNumber - The registration number
     * @returns {Promise<Array>} - Array of notifications
     */
    async function fetchNotifications(userId) {
      try {
        const data = { userId };
        const response = await apiCall(CONFIG.app.getNotificationsApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify(data),
        });

        let notifications = [];
        if (response.body) {
          try {
            const parsedBody = JSON.parse(response.body);
            notifications = parsedBody.notifications || [];
          } catch (error) {
            console.error("Error parsing notifications body:", error);
          }
        } else {
          notifications = response.notifications || [];
        }

        return notifications;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
    }

    /**
     * Updates the notification icon based on the notifications
     * @param {Array} notifications - Array of notifications
     */
    function updateNotificationIcon(notifications) {
      const $notificationIcon = $(CONFIG.app.notificationIconSelector);

      if ($notificationIcon.length === 0) {
        console.warn("Notification icon element not found in NavBar.");
        return;
      }

      const unreadNotifications = notifications.filter((notification) => !notification.read);
      const unreadCount = unreadNotifications.length;

      let $badge = $notificationIcon.find(".badge");
      if (unreadCount > 0) {
        if ($badge.length === 0) {
          $badge = $("<span>", { class: "badge" }).css({
           /* position: "absolute",
            top: "0",
            right: "0",
            backgroundColor: "red",
            color: "white",
            borderRadius: "50%",
            padding: "5px",
            fontSize: "12px",*/
          });
          $notificationIcon.append($badge);
        }
        $badge.text(unreadCount).show();
      } else if ($badge.length > 0) {
        $badge.hide();
      }

      // Attach click event to show/hide notifications popup
      $notificationIcon.off("click").on("click", () => {
        toggleNotificationPopup(notifications);
      });

      // Hide the popup if user navigates away
      $(window).on("beforeunload", () => {
        $("#notification-popup").remove();
      });
    }

    function toggleNotificationPopup(notifications) {
      const notificationPopup = document.getElementById("notification-popup");
      const overlayId = "notification-overlay";

      if (notificationPopup) {
        // Hide the notification window
        notificationPopup.remove();

        // Remove overlay if present
        const existingOverlay = document.getElementById(overlayId);
        if (existingOverlay) {
          existingOverlay.remove();
        }
      } else {
        const notificationIcon = document.querySelector(CONFIG.app.notificationIconSelector);

        if (!notificationIcon) {
          console.error("Notification icon element not found using selector:", CONFIG.app.notificationIconSelector);
          return;
        }

        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = overlayId;
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.zIndex = "1000"; // Should be less than the popup zIndex
        document.body.appendChild(overlay);

        // Add event listener to close popup when overlay is clicked
        overlay.addEventListener("click", function () {
          toggleNotificationPopup([]); // Pass an empty array to close the popup and overlay
        });

        // Create notification popup
        const popup = document.createElement("div");
        popup.id = "notification-popup";
        popup.style.position = "absolute";
        popup.style.top = "110%";
        popup.style.right = "0";
        popup.style.fontFamily = "Arial, Helvetica, sans-serif";
        popup.style.backgroundColor = "#fff";
        popup.style.border = "3px solid #000";
        popup.style.borderRadius = "20px";
        popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        popup.style.width = "500px";
        popup.style.maxHeight = "300px";
        popup.style.overflowY = "auto";
        popup.style.overflowX = "hidden";
        popup.style.zIndex = "1001";
        popup.style.padding = "10px";
        popup.style.color = "#000";

        // Apply media queries
        if (window.matchMedia("(max-width: 768px)").matches) {
          popup.style.right = "-50px";
          popup.style.top = "120%";
          popup.style.width = "200px";
          popup.style.overflowX = "hidden";
          popup.style.fontSize = "18px";
          popup.style.padding = "0px";
        } else if (window.matchMedia("(min-width: 769px) and (max-width: 1200px)").matches) {
          popup.style.right = "-50px";
          popup.style.top = "120%";
          popup.style.width = "200px";
          popup.style.overflowX = "hidden";
          popup.style.fontSize = "18px";
          popup.style.padding = "0px";
        }

        if (notifications.length === 0) {
          popup.textContent = "لا توجد إشعارات جديدة.";
        } else {
          notifications.forEach(function (notification) {
            const notificationItem = document.createElement("div");
            notificationItem.style.padding = "10px";
            notificationItem.style.borderBottom = "1px solid #000";
            notificationItem.textContent = notification.message || "إشعار جديد"; // Adjust based on notification structure
            popup.appendChild(notificationItem);
          });
        }

        notificationIcon.appendChild(popup);
      }
    }

    async function handleSubscribeClick() {
        const subscribeButton = document.getElementById("subscribeButton");
        showSpinner();
        try {
            // تعطيل الزر لمنع النقرات المتعددة
            subscribeButton.disabled = true;
    
            // استرجاع تفاصيل المستخدم من sessionStorage
            const customerProfileId = sessionStorage.getItem("userId");
    
            if (!customerProfileId) {
                alert("معلومات المستخدم مفقودة. يرجى تسجيل الدخول مرة أخرى.");
                navigateTo(CONFIG.app.loginScreenUrl);
                return;
            }
    
            const payload = {
                customerProfileId, // استخدام customerProfileId بدل userId
                returnUrl: "https://mohasibfriend.com/home.html", // تأكد من تحديث هذا الرابط حسب الحاجة
            };
    
            // استدعاء API لإنشاء رابط الدفع
            const generatePaymentResponse = await fetch(CONFIG.app.generatePaymentLinkApi, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
    
            if (!generatePaymentResponse.ok) {
                const errorData = await generatePaymentResponse.json();
                throw new Error(errorData.message || "فشل في إنشاء رابط الدفع. يرجى المحاولة مرة أخرى.");
            }
    
            // Parse the main response
            const responseJson = await generatePaymentResponse.json();
    
            // Parse the `body` field, which contains the actual data as a JSON string
            const paymentData = JSON.parse(responseJson.body);
    
            // If both monthly and yearly options exist, show modal to let the user choose
            if (paymentData.monthly && paymentData.yearly) {
                const selectedPaymentLink = await showSubscriptionOptionsModal(paymentData);
                if (!selectedPaymentLink) {
                    throw new Error("لم يتم اختيار أي خيار اشتراك.");
                }
                // Redirect the user to the selected payment link
                window.location.href = selectedPaymentLink;
            }
            // Fallback to the previous behavior if only one link is provided
            else if (paymentData.paymentLink) {
                window.location.href = paymentData.paymentLink;
            } else {
                throw new Error("لم يتم استلام رابط الدفع. يرجى الاتصال بالدعم.");
            }
        } catch (error) {
            console.error("Error generating payment link:", error);
        } finally {
            hideSpinner();
            subscribeButton.disabled = false;
        }
    }
    
    function showSubscriptionOptionsModal(paymentData) {
      return new Promise((resolve) => {
        const modal = $(`
          <div id="subscriptionOptionsModal">
            <div class="subscription-modal-content">
              <h3 class="subscription-header">اختر نوع الاشتراك</h3>

              <button id="monthlyOption">اشتراك شهري</button>
              <div style="margin-bottom:10px;font-weight:bold;">500 جنيه</div>

              <button id="yearlyOption">اشتراك سنوي</button>
              <div style="margin-bottom:10px;font-weight:bold;">5000 جنيه</div>

              <br><button id="cancelOption">إلغاء</button><br>
              <h2 style="font-size:12px">يضاف %14 ضريبة قيمة مضافة</h2>
            </div>
          </div>
        `);
        $("body").append(modal);

        // تعطيل زر الاشتراك الشهري فقط إذا فيه قيمة حقيقية مخزّنة (وليست null أو "null")
        const storedMonth = sessionStorage.getItem("monthDays");
        if (storedMonth !== null && storedMonth !== "null") {
          $("#monthlyOption")
            .prop("disabled", true)
            .css({
              "background-color": "gray",
              "cursor": "not-allowed"
            });
        }

        // اشتراك شهري = 30 يوم
        $("#monthlyOption").on("click", () => {
          sessionStorage.setItem("monthDays", "30");
          modal.remove();
          resolve(paymentData.monthly.paymentLink);
        });

        // اشتراك سنوي = 360 يوم
        $("#yearlyOption").on("click", () => {
          sessionStorage.setItem("yearDays", "360");
          modal.remove();
          resolve(paymentData.yearly.paymentLink);
        });

        $("#cancelOption").on("click", () => {
          modal.remove();
          resolve(null);
        });
      });
    }

    

    
    // Load Amazon Cognito Identity SDK if not already loaded
    function loadCognitoSDK(callback) {
      if (typeof AmazonCognitoIdentity === "undefined") {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/amazon-cognito-identity-js@5.2.4/dist/amazon-cognito-identity.min.js";

        script.onload = function () {
          callback();
        };
        script.onerror = function () {
          console.error("Failed to load Amazon Cognito Identity SDK.");
        };
        document.head.appendChild(script);
      } else {
        callback();
      }
    }

    // Event Listener for Delete Account Button
    document.addEventListener("DOMContentLoaded", function () {
      const deleteAccountButton = document.getElementById("deleteAccount");

      if (deleteAccountButton) {
        deleteAccountButton.addEventListener("click", function (event) {
          event.preventDefault();
          showDeleteAccountConfirmation();
        });
      }
    });

    // Function to show delete account confirmation modal
    function showDeleteAccountConfirmation() {
      // Remove existing modal if present
      const existingModal = document.getElementById("deleteAccountModal");
      if (existingModal) {
        existingModal.remove();
      }

      // Create modal overlay
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

      // Create modal content
      const modalContent = document.createElement("div");
      modalContent.style.backgroundColor = "#fff";
      modalContent.style.padding = "20px";
      modalContent.style.borderRadius = "5px";
      modalContent.style.textAlign = "center";
      modalContent.style.maxWidth = "400px";
      modalContent.style.width = "80%";

      // Create message
      const messagePara = document.createElement("p");
      messagePara.textContent = "هل أنت متأكد أنك تريد حذف حسابك؟ سيتم حذف جميع بياناتك بشكل دائم.";

      // Create buttons
      const confirmButton = document.createElement("button");
      confirmButton.textContent = "تأكيد حذف الحساب";
      confirmButton.style.marginTop = "15px";
      confirmButton.style.padding = "10px 20px";
      confirmButton.style.border = "none";
      confirmButton.style.backgroundColor = "#dc3545"; // Danger color
      confirmButton.style.color = "#fff";
      confirmButton.style.borderRadius = "5px";
      confirmButton.style.cursor = "pointer";
      confirmButton.style.marginRight = "10px";

      const cancelButton = document.createElement("button");
      cancelButton.textContent = "إلغاء";
      cancelButton.style.marginTop = "15px";
      cancelButton.style.padding = "10px 20px";
      cancelButton.style.border = "none";
      cancelButton.style.backgroundColor = "#6c757d"; // Secondary color
      cancelButton.style.color = "#fff";
      cancelButton.style.borderRadius = "5px";
      cancelButton.style.cursor = "pointer";

      // Append elements
      modalContent.appendChild(messagePara);
      modalContent.appendChild(confirmButton);
      modalContent.appendChild(cancelButton);
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      // Event listeners for buttons
      confirmButton.addEventListener("click", function () {
        modalOverlay.remove();
        loadCognitoSDK(function () {
          showPasswordConfirmationModal();
        });
      });

      cancelButton.addEventListener("click", function () {
        modalOverlay.remove();
      });

      // Close modal when clicking outside
      modalOverlay.addEventListener("click", function (event) {
        if (event.target == modalOverlay) {
          modalOverlay.remove();
        }
      });
    }

    // Function to show password confirmation modal
    function showPasswordConfirmationModal() {
      // Remove existing modal if present
      const existingModal = document.getElementById("passwordConfirmationModal");
      if (existingModal) {
        existingModal.remove();
      }

      // Create modal overlay
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

      // Create modal content
      const modalContent = document.createElement("div");
      modalContent.style.backgroundColor = "#fff";
      modalContent.style.padding = "20px";
      modalContent.style.borderRadius = "5px";
      modalContent.style.textAlign = "center";
      modalContent.style.maxWidth = "400px";
      modalContent.style.width = "80%";

      // Create message
      const messagePara = document.createElement("p");
      messagePara.textContent = "يرجى إدخال كلمة المرور الخاصة بك لتأكيد حذف الحساب.";

      // Create password input
      const passwordInput = document.createElement("input");
      passwordInput.type = "password";
      passwordInput.placeholder = "كلمة المرور";
      passwordInput.style.width = "100%";
      passwordInput.style.padding = "10px";
      passwordInput.style.marginTop = "10px";
      passwordInput.style.border = "1px solid #ced4da";
      passwordInput.style.borderRadius = "4px";

      // Create buttons
      const confirmButton = document.createElement("button");
      confirmButton.textContent = "تأكيد حذف الحساب";
      confirmButton.style.marginTop = "15px";
      confirmButton.style.padding = "10px 20px";
      confirmButton.style.border = "none";
      confirmButton.style.backgroundColor = "#dc3545"; // Danger color
      confirmButton.style.color = "#fff";
      confirmButton.style.borderRadius = "5px";
      confirmButton.style.cursor = "pointer";
      confirmButton.style.marginRight = "10px";

      const cancelButton = document.createElement("button");
      cancelButton.textContent = "إلغاء";
      cancelButton.style.marginTop = "15px";
      cancelButton.style.padding = "10px 20px";
      cancelButton.style.border = "none";
      cancelButton.style.backgroundColor = "#6c757d"; // Secondary color
      cancelButton.style.color = "#fff";
      cancelButton.style.borderRadius = "5px";
      cancelButton.style.cursor = "pointer";

      // Append elements
      modalContent.appendChild(messagePara);
      modalContent.appendChild(passwordInput);
      modalContent.appendChild(confirmButton);
      modalContent.appendChild(cancelButton);
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      // Event listeners for buttons
      confirmButton.addEventListener("click", function () {
        const password = passwordInput.value.trim();
        if (password) {
          modalOverlay.remove();
          loadCognitoSDK(function () {
            validatePasswordAndDeleteAccount(password);
          });
        } else {
          alert("يرجى إدخال كلمة المرور.");
        }
      });

      cancelButton.addEventListener("click", function () {
        modalOverlay.remove();
      });

      // Close modal when clicking outside
      modalOverlay.addEventListener("click", function (event) {
        if (event.target == modalOverlay) {
          modalOverlay.remove();
        }
      });
    }

    // Function to validate password and delete account
    function validatePasswordAndDeleteAccount(password) {

      const username = sessionStorage.getItem("username");
      const userId = sessionStorage.getItem("userId");

      if (!username || !userId) {
        alert("لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.");
        window.location.href = CONFIG.app.loginScreenUrl;
        return;
      }

      // User Pool Data
      const poolData = {
        UserPoolId: CONFIG.app.userPoolId,
        ClientId: CONFIG.app.clientId,
      };

      const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

      const userData = {
        Username: username,
        Pool: userPool,
      };

      const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

      const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
      });

      // Authenticate user
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          // Delete user
          cognitoUser.deleteUser(function (err, result) {
            if (err) {
              console.error("Error deleting user:", err);
              alert(err.message || JSON.stringify(err));
              return;
            }
            alert("تم حذف حسابك بنجاح.");
            sessionStorage.clear();
            window.location.href = CONFIG.app.loginScreenUrl;
          });
        },
        onFailure: function (err) {
          console.error("Authentication failed:", err);
          if (err.code === "NotAuthorizedException") {
            alert("كلمة المرور التي أدخلتها غير صحيحة، يرجى المحاولة مرة أخرى.");
          } else {
            alert(err.message || JSON.stringify(err));
          }
        },
      });
    }

    // User dropdown functionality
    const userButton = document.getElementById("userButton");
    const dropdown = document.getElementById("dropdown");
    const dropdownOverlay = document.getElementById("dropdownOverlay");

    if (userButton && dropdown && dropdownOverlay) {
      userButton.addEventListener("click", () => {
        const isDropdownVisible = dropdown.style.display === "block";

        dropdown.style.display = isDropdownVisible ? "none" : "block";
        dropdownOverlay.style.display = isDropdownVisible ? "none" : "block";
      });

      document.addEventListener("click", (event) => {
        if (!userButton.contains(event.target) && !dropdown.contains(event.target)) {
          dropdown.style.display = "none";
          dropdownOverlay.style.display = "none";
        }
      });

      dropdownOverlay.addEventListener("click", () => {
        dropdown.style.display = "none";
        dropdownOverlay.style.display = "none";
      });
    }

    /**
     * Updates the subscription button UI based on the subscription status
     */
    function updateSubscriptionUI() {
      const subscriptionStatus = sessionStorage.getItem("subscriptionStatus");
      const subscribeButton = document.getElementById("subscribeButton");

      if (!subscribeButton) {
        console.warn("Subscribe button not found.");
        return;
      }

      if (subscriptionStatus === "ACTIVE") {
        subscribeButton.textContent = "اشتراكك نشط وصالح";
        subscribeButton.disabled = true;
      } else if (subscriptionStatus === "FREE_TRIAL") {
        subscribeButton.textContent = "أنت حالياً في فترة التجربة المجانية اشترك الان";
        subscribeButton.disabled = true;
      } else if (subscriptionStatus === "EXPIRED") {
        subscribeButton.textContent = "تجديد الاشتراك";
        subscribeButton.disabled = false;
      } else {
        subscribeButton.textContent = "الاشتراك";
        subscribeButton.disabled = false;
      }
    }
  })();
}

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const toggleButton = document.getElementById("toggleButton");
  const overlay = document.getElementById("overlay");
  const nameDisplay = document.getElementById("nameDisplay"); // عنصر الكلمة الترحيبية

  if (sidebar && toggleButton && overlay && nameDisplay) {
    toggleButton.addEventListener("click", () => {
      if (sidebar.style.left === "0px") {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    overlay.addEventListener("click", () => {
      closeSidebar();
    });

    document.body.addEventListener("click", (event) => {
      if (
        !sidebar.contains(event.target) &&
        !toggleButton.contains(event.target) &&
        sidebar.style.left === "0px"
      ) {
        closeSidebar();
      }
    });

    function openSidebar() {
      sidebar.style.left = "0px";
      sidebar.style.visibility = "visible";
      sidebar.style.opacity = "1";
      sidebar.style.height = "100%";
      sidebar.style.zIndex = "10"; // رفع ترتيب السايد بار
      nameDisplay.style.zIndex = "1"; // تخفيض ترتيب nameDisplay تحت السايد بار
      nameDisplay.style.display='none'; // إخفاء الاسم مؤقتًا
      toggleButton.style.transform = "rotate(360deg)";
      toggleButton.style.display = "none";
      overlay.style.display = "block";
      overlay.style.position = "absolute";
      overlay.style.top = "102px";
      overlay.style.left = "253px";
      overlay.style.width = "35%";
      overlay.style.height = "169%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0)";
      overlay.style.zIndex = "9";
    }

    function closeSidebar() {
      sidebar.style.left = "-250px";
      sidebar.style.visibility = "hidden";
      sidebar.style.opacity = "0";
      sidebar.style.zIndex = "1"; // إعادة ترتيب السايد بار للوضع الطبيعي
      nameDisplay.style.zIndex = "10"; // إعادة ترتيب nameDisplay ليكون فوق كل شيء
      nameDisplay.style.display="inline"; // إظهار الاسم من جديد
      toggleButton.style.transform = "rotate(0deg)";
      toggleButton.style.display = "block";
      overlay.style.display = "none";
    }
  } else {
    console.error(
      "One or more elements are missing: sidebar, toggleButton, overlay, or nameDisplay."
    );
  }
});


// Getting Elements for Logout functionality
const logoutButton = document.getElementById("logoutButton");
const logoutModal = document.getElementById("logoutModal");
const confirmLogout = document.getElementById("confirmLogout");
const cancelLogout = document.getElementById("cancelLogout");

// عند النقر على زر تسجيل الخروج، عرض الكونتينر
if (logoutButton && logoutModal && confirmLogout && cancelLogout) {
  logoutButton.addEventListener("click", function (event) {
    event.preventDefault(); // منع السلوك الافتراضي للرابط
    logoutModal.style.display = "block";
  });

  // عند النقر على زر "تسجيل خروج" في الكونتينر
  confirmLogout.addEventListener("click", function () {
    window.location.href =
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login?client_id=1v5jdad42jojr28bcv13sgds5r&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html"; 
  });

  // عند النقر على زر "إلغاء"، إخفاء الكونتينر
  cancelLogout.addEventListener("click", function () {
    logoutModal.style.display = "none";
  });

  // إخفاء الكونتينر عند النقر خارج محتواه
  window.addEventListener("click", function (event) {
    if (event.target == logoutModal) {
      logoutModal.style.display = "none";
    }
  });

  function signOutAndClearSession() {
    // مسح جميع البيانات من sessionStorage
    sessionStorage.clear();

    // إعادة التوجيه إلى صفحة تسجيل الدخول بعد تسجيل الخروج
    window.location.href =
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login?client_id=1v5jdad42jojr28bcv13sgds5r&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html";
  }

  // ربط الدالة بزر تسجيل الخروج
  confirmLogout.addEventListener("click", signOutAndClearSession);

  // استمع إلى حدث الضغط على زر "Logout"
  confirmLogout.addEventListener("click", function () {
    // تخزين قيمة في sessionStorage للإشارة إلى تسجيل الخروج
    sessionStorage.setItem("logoutInitiated", "true");
  });

  // منع الرجوع إلى الصفحات المحمية بعد تسجيل الخروج
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      if (sessionStorage.getItem("logoutInitiated") === "true") {
        sessionStorage.removeItem("logoutInitiated");
        window.location.href =
          "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login?client_id=1v5jdad42jojr28bcv13sgds5r&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html";
      }
    }
  });
}

function showInfo() {
  document.getElementById("infoModal").style.display = "block";
  const nameDisplay = document.getElementById("nameDisplay");
  if (nameDisplay) {
    nameDisplay.style.zIndex = "1";
    nameDisplay.style.display = 'none';
  }
}

function closeModal() {
  document.getElementById("infoModal").style.display = "none";
  const nameDisplay = document.getElementById("nameDisplay");
  if (nameDisplay) {
    nameDisplay.style.zIndex = "10";
    nameDisplay.style.display = 'inline';
  }
}

// Close the modal when clicking outside the content
window.onclick = function (event) {
  const infoModal = document.getElementById("infoModal");
  if (infoModal && event.target == infoModal) {
    closeModal();
  }
};

// إضافة مستمع حدث للضغط على مفتاح Esc
window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' || event.key === 'Esc') {
      closeModal();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  /**
   * دالة لاستخراج قيمة `statusDescription` من URL
   * إذا لم توجد، تعيد القيمة null
   */
  function getStatusDescription() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('statusDescription');
  }

  /**
   * دالة لعرض الكونتينر بناءً على حالة الدفع
   * @param {boolean} isSuccess - حالة الدفع: true إذا نجح، false إذا فشل
   */
  function showPaymentStatus(isSuccess) {
    const container = document.getElementById("paymentStatusContainer");
    const icon = document.getElementById("paymentStatusIcon");
    const message = document.getElementById("paymentStatusMessage");

    if (isSuccess) {
      icon.classList.add("success");
      icon.innerHTML = "✔️";

      // استرجاع المدة المختارة
      const days = parseInt(sessionStorage.getItem("subscriptionDays") || "0", 10) || null;

      fetchSubscriptionStatus(true, days)
        .then(() => {
          message.innerHTML = ".تم الدفع بنجاح!<br>أنت الآن تستمتع بمحاسب فريند";
          updateSubscriptionUI();
          sessionStorage.removeItem("subscriptionDays"); // تنظيف
        })
        .catch((err) => {
          console.error("Error forcing subscription to ACTIVE:", err);
          message.innerHTML = "تم الدفع، ولكن حدث خطأ في تحديث حالة الاشتراك.";
        });
    } else {
      icon.classList.add("error");
      icon.innerHTML = "❌";
      message.textContent = "فشلت عملية الدفع";
    }

    container.style.display = "flex";
  }
  /**
   * دالة لإغلاق الكونتينر
   */
  function closePaymentStatus() {
      const container = document.getElementById("paymentStatusContainer");
      container.style.display = "none";
      
      // إزالة المعلمات من URL لتجنب إعادة العرض عند إعادة تحميل الصفحة
      const url = new URL(window.location);
      url.searchParams.delete('type');
      url.searchParams.delete('referenceNumber');
      url.searchParams.delete('merchantRefNumber');
      url.searchParams.delete('orderAmount');
      url.searchParams.delete('paymentAmount');
      url.searchParams.delete('fawryFees');
      url.searchParams.delete('orderStatus');
      url.searchParams.delete('paymentMethod');
      url.searchParams.delete('paymentTime');
      url.searchParams.delete('cardLastFourDigits');
      url.searchParams.delete('customerName');
      url.searchParams.delete('customerProfileId');
      url.searchParams.delete('authNumber');
      url.searchParams.delete('signature');
      url.searchParams.delete('taxes');
      url.searchParams.delete('statusCode');
      url.searchParams.delete('statusDescription');
      url.searchParams.delete('basketPayment');
      window.history.replaceState({}, document.title, url.toString());
  }

  // استخراج وصف الحالة من URL
  const statusDescription = getStatusDescription();

  // التحقق مما إذا كانت الصفحة تحتوي على معلمة statusDescription
  if (statusDescription !== null) {
      // تحديد إذا ما كانت العملية ناجحة أم لا بناءً على محتوى statusDescription
      // يمكن تعديل هذه الشروط بناءً على النص الذي تأتي به بوابة الدفع
      const isSuccess = statusDescription.toLowerCase().includes("successfully");

      // عرض الكونتينر بناءً على الحالة
      showPaymentStatus(isSuccess);
  }

    // إضافة مستمع للنقر على زر الإغلاق
    const closeButton = document.getElementById("closePaymentStatus");
    if (closeButton) {
    closeButton.addEventListener("click", function () {
      closePaymentStatus();
      window.location.reload();
    });
}

});

document.addEventListener('DOMContentLoaded', () => {
  // إذا لم يكن هناك registrationNumber في sessionStorage فلا تنفذ هذا الفانكشن
  const registrationNumber = sessionStorage.getItem('registrationNumber');
  if (!registrationNumber) return;

  const userId = sessionStorage.getItem('userId');
  if (!userId) return;

  // دالة لجلب الحالة من الـ API وإظهار الأوفرفلاي عند الحاجة
  async function fetchRegistrationStatus() {
    try {
      const res = await fetch(
        'https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_file_statse',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      const payload = typeof result.body === 'string'
        ? JSON.parse(result.body)
        : result;

      const status = payload.statuse === true || payload.statuse === 'true';
      sessionStorage.setItem('registrationStatus', status.toString());

      // إذا كانت الحالة false، نعرض الأوفرفلاي
      if (!status && !document.getElementById('processing-overlay')) {
        const navBar = document.getElementById('NavBar');
        navBar.style.position = 'relative';

        const style = document.createElement('style');
        style.textContent = `
          #processing-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 100;
          }
          #processing-overlay .clock {
            width: 30px;
            height: 30px;
            border: 3px solid #fff;
            border-radius: 50%;
            position: relative;
            margin: 0 auto;
          }
          #processing-overlay .clock::before,
          #processing-overlay .clock::after {
            content: '';
            position: absolute;
            background: #fff;
            left: 50%;
            top: 50%;
            transform-origin: bottom center;
          }
          #processing-overlay .clock::before {
            width: 2px;
            height: 8px;
            transform: translateX(-50%) translateY(-100%) rotate(0deg);
            animation: hour-hand 12s linear infinite;
          }
          #processing-overlay .clock::after {
            width: 2px;
            height: 12px;
            transform: translateX(-50%) translateY(-100%) rotate(0deg);
            animation: minute-hand 3s linear infinite;
          }
          @keyframes hour-hand {
            from { transform: translateX(-50%) translateY(-100%) rotate(0deg); }
            to { transform: translateX(-50%) translateY(-100%) rotate(360deg); }
          }
          @keyframes minute-hand {
            from { transform: translateX(-50%) translateY(-100%) rotate(0deg); }
            to { transform: translateX(-50%) translateY(-100%) rotate(360deg); }
          }
          #processing-overlay .processing-text {
            margin-top: 8px;
            font-size: 15px;
            color: #fff;
            font-weight: bold;
          }
          @media only screen and (max-width: 875px) {
            #processing-overlay {
              display: none;
            }
          }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'processing-overlay';
        overlay.innerHTML = `
          <div class="clock"></div>
          <div class="processing-text">يرجى انتظار ليكتمل معالجة الملفات</div>
        `;
        navBar.appendChild(overlay);
      }
    } catch (err) {
      console.error('Error fetching registration status:', err);
    }
  }

  // نفّذ الفetch أول مرة مباشرةً
  fetchRegistrationStatus();
  // ثم كرّر الفetch كل 5 ثواني
  setInterval(fetchRegistrationStatus, 1000);
});

document.addEventListener('DOMContentLoaded', () => {
  if (typeof handleCognitoCallback === 'function') {
    handleCognitoCallback();
    initializeApp();
  }
});
