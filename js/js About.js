// JavaScript لتبديل اللغة
const btnAr = document.getElementById("btn-ar");
const btnEn = document.getElementById("btn-en");
const langArElements = document.querySelectorAll(".lang-ar");
const langEnElements = document.querySelectorAll(".lang-en");
const body = document.body;
const textsAr = document.querySelectorAll("[data-lang-ar]");
const textsEn = document.querySelectorAll("[data-lang-en]");

btnAr.addEventListener("click", () => {
  // تفعيل اللغة العربية
  langArElements.forEach((el) => {
    el.classList.add("active-lang");
    el.style.display = "block"; // عرض النصوص العربية
  });
  langEnElements.forEach((el) => {
    el.classList.remove("active-lang");
    el.style.display = "none"; // إخفاء النصوص الإنجليزية
  });
  body.setAttribute("dir", "rtl");
  body.setAttribute("lang", "ar");
  // تغيير النصوص في الهيدر والفوتر
  textsAr.forEach((el) => {
    if (el.dataset.langAr) {
      el.textContent = el.getAttribute("data-lang-ar");
    }
  });
  textsEn.forEach((el) => {
    if (el.dataset.langAr) {
      el.textContent = el.getAttribute("data-lang-ar");
    }
  });
  // تفعيل الزر
  btnAr.classList.add("active");
  btnEn.classList.remove("active");
});

btnEn.addEventListener("click", () => {
  // تفعيل اللغة الإنجليزية
  langArElements.forEach((el) => {
    el.classList.remove("active-lang");
    el.style.display = "none"; // إخفاء النصوص العربية
  });
  langEnElements.forEach((el) => {
    el.classList.add("active-lang");
    el.style.display = "block"; // عرض النصوص الإنجليزية
  });
  body.setAttribute("dir", "ltr");
  body.setAttribute("lang", "en");
  // تغيير النصوص في الهيدر والفوتر
  textsAr.forEach((el) => {
    if (el.dataset.langEn) {
      el.textContent = el.getAttribute("data-lang-en");
    }
  });
  textsEn.forEach((el) => {
    if (el.dataset.langEn) {
      el.textContent = el.getAttribute("data-lang-en");
    }
  });
  // تفعيل الزر
  btnEn.classList.add("active");
  btnAr.classList.remove("active");
});
