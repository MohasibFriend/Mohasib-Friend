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

document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById("chatBox");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const loadingIndicator = document.getElementById("loadingIndicator");
    
    // استبدل الرابط التالي برابط API الصحيح الخاص بك
    const API_URL = "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fun_gpt";
  
    // تركيز على حقل الإدخال عند تحميل الصفحة
    messageInput.focus();
  
    // دالة للحصول على الوقت الحالي بتنسيق مناسب
    function getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  
    // دالة لإضافة رسالة في واجهة الدردشة
    function addMessageToChat(sender, message, withAnimation = true) {
      // إزالة بطاقة الترحيب إن وُجدت
      const welcomeCard = document.querySelector('.welcome-card');
      if (welcomeCard) {
        welcomeCard.style.opacity = "0";
        setTimeout(() => {
          welcomeCard.remove();
        }, 300);
      }
      
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", sender);
      
      const messageBubble = document.createElement("div");
      messageBubble.classList.add("message-bubble", sender);
      messageBubble.innerText = message;
      
      const timeSpan = document.createElement("span");
      timeSpan.classList.add("message-time");
      timeSpan.innerText = getCurrentTime();
      
      messageDiv.appendChild(messageBubble);
      messageDiv.appendChild(timeSpan);
      
      // تأثير الظهور التدريجي
      if (withAnimation) {
        messageDiv.style.opacity = "0";
        messageDiv.style.transform = "translateY(10px)";
      }
      
      chatBox.appendChild(messageDiv);
      smoothScrollToBottom();
      
      if (withAnimation) {
        setTimeout(() => {
          messageDiv.style.opacity = "1";
          messageDiv.style.transform = "translateY(0)";
          messageDiv.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        }, 10);
      }
    }
  
    // مؤشر الكتابة
    function addTypingIndicator() {
      const typingDiv = document.createElement("div");
      typingDiv.classList.add("typing-indicator");
      typingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `;
      typingDiv.id = "typingIndicator";
      chatBox.appendChild(typingDiv);
      smoothScrollToBottom();
      return typingDiv;
    }
  
    function removeTypingIndicator() {
      const typingIndicator = document.getElementById("typingIndicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
  
    // تمرير سلس للأسفل
    function smoothScrollToBottom() {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
    }
  
    // إرسال الرسالة إلى الـ API
    async function sendMessage() {
      const userMessage = messageInput.value.trim();
      if (!userMessage) return;
  
      // تعطيل الإدخال أثناء الإرسال
      messageInput.disabled = true;
      sendButton.disabled = true;
      
      // عرض رسالة المستخدم في واجهة الدردشة
      addMessageToChat("user", userMessage);
      messageInput.value = "";
  
      // إظهار مؤشر الكتابة
      addTypingIndicator();
  
      try {
        // إرسال الطلب إلى API
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });
  
        // تحويل الاستجابة إلى JSON
        const data = await response.json();
  
        // إزالة مؤشر الكتابة
        removeTypingIndicator();
  
        // استخراج الرد من البيانات المستلمة
        let answer = "";
        if (data.body) {
          // إذا كان الرد ملفوفًا داخل body
          const parsedBody = JSON.parse(data.body);
          answer = parsedBody.answer;
        } else {
          // إذا كان الـ answer مباشرةً في جذر الكائن
          answer = data.answer;
        }
  
        // عرض رد البوت
        if (!answer) {
          addMessageToChat("bot", "!هذه التقنية في فيد التطوير سيتم فتحها ليكما قريبا");
        } else {
          addMessageToChat("bot", answer);
        }
  
      } catch (error) {
        removeTypingIndicator();
        console.error("خطأ في الاتصال:", error);
        addMessageToChat("bot", "عذرًا، حدث خطأ أثناء الاتصال بالخدمة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.");
      } finally {
        // إعادة التفعيل
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
      }
    }
  
    // ربط زر الإرسال بالدالة
    sendButton.addEventListener("click", sendMessage);
  
    // إرسال عند الضغط على Enter
    messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  
    // تركيز حقل الإدخال عند النقر على منطقة الدردشة
    chatBox.addEventListener("click", () => {
      messageInput.focus();
    });
  
    // تمرير سلس للأسفل عند فتح لوحة المفاتيح في الجوال (تقريبًا)
    const checkForVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(smoothScrollToBottom, 300);
      }
    };
    document.addEventListener('visibilitychange', checkForVisibilityChange);
  
    // منع تمرير الصفحة الأساسية عند التمرير داخل صندوق الدردشة
    chatBox.addEventListener('wheel', (e) => {
      if (chatBox.scrollHeight > chatBox.clientHeight) {
        e.stopPropagation();
      }
    }, { passive: true });
  });