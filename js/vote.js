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
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
});

const proposals = [
    "مخزن",
    "شيكات وتحصيلات",
    "كسب العمل",
    "تحليل العملاء والموردين",
    "اقرار الخصم والتحصيل"
];

let selectedVotes = [];
const maxVotes = 3;

const userId = sessionStorage.getItem('userId');
const proposalsContainer = document.getElementById('proposals-container');
const alertMessage = document.getElementById('alert-message');
const spinner = document.getElementById('spinner');

function showSpinner() {
    spinner.style.display = 'flex';
}

function hideSpinner() {
    spinner.style.display = 'none';
}

function showAlert(message) {
    alertMessage.innerText = message;
    alertMessage.style.display = 'block';
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    proposals.forEach(proposal => {
        const proposalDiv = document.createElement('div');
        proposalDiv.className = 'proposal';
        proposalDiv.innerHTML = `
            <h3>${proposal}</h3>
            <button class="vote-button" data-proposal="${proposal}">تصويت</button>
            <div class="vote-count" id="count-${sanitize(proposal)}" style="display: none;">0 صوت</div>
        `;
        proposalsContainer.appendChild(proposalDiv);
    });

    getVotes();
    addVoteButtonListeners();
    setTimeout(hideSpinner, 1000);
});

function sanitize(text) {
    return text.replace(/[^a-zA-Z0-9\-]/g, "_");
}

function getVotes() {
    showSpinner();
    fetch("https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_voting_fetch", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    })
    .then(response => response.json())
    .then(data => {
        let responseData = data.body ? JSON.parse(data.body) : data;
        if (responseData.votes) {
            proposals.forEach(proposal => {
                const countElement = document.getElementById(`count-${sanitize(proposal)}`);
                if (responseData.votes[proposal] > 0) {
                    countElement.innerText = `${responseData.votes[proposal]} صوت`;
                } else {
                    countElement.innerText = `0 صوت`;
                }
            });

            if (responseData.userVotes) {
                selectedVotes = responseData.userVotes;
                if (selectedVotes.length >= maxVotes) {
                    // عرض جميع عدادات الأصوات وتعطيل الأزرار
                    proposals.forEach(proposal => {
                        const countElement = document.getElementById(`count-${sanitize(proposal)}`);
                        countElement.style.display = 'block';
                    });
                    disableAllButtons();
                } else {
                    // عرض عدادات الأصوات فقط للاقتراحات التي صوت عليها المستخدم
                    selectedVotes.forEach(proposal => {
                        const countElement = document.getElementById(`count-${sanitize(proposal)}`);
                        countElement.style.display = 'block';
                    });
                    disableSelectedButtons();
                }
            }
        }
        hideSpinner();
    })
    .catch(error => {
        showAlert('حدث خطأ أثناء جلب بيانات التصويت.');
        hideSpinner();
    });
}

function addVoteButtonListeners() {
    document.querySelectorAll('.vote-button').forEach(button => {
        button.addEventListener('click', () => {
            const proposal = button.getAttribute('data-proposal');
            submitVote(proposal, button);
        });
    });
}

function submitVote(proposal, buttonElement) {
    if (selectedVotes.length >= maxVotes) {
        showAlert("لقد وصلت للحد الأقصى من التصويتات.");
        return;
    }

    showSpinner();  // إظهار الـ Spinner أثناء التصويت

    fetch("https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_voting_upload", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, proposal })
    })
    .then(response => response.json())
    .then(data => {
        let responseData = data.body ? JSON.parse(data.body) : data;
        if (responseData.success) {
            const countElement = document.getElementById(`count-${sanitize(proposal)}`);
            countElement.innerText = `${responseData.voteCount} صوت`;
            countElement.style.display = 'block'; // عرض عداد الأصوات بعد التصويت
            selectedVotes.push(proposal);

            if (selectedVotes.length >= maxVotes) {
                // إذا وصل المستخدم للحد الأقصى، عرض جميع عدادات الأصوات وتعطيل الأزرار
                proposals.forEach(proposal => {
                    const countElement = document.getElementById(`count-${sanitize(proposal)}`);
                    countElement.style.display = 'block';
                });
                disableAllButtons();
            } else {
                // تعطيل الزر الذي تم التصويت عليه
                buttonElement.disabled = true;
                buttonElement.style.backgroundColor = '#6c757d';
            }
        } else {
            showAlert(responseData.message || 'حدث خطأ أثناء التصويت.');
        }
        hideSpinner();  // إخفاء الـ Spinner بعد التصويت
    })
    .catch(error => {
        showAlert('حدث خطأ أثناء التصويت.');
        hideSpinner();  // إخفاء الـ Spinner في حالة الخطأ
    });
}

function disableSelectedButtons() {
    document.querySelectorAll('.vote-button').forEach(button => {
        const proposal = button.getAttribute('data-proposal');
        if (selectedVotes.includes(proposal)) {
            button.disabled = true;
            button.style.backgroundColor = '#6c757d';
        }
    });
}

function disableAllButtons() {
    document.querySelectorAll('.vote-button').forEach(button => {
        button.disabled = true;
        button.style.backgroundColor = '#6c757d';
    });
}
