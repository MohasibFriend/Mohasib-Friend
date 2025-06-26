// script.js
const API     = "https://cauntkqx43.execute-api.us-east-1.amazonaws.com/prod/mf_fetct_Customer-and-supplier-analysis";
const regNum  = sessionStorage.getItem('registrationNumber');
const spinner = document.getElementById("spinnerOverlay");
const btnCust = document.getElementById("btnCustomer");
const btnSupp = document.getElementById("btnSupplier");
const btnRef  = document.getElementById("btnRefresh");
const pageCust= document.getElementById("customerPage");
const pageSupp= document.getElementById("supplierPage");
const custDD  = document.getElementById("custDropdown");
const suppDD  = document.getElementById("suppDropdown");
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

const custChart = new Chart(
  document.getElementById("custChart").getContext("2d"),
  {
    type: "doughnut",
    data: {
      labels: ["فواتير", "ضرائب"],
      datasets: [{ data: [0, 0] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#fff",  // تجعل نص الأسطر (فواتير و ضرائب) باللون الأبيض
            fontsize:"24px"
          }
        }
      }
    }
  }
);

const suppChart = new Chart(
  document.getElementById("suppChart").getContext("2d"),
  {
    type: "doughnut",
    data: {
      labels: ["فواتير", "ضرائب"],
      datasets: [{ data: [0, 0] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#fff"  // هنا بنخلي لون الكــلِمات أبيض
          }
        }
      }
    }
  }
);


function showSpinner() { spinner.style.display = "flex"; }
function hideSpinner() { spinner.style.display = "none"; }

function updateSummary(group, list) {
  const dd       = group === "customer" ? custDD : suppDD;
  dd.innerHTML   = "";
  list.forEach(item => {
    const o = document.createElement("option");
    o.value       = item.taxNo;
    o.text        = item.companyName;
    o.dataset.inv = item.totalInvoice;
    o.dataset.vat = item.totalVat;
    o.dataset.url = item.downloadUrl;
    dd.appendChild(o);
  });
  const totalInv = list.reduce((s, i) => s + Number(i.totalInvoice), 0);
  const totalVat = list.reduce((s, i) => s + Number(i.totalVat), 0);
  const chart    = group === "customer" ? custChart : suppChart;
  chart.data.datasets[0].data = [totalInv, totalVat];
  chart.update();
  if (dd.options.length) onChange(group);
}

function fetchSummary(group, force = false) {
  const key    = `summary_${group}`;
  const cached = sessionStorage.getItem(key);
  if (!force && cached) {
    updateSummary(group, JSON.parse(cached));
    btnRef.classList.remove("d-none");
    return;
  }
  btnRef.classList.add("d-none");

  function attemptFetch(retry) {
    showSpinner();
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationNumber: regNum, group })
    })
      .then(r => r.json())
      .then(w => {
        const data = w.body ? JSON.parse(w.body) : w;
        const list = data.summary || [];
        sessionStorage.setItem(key, JSON.stringify(list));
        updateSummary(group, list);
        btnRef.classList.remove("d-none");
      })
      .catch(() => {
        if (retry > 0) attemptFetch(retry - 1);
      })
      .finally(hideSpinner);
  }

  attemptFetch(1);
}

function onChange(group) {
  const isC = group === "customer";
  const dd  = isC ? custDD : suppDD;
  const inv = Number(dd.selectedOptions[0].dataset.inv);
  const vat = Number(dd.selectedOptions[0].dataset.vat);

  // تحديث الدونت حسب القيم المحددة
  const chart = isC ? custChart : suppChart;
  chart.data.datasets[0].data = [inv, vat];
  chart.update();

  document.getElementById(isC ? "custTotalInv" : "suppTotalInv").textContent = inv;
  document.getElementById(isC ? "custTotalVat" : "suppTotalVat").textContent = vat;
  document.getElementById(isC ? "custDownload" : "suppDownload")
    .onclick = () => window.open(dd.selectedOptions[0].dataset.url, "_blank");

  function attemptDetailFetch(retry) {
    showSpinner();
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationNumber: regNum, group, taxNo: dd.value })
    })
      .then(r => r.json())
      .then(w => {
        const d   = w.body ? JSON.parse(w.body) : w;
        const tbl = document.getElementById(isC ? "custTable" : "suppTable");
        tbl.querySelector("thead").innerHTML =
          "<tr>" + d.headers.map(h => `<th>${h}</th>`).join("") + "</tr>";
        tbl.querySelector("tbody").innerHTML =
          d.rows.map(row =>
            "<tr>" + d.headers.map(h => `<td>${row[h]||""}</td>`).join("") + "</tr>"
          ).join("");
      })
      .catch(() => {
        if (retry > 0) attemptDetailFetch(retry - 1);
      })
      .finally(hideSpinner);
  }

  attemptDetailFetch(1);
}

function wireSearch(inputId, dd) {
  document.getElementById(inputId).addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    Array.from(dd.options).forEach(o => o.hidden = !o.text.toLowerCase().includes(q));
  });
}

function wireTable(inputId, tblId) {
  document.getElementById(inputId).addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    document.getElementById(tblId).querySelectorAll("tbody tr")
      .forEach(r => r.style.display = r.textContent.toLowerCase().includes(q) ? "" : "none");
  });
}

btnCust.onclick = () => showPage("customer");
btnSupp.onclick = () => showPage("supplier");
btnRef.onclick  = () => {
  const grp = pageCust.classList.contains("d-none") ? "supplier" : "customer";
  fetchSummary(grp, true);
};

function showPage(page) {
  const isC = page === "customer";
  pageCust.classList.toggle("d-none", !isC);
  pageSupp.classList.toggle("d-none", isC);
  btnCust.classList.toggle("btn-primary", isC);
  btnCust.classList.toggle("btn-outline-primary", !isC);
  btnSupp.classList.toggle("btn-primary", !isC);
  btnSupp.classList.toggle("btn-outline-primary", isC);
  const key = `summary_${page}`;
  if (sessionStorage.getItem(key)) btnRef.classList.remove("d-none");
  else btnRef.classList.add("d-none");
  fetchSummary(page);
}

custDD.addEventListener("change", () => onChange("customer"));
suppDD.addEventListener("change", () => onChange("supplier"));
wireSearch("custSearch", custDD);
wireSearch("suppSearch", suppDD);
wireTable("custTableSearch", "custTable");
wireTable("suppTableSearch", "suppTable");

showPage("customer");
