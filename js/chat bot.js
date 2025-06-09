const apiBaseQuestions = 'https://ew2fax97hb.execute-api.us-east-1.amazonaws.com/prod/chat';
const apiBaseAnswers = 'https://ew2fax97hb.execute-api.us-east-1.amazonaws.com/prod/chatbot-answer';
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
/**
 * دالة لإظهار السبينر
 */
function showSpinner() {
    const spinner = document.getElementById("spinner");
    if (spinner) {
        spinner.style.display = "block";
    }
}

/**
 * دالة لإخفاء السبينر
 */
function hideSpinner() {
    const spinner = document.getElementById("spinner");
    if (spinner) {
        spinner.style.display = "none";
    }
}

/**
 * دالة لتحميل الأسئلة من الـ sessionStorage إن وُجدت
 */
function loadQuestionsFromSession() {
    const sessionData = sessionStorage.getItem("chatbotQuestions");
    if (sessionData) {
        try {
            return JSON.parse(sessionData);
        } catch (e) {
            console.error("Error parsing chatbotQuestions from sessionStorage:", e);
            return null;
        }
    }
    return null;
}

/**
 * دالة لعرض الأسئلة في عنصر القائمة مع تطبيق تأثير dropEffect حسب الحاجة
 * @param {Array} questions - مصفوفة الأسئلة
 * @param {boolean} animateDrop - إذا كانت true يتم تطبيق تأثير dropEffect، وإذا كانت false فلا
 */
function displayQuestions(questions, animateDrop = true) {
    const questionsList = document.getElementById('questions');
    if (!questionsList) return;
    questionsList.innerHTML = '';
    questions.forEach(question => {
        const li = document.createElement('li');
        li.textContent = question;
        li.onclick = () => sendMessage(question);
        li.style.animation = animateDrop ? "dropEffect 0.5s ease-out" : "none";
        questionsList.appendChild(li);
    });
}

/**
 * دالة لجلب الأسئلة من الـ API وتحديث الـ sessionStorage والعرض
 * @param {boolean} showSpinnerFlag - إذا كانت true يتم إظهار السبينر وتطبيق تأثير drop، وإذا false فلا
 */
function fetchQuestions(showSpinnerFlag = true) {
    if (showSpinnerFlag) showSpinner();
    fetch(apiBaseQuestions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        let parsedData = JSON.parse(data.body);
        const questions = parsedData.questions || [];
        // تحديث الـ sessionStorage بالأسئلة الجديدة
        sessionStorage.setItem("chatbotQuestions", JSON.stringify(questions));
        displayQuestions(questions, showSpinnerFlag);
        if (showSpinnerFlag) hideSpinner();
    })
    .catch(error => {
        console.error("Error fetching questions:", error);
        if (showSpinnerFlag) hideSpinner();
    });
}

/**
 * دالة لإرسال رسالة المستخدم (السؤال) وعرضها في الـ chat ثم جلب الإجابة
 */
function sendMessage(question) {
    // إخفاء رسالة الترحيب
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) welcomeMessage.style.display = 'none';

    const chatBody = document.getElementById('chatBody');

    // عرض رسالة المستخدم
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message');
    userMessage.textContent = question;
    chatBody.appendChild(userMessage);

    // عرض تحميل للإجابة (سبينر صغير داخل رسالة البوت)
    const botLoading = document.createElement('div');
    botLoading.classList.add('message', 'bot-message');
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading');
    botLoading.appendChild(loadingSpinner);
    chatBody.appendChild(botLoading);

    fetchAnswer(question, botLoading);
}

/**
 * دالة لجلب إجابة البوت بناءً على السؤال وإظهارها مع تأثير الكتابة
 */
function fetchAnswer(question, botLoading) {
    fetch(apiBaseAnswers, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question })
    })
    .then(response => response.json())
    .then(data => {
        let parsedData = JSON.parse(data.body);
        const answer = parsedData.answer || 'لم يتم العثور على إجابة.';
        botLoading.innerHTML = '';
        typeWriter(answer, botLoading, 10);
    })
    .catch(error => {
        console.error("Error fetching answer:", error);
        botLoading.innerHTML = 'حدث خطأ أثناء جلب الإجابة.';
    });
}

/**
 * دالة تأثير الكتابة (Typewriter effect) لعرض النص حرف بحرف مع auto-scroll
 */
function typeWriter(text, element, speed) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;

            // تحديث التمرير لمتابعة ظهور النص
            const chatBody = document.getElementById('chatBody');
            if (chatBody) {
                chatBody.scrollTop = chatBody.scrollHeight;
            }

            setTimeout(type, speed);
        }
    }
    type();
}

// عند تحميل الصفحة يتم محاولة تحميل الأسئلة من sessionStorage أولاً ثم جلبها من الـ API
window.onload = function() {
    const cachedQuestions = loadQuestionsFromSession();
    if (cachedQuestions) {
        // عرض الأسئلة المحفوظة بدون تأثير drop
        displayQuestions(cachedQuestions, false);
    }
    // إذا لم توجد بيانات محفوظة، يتم إظهار السبينر وتطبيق تأثير drop عند جلب البيانات
    fetchQuestions(!cachedQuestions);
};

// إضافة CSS الخاص بتأثير dropEffect إلى رأس الصفحة
const dropEffectStyle = document.createElement('style');
dropEffectStyle.innerHTML = `
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
document.head.appendChild(dropEffectStyle);
