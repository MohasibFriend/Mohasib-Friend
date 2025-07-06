// 1) Redirect to Cognito login if userId missing
function checkUserId() {
  if (!sessionStorage.getItem("userId")) {
    window.location.href =
      "https://us-east-1asnaeuufl.auth.us-east-1.amazoncognito.com/login/continue?" +
      "client_id=1v5jdad42jojr28bcv13sgds5r&" +
      "redirect_uri=https%3A%2F%2Fmohasibfriend.com%2Fhome.html&" +
      "response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile";
  }
}

// On window load, check immediately and then every 500ms
window.addEventListener('load', () => {
  checkUserId();
  setInterval(checkUserId, 500);
});

// 2) Apply persisted theme
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
});

// 3) Voting UI setup
const proposalsContainer = document.getElementById('proposals-container');
const alertMessage       = document.getElementById('alert-message');
const spinner            = document.getElementById('spinner');
const maxVotes           = 3;

const userId = sessionStorage.getItem('userId');
let proposals = [];
let selectedVotes = [];

function showSpinner()      { spinner.style.display = 'flex'; }
function hideSpinner()      { spinner.style.display = 'none'; }
function showAlert(msg) {
  alertMessage.innerText = msg;
  alertMessage.style.display = 'block';
  setTimeout(() => alertMessage.style.display = 'none', 3000);
}
function sanitize(text) {
// اسمح بأي حرف أو رقم (حتى عربي)، واستبدل الفراغات وعلامات الترقيم بــ_
return text
  .trim()
  .replace(/[^\p{L}\p{N}]+/gu, '_');
}

function renderProposals(list) {
  proposalsContainer.innerHTML = '';
  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'proposal';
    div.innerHTML = `
      <h3>${p}</h3>
      <button class="vote-button" data-proposal="${p}">تصويت</button>
      <div class="vote-count" id="count-${sanitize(p)}" style="display:none;">0 صوت</div>
    `;
    proposalsContainer.appendChild(div);
  });
  addVoteButtonListeners();
}

function getVotes() {
  showSpinner();
  fetch("https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_voting_fetch", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  .then(r => r.json())
  .then(raw => {
    const data = raw.body ? JSON.parse(raw.body) : raw;
    if (data.votes) {
      // Build dynamic proposals list
      proposals = Object.keys(data.votes);
      renderProposals(proposals);

      // Update counts
      proposals.forEach(p => {
        const cnt = data.votes[p] || 0;
        const el  = document.getElementById(`count-${sanitize(p)}`);
        el.innerText = `${cnt} صوت`;
      });

      // Track user's existing votes
      selectedVotes = data.userVotes || [];
      if (selectedVotes.length >= maxVotes) {
        // show all counts + disable all
        proposals.forEach(p => document.getElementById(`count-${sanitize(p)}`).style.display = 'block');
        disableAllButtons();
      } else {
        // show only votes user made + disable those buttons
        selectedVotes.forEach(p => document.getElementById(`count-${sanitize(p)}`).style.display = 'block');
        disableSelectedButtons();
      }
    }
  })
  .catch(_ => showAlert('حدث خطأ أثناء جلب بيانات التصويت.'))
  .finally(hideSpinner);
}

function addVoteButtonListeners() {
  document.querySelectorAll('.vote-button').forEach(btn => {
    btn.addEventListener('click', () => submitVote(btn.getAttribute('data-proposal'), btn));
  });
}

function submitVote(proposal, btn) {
  if (selectedVotes.length >= maxVotes) {
    showAlert("لقد وصلت للحد الأقصى من التصويتات.");
    return;
  }
  showSpinner();
  fetch("https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_voting_upload", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, proposal })
  })
  .then(r => r.json())
  .then(raw => {
    const data = raw.body ? JSON.parse(raw.body) : raw;
    if (data.success) {
      // update count & UI
      const el = document.getElementById(`count-${sanitize(proposal)}`);
      el.innerText = `${data.voteCount} صوت`;
      el.style.display = 'block';
      selectedVotes.push(proposal);
      if (selectedVotes.length >= maxVotes) {
        proposals.forEach(p => document.getElementById(`count-${sanitize(p)}`).style.display = 'block');
        disableAllButtons();
      } else {
        btn.disabled = true;
        btn.style.backgroundColor = '#6c757d';
      }
    } else {
      showAlert(data.message || 'حدث خطأ أثناء التصويت.');
    }
  })
  .catch(_ => showAlert('حدث خطأ أثناء التصويت.'))
  .finally(hideSpinner);
}

function disableSelectedButtons() {
  document.querySelectorAll('.vote-button').forEach(btn => {
    if (selectedVotes.includes(btn.getAttribute('data-proposal'))) {
      btn.disabled = true;
      btn.style.backgroundColor = '#6c757d';
    }
  });
}

function disableAllButtons() {
  document.querySelectorAll('.vote-button').forEach(btn => {
    btn.disabled = true;
    btn.style.backgroundColor = '#6c757d';
  });
}

// Initialize voting on DOM ready
document.addEventListener('DOMContentLoaded', getVotes);
