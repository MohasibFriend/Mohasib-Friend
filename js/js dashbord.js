// Load jQuery and execute logic when DOM is ready
if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {
        console.log("jQuery loaded successfully.");
        initializeApp();
    };
    document.head.appendChild(script);
} else {
    $(document).ready(function () {
        initializeApp();
    });
}

function initializeApp() {
    (function () {
        // Configuration: Update these with your actual API endpoints and paths
        const CONFIG = {
            app: {
                getRegistrationNumberApi: 'https://f8nvx3oaqa.execute-api.us-east-1.amazonaws.com/prod/mfur',
                getNotificationsApi: 'https://1rw7rjdqbc.execute-api.us-east-1.amazonaws.com/prod/mfn',
                userProfileScreenUrl: 'https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/profile',
                notificationIconSelector: '#notificationicon',
                popupMessage: 'Please complete your profile in order to use the platform.',
                loginScreenUrl: 'https://mohasibfriend.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6oefeov5mb34okbe1fgf5l6lbd&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard',
            },
        };

        // Flag to prevent multiple initializations
        let isDashboardInitialized = false;

        /**
         * Fetches the registration number using the user ID
         * @param {string} userId - The user ID
         * @returns {Promise<string>} - The registration number
         */
        async function fetchRegistrationNumber(userId) {
            try {
                console.log('Fetching registration number for userId:', userId);

                const response = await $.ajax({
                    url: CONFIG.app.getRegistrationNumberApi,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ userId }),
                });

                console.log('API Response:', response);

                // الوصول إلى حقل body أولاً ثم استخراج registrationNumber
                let registrationNumber;

                if (response && response.body) {
                    if (typeof response.body === 'string') {
                        // إذا كان body عبارة عن سلسلة JSON، قم بتحويلها إلى كائن
                        const parsedBody = JSON.parse(response.body);
                        registrationNumber = parsedBody.registrationNumber;
                    } else if (typeof response.body === 'object') {
                        // إذا كان body بالفعل كائن
                        registrationNumber = response.body.registrationNumber;
                    }
                }

                // كخيار احتياطي، حاول استخراج registrationNumber مباشرةً
                if (!registrationNumber && response.registrationNumber) {
                    registrationNumber = response.registrationNumber;
                }

                if (registrationNumber) {
                    registrationNumber = registrationNumber.replace(/\.[^/.]+$/, "");
                    console.log('Fetched registration number:', registrationNumber);

                    // تخزين registrationNumber في sessionStorage
                    sessionStorage.setItem('registrationNumber', registrationNumber);
                    console.log('Registration number stored in sessionStorage:', registrationNumber);

                    return registrationNumber;
                } else {
                    console.warn('No registration number found in API response:', response);
                    return null;
                }
            } catch (error) {
                console.error('Error fetching registration number:', error);
                return null;
            }
        }


        /**
         * Initializes the dashboard by fetching the registration number and storing it in sessionStorage
         */
        async function initializeDashboard() {
            if (isDashboardInitialized) {
                console.log('Dashboard is already initialized.');
                return;
            }

            isDashboardInitialized = true;
            console.log('Initializing dashboard...');

            try {
                const userId = sessionStorage.getItem('userId');

                if (!userId) {
                    console.error('User ID not found in sessionStorage. Redirecting to login...');
                    redirectToLogin();
                    return;
                }

                console.log('Retrieved userId from sessionStorage:', userId);

                // Attempt to fetch the registration number directly from the database
                let registrationNumber = await fetchRegistrationNumber(userId);

                if (!registrationNumber) {
                    console.warn('Registration number is missing. Redirecting to profile page.');
                    await showPopup(CONFIG.app.popupMessage);
                    navigateTo(CONFIG.app.userProfileScreenUrl);
                    return;
                }

                console.log('Using registration number:', registrationNumber);

                // Fetch notifications using the registration number
                const notifications = await fetchNotifications(registrationNumber);
                updateNotificationIcon(notifications);
            } catch (error) {
                console.error('Error during dashboard initialization:', error);
                await showPopup('An error occurred while initializing the dashboard. Please try again later.');
                redirectToLogin();
            }
        }


        $(document).ready(function () {
            console.log('DOM fully loaded. Executing initialization.');

            // Initialize the dashboard if userId is present
            if (sessionStorage.getItem('userId')) {
                initializeDashboard();
            } else {
                console.error('User ID is missing from sessionStorage. Handling Cognito callback.');
                handleCognitoCallback();  // If userId is missing, handle Cognito callback
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
                    const clientId = '6oefeov5mb34okbe1fgf5l6lbd';
                    const redirectUri = 'https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard';

                    // Fetch access token using the authorization code
                    const tokenResponse = await fetch('https://mohasibfriend.auth.us-east-1.amazoncognito.com/oauth2/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `grant_type=authorization_code&client_id=${clientId}&code=${authCode}&redirect_uri=${encodeURIComponent(redirectUri)}`,
                    });

                    if (!tokenResponse.ok) {
                        throw new Error('Failed to fetch access token.');
                    }

                    const tokenData = await tokenResponse.json();
                    const accessToken = tokenData.access_token;

                    // Fetch user information using the access token
                    const userInfoResponse = await fetch('https://mohasibfriend.auth.us-east-1.amazoncognito.com/oauth2/userInfo', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (!userInfoResponse.ok) {
                        throw new Error('Failed to fetch user information.');
                    }

                    const userInfo = await userInfoResponse.json();
                    const userId = userInfo.sub;

                    // Store userId in sessionStorage
                    if (userId) {
                        sessionStorage.setItem('userId', userId);
                        console.log('userId stored in sessionStorage:', userId);
                        // Initialize the dashboard
                        await initializeDashboard();
                    }
                } catch (error) {
                    console.error('Error handling Cognito callback:', error);
                    await showPopup('An error occurred while logging in. Please try again.');
                    redirectToLogin();
                }
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
         * Initializes the dashboard by performing all necessary actions
         */
        async function initializeDashboard() {
            if (isDashboardInitialized) {
                console.log('Dashboard is already initialized.');
                return;
            }

            isDashboardInitialized = true;
            console.log('Initializing dashboard...');
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    console.error('userId not found in sessionStorage. Redirecting to login...');
                    navigateTo(CONFIG.app.loginScreenUrl);
                    return;
                }
                console.log('Retrieved userId from sessionStorage:', userId);

                let registrationNumber = sessionStorage.getItem('registrationNumber');
                console.log('Retrieved registrationNumber from sessionStorage:', registrationNumber);

                if (!registrationNumber) {
                    registrationNumber = await fetchRegistrationNumber(userId);
                    if (!registrationNumber) {
                        await showPopup(CONFIG.app.popupMessage);
                        navigateTo(CONFIG.app.userProfileScreenUrl);
                        return;
                    }
                }

                // Call functions to fetch notifications or other data using the registration number
                const notifications = await fetchNotifications(registrationNumber);
                updateNotificationIcon(notifications);
            } catch (error) {
                console.error('Error during dashboard initialization:', error);
                await showPopup('An error occurred while initializing the dashboard. Please try again later.');
                navigateTo(CONFIG.app.loginScreenUrl);
            }
        }


        /**
         * Utility function to show a popup message to the user
         * @param {string} message - The message to display
         * @returns {Promise} - Resolves when the user closes the popup
         */
        function showPopup(message) {
            return new Promise((resolve) => {
                // Remove existing modal if present
                if ($('#custom-modal').length) {
                    $('#custom-modal').remove();
                }

                // Create a simple modal
                const modal = $('<div>', { id: 'custom-modal' }).css({
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '1000',
                });

                const modalContent = $('<div>').css({
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '5px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '80%',
                });

                const messagePara = $('<p>').text(message);

                const okButton = $('<button>').text('OK').css({
                    marginTop: '15px',
                    padding: '10px 20px',
                    border: 'none',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    borderRadius: '5px',
                    cursor: 'pointer',
                });

                okButton.on('click', () => {
                    modal.remove();
                    resolve();
                });

                modalContent.append(messagePara, okButton);
                modal.append(modalContent);
                $('body').append(modal);
            });
        }

        /**
         * Navigates the user to a specified URL
         * @param {string} url - The URL to navigate to
         */
        function navigateTo(url) {
            console.log(`Navigating to: ${url}`);
            window.location.href = url;
        }

        /**
         * Makes an API call using jQuery AJAX
         * @param {string} url - The API endpoint
         * @param {object} options - AJAX options (method, headers, data, etc.)
         * @returns {Promise<object>} - The JSON response
         */
        function apiCall(url, options) {
            console.log(`Making API call to: ${url} with options:`, options);
            return $.ajax({
                url: url,
                method: options.method || 'GET',
                headers: options.headers || {},
                data: options.data || {},
                contentType: options.contentType || 'application/json',
                dataType: 'json',
            })
            .done((data) => {
                console.log('API call successful. Response data:', data);
                return data;
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.error(`API call failed: ${jqXHR.status} - ${textStatus} - ${errorThrown}`);
                throw new Error(`API call failed with status ${jqXHR.status}, status text: ${textStatus}, error: ${errorThrown}`);
            });
        }

        /**
         * Fetches notifications using the registration number
         * @param {string} registrationNumber - The registration number
         * @returns {Promise<Array>} - Array of notifications
         */
        async function fetchNotifications(registrationNumber) {
            try {
                const data = { registrationNumber };
                const response = await apiCall(CONFIG.app.getNotificationsApi, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(data),
                });

                let notifications = [];
                if (response.body) {
                    try {
                        const parsedBody = JSON.parse(response.body);
                        notifications = parsedBody.notifications || [];
                    } catch (error) {
                        console.error('Error parsing notifications body:', error);
                    }
                } else {
                    notifications = response.notifications || [];
                }

                console.log('Fetched notifications:', notifications);
                return notifications;
            } catch (error) {
                console.error('Error fetching notifications:', error);
                throw error;
            }
        }

        /**
         * Updates the notification icon based on the notifications
         * @param {Array} notifications - Array of notifications
         */
        function updateNotificationIcon(notifications) {
            console.log('Updating notification icon with notifications:', notifications);
            const $notificationIcon = $(CONFIG.app.notificationIconSelector);

            if ($notificationIcon.length === 0) {
                console.warn('Notification icon element not found in NavBar.');
                return;
            }

            const unreadNotifications = notifications.filter(notification => !notification.read);
            const unreadCount = unreadNotifications.length;
            console.log(`Unread notifications count: ${unreadCount}`);

            let $badge = $notificationIcon.find('.badge');
            if (unreadCount > 0) {
                if ($badge.length === 0) {
                    $badge = $('<span>', { class: 'badge' }).css({
                        position: 'absolute',
                        top: '-10px', // Adjust to position it above and overlapping the bell icon
                        right: '-10px', // Adjust to keep it at the upper-right corner of the bell icon
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        zIndex: '10',
                    });
                    $notificationIcon.append($badge);
                }
                $badge.text(unreadCount).show();
            } else if ($badge.length > 0) {
                $badge.hide();
            }
         
            // Apply media queries for mobile and tablet views
            const mediaQuery = window.matchMedia("(max-width: 1024px)");
            if (mediaQuery.matches) {
                // This will apply when the viewport width is 768px or less
               console.log("Applying mobile/tablet styles for notification icon.");

             if ($badge.length > 0) {
             $badge.css({
                top: '5px',
                right: '5px',
                fontSize: '12px', // Reduce badge font size for smaller screens
                padding: '1px 4px',
               });
             }

            }

            // Apply media queries for screens with max-width 1366px
            const mediaQuery1366 = window.matchMedia("(max-width: 1366px)");
            if (mediaQuery1366.matches) {
                // Apply styles for screens with width 1366px or smaller
                console.log("Applying styles for screen width 1366px or less.");

                if ($badge.length > 0) {
                    $badge.css({
                        top: '-10px',
                        right: '-10px',
                        fontSize: '12px', // Adjust badge size for 1366px screen
                        padding: '2px 6px',
                        fontWeight: 'bold',
                        borderRadius: '50%',

                    });
                }
            }
                      
            // Attach click event to show/hide notifications popup
            $notificationIcon.off('click').on('click', () => {
                toggleNotificationPopup(notifications);
            });

            // Hide the popup if user navigates away
            $(window).on('beforeunload', () => {
                $('#notification-popup').remove();
                console.log('Notification popup removed on page unload.');
            });
        }

        function toggleNotificationPopup(notifications) {
            const notificationPopup = document.getElementById('notification-popup');

            if (notificationPopup) {
                notificationPopup.remove();
                console.log('تم إخفاء نافذة الإشعارات.');
            } else {
                console.log('عرض نافذة الإشعارات:', notifications);
                const notificationIcon = document.querySelector(CONFIG.app.notificationIconSelector);

                const popup = document.createElement('div');
                popup.id = 'notification-popup';
                popup.style.position = 'absolute';
                popup.style.top = '110%';
                popup.style.right = '0';
                popup.style.backgroundColor = '#fff';
                popup.style.border = '3px solid #000';
                popup.style.borderRadius = '20px';
                popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                popup.style.width = '500px';
                popup.style.maxHeight = '300px';
                popup.style.overflowY = 'auto';
                popup.style.zIndex = '1001';
                popup.style.padding = '10px';

                // تطبيق الـ Media Queries
                if (window.matchMedia("(max-width: 768px)").matches) {
                    popup.style.width = '250px';
                    popup.style.right = '-50px';
                    popup.style.top = '120%';
                } else if (window.matchMedia("(min-width: 769px) and (max-width: 1200px)").matches) {
                    popup.style.width = '400px';
                }

                if (notifications.length === 0) {
                    popup.textContent = "لا توجد إشعارات جديدة.";
                } else {
                    notifications.forEach(function(notification) {
                        const notificationItem = document.createElement('div');
                        notificationItem.style.padding = '10px';
                        notificationItem.style.borderBottom = '1px solid #eaeaea';
                        notificationItem.style.width = '500px';
                        notificationItem.textContent = notification;
                        popup.appendChild(notificationItem);
                    });
                }

                notificationIcon.appendChild(popup);
                console.log('تم عرض نافذة الإشعارات.');
            }
        }
    })();
}


document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleButton');
    const overlay = document.getElementById('overlay');

    if (sidebar && toggleButton && overlay) {
        toggleButton.addEventListener('click', () => {
            if (sidebar.style.left === '0px') {
                closeSidebar();
            } else {
                openSidebar();
            }
        });

        overlay.addEventListener('click', () => {
            closeSidebar();
        });

        document.body.addEventListener('click', (event) => {
            if (!sidebar.contains(event.target) && !toggleButton.contains(event.target) && sidebar.style.left === '0px') {
                closeSidebar();
            }
        });

        function openSidebar() {
            sidebar.style.left = '0px';
            sidebar.style.visibility = 'visible';
            sidebar.style.opacity = '1';
            sidebar.style.height ='100%';
            toggleButton.style.transform = 'rotate(360deg)';
            toggleButton.style.display = 'none';
            overlay.style.display = 'block';
            overlay.style.position = 'absolute';
            overlay.style.top = '102px';
            overlay.style.left = '253px';
            overlay.style.width = '35%';
            overlay.style.height = '169%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            overlay.style.zIndex = '999';
        }

        function closeSidebar() {
            sidebar.style.left = '-250px';
            sidebar.style.visibility = 'hidden';
            sidebar.style.opacity = '0';
            toggleButton.style.transform = 'rotate(0deg)';
            toggleButton.style.display = 'block';
            overlay.style.display = 'none';
        }
    } else {
        console.error('One or more elements are missing: sidebar, toggleButton, or overlay.');
    }
});
    



function signOutAndClearSession() {
    // مسح جميع البيانات من sessionStorage
    sessionStorage.clear();
    console.log("Session storage cleared.");

    // إعادة التوجيه إلى صفحة تسجيل الدخول بعد تسجيل الخروج
    window.location.href = 'https://mohasibfriend.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6oefeov5mb34okbe1fgf5l6lbd&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard'; // تعديل الرابط إلى صفحة تسجيل الدخول الخاصة بك
}

// ربط الدالة بزر تسجيل الخروج
document.getElementById("logoutButton").addEventListener("click", signOutAndClearSession);





// استمع إلى حدث الضغط على زر "Logout"
document.getElementById("logoutButton").addEventListener("click", function () {
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
            window.location.href = "https://mohasibfriend.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6oefeov5mb34okbe1fgf5l6lbd&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
        }
    }
});

