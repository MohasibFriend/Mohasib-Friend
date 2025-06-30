// إزالة استخدام الرقم التسجيلي الثابت وجلبه من sessionStorage
const registrationNumber = sessionStorage.getItem('registrationNumber'); // جلب الرقم التسجيلي من Session Storage
const subscriptionStatus = sessionStorage.getItem('subscriptionStatus'); // جلب حالة الاشتراك من Session Storage
/// دالة لفحص وجود userId في sessionStorage والتصرف بناءً عليه
const userId =sessionStorage.getItem('userId')

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

// قائمة أنواع الوثائق
const documents = [
    'Tax Card - البطاقة الضريبية',
    'Commercial Register - السجل التجاري',
    'Operating License - رخصة التشغيل',
    'Industrial Register - السجل الصناعي',
    'Chamber of Commerce Subscription - اشتراك الغرفة التجارية',
    'Value Added Tax Certificate - شهادة ضريبة القيمة المضافة',
    'Egyptian Federation for Construction and Building Contractors Registration - تسجيل الاتحاد المصري لمقاولي التشييد والبناء',
    'Industrial Chambers Registration - اشتراك الغرف الصناعية',
    'Small and Medium Enterprises Registration - تسجيل المشروعات الصغيرة والمتوسطة',
    'Certificate of Import for Raw Materials, Production Supplies, Machinery, and Equipment - شهادة استيراد لخامات ومستلزمات الانتاج والالات والمعدات ',
    'Company Products Export Certificate - شهادة  تصدير منتجات الشركة',
    'Needs Card - بطاقة الاحتياجات',
    'Importers Register - سجل المستوردين',
    'Exporters Register - سجل المصدرين',
    'Commercial Agents Register - سجل وكلاء الشركة',
    'Lease contracts - عقود ايجار',
    'Car licenses - رخص سيارات',
    'Insurance Subscription -اشتراك التأمينات',
    'Renewal of Token (e-Invoice / e-Signature / Social Insurance) - تجديد التوكن ( الفاتورة الالكترونية / التوقيع الالكتروني / التأمينات )',
    'Other - وثيقة أخرى'
];

// كائن لتخزين الملفات المختارة بمعرفات فريدة
let selectedFiles = {};

// كائن لتتبع عدد الأسطر المضافة لكل وثيقة
let addedLinesCount = {};

/**
 * دالة لإظهار السبينر
 */
function showSpinner() {
    $("#loadingSpinner").show();
}

/**
 * دالة لإخفاء السبينر
 */
function hideSpinner() {
    $("#loadingSpinner").hide();
}

// Function to Create Dynamic Page Elements
function createPageElements() {
    const resultContainer = document.getElementById('Result');
    if (!resultContainer) {
        alert('Result container not found.');
        return;
    }

    const container = document.createElement('div');
    container.style.width = '96.5%';
    container.style.height = 'auto';
    container.style.padding = '20px';
    container.style.border = '3px solid black';
    container.style.borderRadius = '20px';
    container.id = 'mainContainer'; // For Media Query
    container.style.fontFamily = 'Arial, Helvetica, sans-serif';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.border = '3px solid black';
    table.style.borderRadius = '15px';
    table.style.marginTop = '20px';
    table.style.backgroundColor = '#ffffff';
    table.id = 'documentTable'; // For Media Query

    // إنشاء رأس الجدول مع عمود "Add Line"
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Document Name', 'Add Line', 'Select File', 'Upload', 'Status', 'Expiry Date', 'Days Remaining', 'Download'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '3px solid black';
        th.style.padding = '4px';
        th.style.borderRadius = '10px';
        th.style.backgroundColor = 'var(--background-nav)';
        th.style.color='var(--text-color)';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    documents.forEach((documentName, index) => {
        // تهيئة addedLinesCount لكل وثيقة
        addedLinesCount[documentName] = 1; // يبدأ من 1 لتشمل الصف الأصلي

        const row = createDocumentRow(documentName, index + 1);
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.appendChild(table);
    resultContainer.appendChild(container);

    fetchDocumentStatuses();
}

// Function to Create a Document Row (Original or Duplicated)
function createDocumentRow(documentName, uniqueId, isDuplicate = false, originalName = null) {
    const row = document.createElement('tr');
    row.setAttribute('data-original', isDuplicate ? 'false' : 'true'); // تحديد الصف كأصلي أو مكرر

    // إذا كان الصف مكرر، تخزين الاسم الأصلي
    if (isDuplicate && originalName) {
        row.setAttribute('data-original-name', originalName);
    } else {
        row.setAttribute('data-original-name', documentName);
    }

    // خلية اسم الوثيقة
    const nameCell = document.createElement('td');
    nameCell.textContent = documentName;
    nameCell.style.textAlign = 'center';
    nameCell.style.fontWeight = 'bold';
    nameCell.style.borderBottom = '3px solid #000';
    row.appendChild(nameCell);

    // خلية زر "Add Line" (تشمل أزرار "+" و"-")
    const addLineCell = document.createElement('td');
    addLineCell.style.textAlign = 'center';
    addLineCell.style.borderBottom = '3px solid #000';

    // زر "+" لإضافة سطر جديد
    const addLineButton = document.createElement('button');
    addLineButton.textContent = '+';
    addLineButton.title = 'Add Line';
    addLineButton.className = 'addline';
    addLineButton.style.padding = '5px 10px';
    addLineButton.style.marginRight = '5px';
    addLineButton.style.backgroundColor = 'var(--background-nav)';
    addLineButton.style.fontWeight = 'bold';
    addLineButton.style.marginBottom = '5px';
    addLineButton.style.color = '#fff';
    addLineButton.style.border = '2px solid #000';
    addLineButton.style.borderRadius = '5px';
    addLineButton.style.cursor = 'pointer';
    addLineButton.style.transition = '0.3s';

    addLineButton.addEventListener('mouseover', function () {
        addLineButton.style.backgroundColor = 'var(--hover-icon)'; // لون الخلفية عند التمرير
    });

    addLineButton.addEventListener('mouseout', function () {
        addLineButton.style.backgroundColor = 'var(--background-nav)'; // اللون الأصلي
    });

    // تعطيل زر الإضافة إذا تم الوصول إلى الحد الأقصى للأسطر
    const originalNameForCount = isDuplicate ? originalName : documentName;
    if (addedLinesCount[originalNameForCount] >= 5) {
        addLineButton.disabled = true;
        addLineButton.style.backgroundColor = '#ccc';
        addLineButton.style.cursor = 'not-allowed';
    }

    // مستمع حدث لزر "+"
    addLineButton.addEventListener('click', function () {
        if (addedLinesCount[originalNameForCount] < 5) {
            const newDocumentName = `${addedLinesCount[originalNameForCount]}- ${originalNameForCount}`;
            const newRow = createDocumentRow(newDocumentName, `${uniqueId}_${addedLinesCount[originalNameForCount]}`, true, originalNameForCount);
            row.parentNode.insertBefore(newRow, row.nextSibling);

            addedLinesCount[originalNameForCount]++; // زيادة العد لكل سطر جديد

            // تعطيل زر الإضافة إذا تم الوصول إلى الحد الأقصى
            if (addedLinesCount[originalNameForCount] >= 5) {
                addLineButton.disabled = true;
                addLineButton.style.backgroundColor = '#ccc';
                addLineButton.style.cursor = 'not-allowed';
            }
        } else {
            alert('لقد وصلت إلى الحد الأقصى لإضافة الخانات لهذا المستند.');
        }
    });

    addLineCell.appendChild(addLineButton);

    // زر "-" لحذف السطر
    const deleteLineButton = document.createElement('button');
    deleteLineButton.textContent = '-';
    deleteLineButton.title = 'Delete Line';
    deleteLineButton.style.padding = '5px 10px';
    deleteLineButton.style.backgroundColor = 'rgb(231 96 86)';
    deleteLineButton.style.color = '#fff';
    deleteLineButton.style.border = '2px solid #000';
    deleteLineButton.style.fontWeight = 'bold';
    deleteLineButton.style.borderRadius = '5px';
    deleteLineButton.style.cursor = 'pointer';
    deleteLineButton.style.transition = '0.3s';

    deleteLineButton.addEventListener('mouseover', function () {
        deleteLineButton.style.backgroundColor = 'rgb(163 49 40)'; // لون الخلفية عند التمرير
    });

    deleteLineButton.addEventListener('mouseout', function () {
        deleteLineButton.style.backgroundColor = 'rgb(231 96 86)'; // اللون الأصلي
    });

    // مستمع حدث لزر "-"
    deleteLineButton.addEventListener('click', async function () {
        const docName = nameCell.textContent;

        const confirmation = confirm(`Are you sure you want to delete the document "${docName}"?`);
        if (!confirmation) return;

        // استدعاء دالة deleteDocument
        await deleteDocument(docName);

        if (isDuplicate) {
            row.parentNode.removeChild(row);
            addedLinesCount[originalNameForCount]--;

            // إعادة تمكين زر "+" إذا كان معطلاً
            const originalRow = findOriginalRow(originalNameForCount);
            if (originalRow) {
                const originalAddButton = originalRow.querySelector('button[title="Add Line"]');
                if (addedLinesCount[originalNameForCount] < 5 && originalAddButton.disabled) {
                    originalAddButton.disabled = false;
                    originalAddButton.style.backgroundColor = 'rgb(135 164 237)'; // إعادة اللون الأصلي
                    originalAddButton.style.cursor = 'pointer';
                }
            }
        } else {
            // مسح إدخال الملف وإعادة تعيين خلايا الحالة
            const fileInput = row.querySelector('input[type="file"]');
            fileInput.value = '';
            delete selectedFiles[fileInput.id];

            const statusCell = row.querySelector('td:nth-child(5)');
            const expiryDateCell = row.querySelector('td:nth-child(6)');
            const daysRemainingCell = row.querySelector('td:nth-child(7)');
            const downloadButton = row.querySelector('td:nth-child(8) button');

            statusCell.textContent = '__';
            expiryDateCell.textContent = '__';
            daysRemainingCell.textContent = '__';
            downloadButton.disabled = true;
        }
    });

    addLineCell.appendChild(deleteLineButton);

    row.appendChild(addLineCell);

    // خلية اختيار الملف
    const fileCell = document.createElement('td');
    fileCell.style.borderBottom = '3px solid #000';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = `file${uniqueId}`;
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.png,.xlsx';
    fileInput.style.backgroundColor = 'var(--background-nav)';
    fileInput.style.border = '2px solid black';
    fileInput.style.borderRadius = '10px';
    fileInput.style.fontWeight = 'bold';
    fileInput.style.display = 'block';
    fileInput.style.margin = '0 auto';
    fileInput.style.width = '90%';
    fileInput.style.color= 'var(--text-color)';

    // التعامل مع اختيار الملف
    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            selectedFiles[fileInput.id] = fileInput.files[0];
        }
    });

    // **التعديل: التحكم في إمكانية تحميل الوثيقة بناءً على حالة الاشتراك**
    // تحديد ما إذا كان يُسمح بتحميل الوثيقة
    let isUploadAllowed = false;
    if (subscriptionStatus === 'ACTIVE') {
        isUploadAllowed = true; // يُسمح بتحميل جميع الوثائق
    } else if (subscriptionStatus === 'FREE_TRIAL') {
        // يُسمح فقط بتحميل البطاقة الضريبية
        if (documentName === 'Tax Card - البطاقة الضريبية' || documentName === 'Value Added Tax Certificate - شهادة ضريبة القيمة المضافة') {
            isUploadAllowed = true;
        } else {
            isUploadAllowed = false;
        }
    }
    

    // تعطيل اختيار الملف إذا لم يُسمح بالتحميل
    if (!isUploadAllowed) {
        fileInput.disabled = true;
        fileInput.title = 'للمشتركين فقط';
        fileInput.style.backgroundColor = '#ccc';
    }

    fileCell.appendChild(fileInput);
    row.appendChild(fileCell);

    // خلية زر التحميل
    const uploadCell = document.createElement('td');
    uploadCell.style.borderBottom = '3px solid #000';
    const uploadButton = document.createElement('button');

    // إضافة "Upload" و"رفع" إلى الزر
    const firstWord = document.createElement('span');
    firstWord.textContent = 'Upload';
    firstWord.style.display = 'block';

    const secondWord = document.createElement('span');
    secondWord.textContent = 'رفع';
    secondWord.style.display = 'block';

    uploadButton.appendChild(firstWord);
    uploadButton.appendChild(secondWord);

    // **التعديل: تعطيل زر التحميل إذا لم يُسمح بالتحميل**
    if (!isUploadAllowed) {
        uploadButton.textContent = 'للمشتركين فقط'; // تغيير النص
        uploadButton.disabled = true;
        uploadButton.style.backgroundColor = '#ccc';
        uploadButton.style.cursor = 'not-allowed';
    }

    // **إضافة النمط CSS للزر المعطل**
    uploadButton.className = isUploadAllowed ? '' : 'disabled-button';

    // أنماط الزر
    uploadButton.style.display = 'block';
    uploadButton.style.padding = '10px';
    uploadButton.style.backgroundColor = isUploadAllowed ? 'var(--background-nav)' : '#ccc';
    uploadButton.style.border = '2px solid black';
    uploadButton.style.borderRadius = '10px';
    uploadButton.style.width = '100%';
    uploadButton.style.fontWeight = 'bold';
    uploadButton.style.transition = '0.3s';
    uploadButton.style.color='var(--text-color)';

    // مستمع حدث التحميل فقط إذا كان مسموحًا
    if (isUploadAllowed) {
        uploadButton.addEventListener('click', async () => {
            const file = selectedFiles[fileInput.id];
            if (!file) {
                alert('برجاء اختيار الملف الذي تريد رفعه');
                return;
            }
            await uploadDocument(file, documentName, row);
        });
    } else {
        // إضافة مستمع للنقر يعرض رسالة للمشتركين فقط
        uploadButton.addEventListener('click', () => {
            alert('هذه الخاصية مخصصة للمشتركين فقط. يرجى الترقية للاستفادة منها.');
        });
    }

    uploadCell.appendChild(uploadButton);
    row.appendChild(uploadCell);

    // خلية الحالة
    const statusCell = document.createElement('td');
    statusCell.textContent = '__';
    statusCell.style.textAlign = 'center';
    statusCell.style.fontWeight = 'bold';
    statusCell.style.borderBottom = '3px solid #000';
    row.appendChild(statusCell);

    // خلية تاريخ الانتهاء (قابلة للتعديل)
    const expiryDateCell = document.createElement('td');
    expiryDateCell.textContent = '__';
    expiryDateCell.style.textAlign = 'center';
    expiryDateCell.style.borderBottom = '3px solid #000';
    expiryDateCell.style.fontWeight = 'bold';
    expiryDateCell.style.cursor = 'pointer';

    // مستمع حدث لتعديل تاريخ الانتهاء
    expiryDateCell.addEventListener('click', () => {
        if (expiryDateCell.textContent !== '__') {
            createExpiryDateModal(documentName, expiryDateCell.textContent, async (editedDate, isDateChanged) => {
                if (isDateChanged) {
                    await sendEditedExpiryDate(documentName, editedDate);
                } else {
                    alert('Expiry date confirmed.');
                }
            });
        }
    });

    row.appendChild(expiryDateCell);

    // خلية الأيام المتبقية
    const daysRemainingCell = document.createElement('td');
    daysRemainingCell.textContent = '__';
    daysRemainingCell.style.textAlign = 'center';
    daysRemainingCell.style.fontWeight = 'bold';
    daysRemainingCell.style.borderBottom = '3px solid #000';
    row.appendChild(daysRemainingCell);

    // خلية زر التنزيل
    const downloadCell = document.createElement('td');
    downloadCell.style.borderBottom = '3px solid #000';
    const downloadButton = document.createElement('button');

    // إضافة "Download" و"تحميل" إلى الزر
    const firstWordDownload = document.createElement('span');
    firstWordDownload.textContent = 'Download';
    firstWordDownload.style.display = 'block';

    const secondWordDownload = document.createElement('span');
    secondWordDownload.textContent = 'تحميل';
    secondWordDownload.style.display = 'block';

    downloadButton.appendChild(firstWordDownload);
    downloadButton.appendChild(secondWordDownload);

    // أنماط الزر
    downloadButton.style.color = 'var(--text-color)';
    downloadButton.style.padding = '10px';
    downloadButton.style.backgroundColor = 'var(--background-nav)';
    downloadButton.style.border = '2px solid black';
    downloadButton.style.borderRadius = '10px';
    downloadButton.style.width = '100%';
    downloadButton.style.fontWeight = 'bold';
    downloadButton.style.transition = '0.3s';
    downloadButton.disabled = true; // معطل بشكل افتراضي

    downloadButton.addEventListener('mouseover', function () {
        downloadButton.style.backgroundColor = 'var(--download-company-hover)'; // تغيير لون الخلفية عند التمرير
        downloadButton.style.color = '#fff'; // تغيير لون النص عند التمرير
        downloadButton.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.2)'; // إضافة ظل
    });

    downloadButton.addEventListener('mouseout', function () {
        downloadButton.style.backgroundColor = 'var(--background-nav)'; // اللون الأصلي
        downloadButton.style.color = 'var(--text-color)'; // اللون الأصلي للنص
        downloadButton.style.boxShadow = 'none'; // إزالة الظل
    });

    downloadCell.appendChild(downloadButton);
    row.appendChild(downloadCell);

    return row;
}

// Helper Function to Find the Original Row for a Given Document Name
function findOriginalRow(originalName) {
    const tbody = document.querySelector('tbody');
    return Array.from(tbody.children).find(row => {
        const isOriginal = row.getAttribute('data-original') === 'true';
        const originalNameAttr = row.getAttribute('data-original-name');
        return isOriginal && originalNameAttr === originalName;
    });
}

// Function to Convert File to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Get only Base64 Data
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Function to Create and Display the Expiry Date Confirmation Modal
function createExpiryDateModal(docName, currentExpiryDate, onConfirm) {
    // إنشاء تراكب النافذة المنبثقة
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'expiryDateModalOverlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '1000';

    // إنشاء حاوية النافذة المنبثقة
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.style.backgroundColor = '#fff';
    modalContainer.style.padding = '20px';
    modalContainer.style.borderRadius = '10px';
    modalContainer.style.width = '50%';
    modalContainer.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    modalContainer.style.position = 'absolute';

    // عنوان النافذة المنبثقة
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Confirm Expiry Date';
    modalTitle.style.textAlign = 'center';
    modalContainer.appendChild(modalTitle);

    // اسم الوثيقة
    const docNameElem = document.createElement('p');
    docNameElem.textContent = ` ${docName}`;
    docNameElem.style.textAlign = 'center';
    docNameElem.style.backgroundColor = 'var(--border)';
    docNameElem.style.width = 'auto';
    docNameElem.style.padding = '15px';
    docNameElem.style.borderRadius = '10px';
    docNameElem.style.border = '3px #000 solid'
    docNameElem.style.color='var( --text-color)';
    modalContainer.appendChild(docNameElem);

    // إدخال تاريخ الانتهاء
    const expiryDateLabel = document.createElement('label');
    expiryDateLabel.textContent = 'Expiry Date:';
    expiryDateLabel.htmlFor = 'expiryDateInput';
    modalContainer.appendChild(expiryDateLabel);

    const expiryDateInput = document.createElement('input');
    expiryDateInput.type = 'date';
    expiryDateInput.id = 'expiryDateInput';
    expiryDateInput.value = currentExpiryDate ? formatDateForInput(currentExpiryDate) : ''; // تنسيق التاريخ
    expiryDateInput.style.width = '95%';
    expiryDateInput.style.padding = '8px';
    expiryDateInput.style.margin = '10px 0';

    modalContainer.appendChild(expiryDateInput);

    // حاوية الأزرار
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'flex-end';

    // زر الإلغاء
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 12px';
    cancelButton.style.marginRight = '10px';
    cancelButton.style.backgroundColor = '#ccc';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '10px';
    cancelButton.style.cursor = 'pointer';
    buttonsContainer.appendChild(cancelButton);

    // زر التأكيد
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirmButton';
    confirmButton.textContent = 'Confirm';
    confirmButton.style.padding = '8px 12px';
    confirmButton.style.backgroundColor = 'var(--background-nav)';
    confirmButton.style.color = 'var(--text-color)';
    confirmButton.style.fontWeight = 'bold';
    confirmButton.style.transition = '0.5s';
    confirmButton.style.border = '#000 solid 3px';
    confirmButton.style.borderRadius = '10px';
    confirmButton.style.cursor = 'pointer';
    buttonsContainer.appendChild(confirmButton);

    confirmButton.addEventListener('mouseover', function () {
        confirmButton.style.backgroundColor = 'var(--download-company-hover)'; // تغيير لون الخلفية عند التمرير
        confirmButton.style.color = 'white'; // تغيير لون النص عند التمرير
        confirmButton.style.transform = 'scale(1.05)'; // تأثير تكبير خفيف
        confirmButton.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.5)'; // إضافة ظل
    });

    confirmButton.addEventListener('mouseout', function () {
        confirmButton.style.backgroundColor = 'var(--background-nav)'; // اللون الأصلي
        confirmButton.style.color = 'var(--text-color)'; // اللون الأصلي للنص
        confirmButton.style.transform = 'scale(1)'; // إعادة الحجم الأصلي
        confirmButton.style.boxShadow = 'none'; // إزالة الظل
    });

    modalContainer.appendChild(buttonsContainer);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // دالة لجعل النافذة المنبثقة قابلة للسحب (اختياري)
    function makeModalDraggable(modalOverlay, modalContainer) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        modalContainer.addEventListener('mousedown', function (e) {
            isDragging = true;
            offsetX = e.clientX - modalContainer.offsetLeft;
            offsetY = e.clientY - modalContainer.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (isDragging) {
                const newLeft = e.clientX - offsetX;
                const newTop = e.clientY - offsetY;

                // منع النافذة من الخروج خارج نطاق العرض
                const maxLeft = window.innerWidth - modalContainer.offsetWidth;
                const maxTop = window.innerHeight - modalContainer.offsetHeight;
                const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft));
                const boundedTop = Math.max(0, Math.min(newTop, maxTop));

                modalContainer.style.left = `${boundedLeft}px`;
                modalContainer.style.top = `${boundedTop}px`;
            }
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // جعل النافذة المنبثقة قابلة للسحب (اختياري)
    // makeModalDraggable(modalOverlay, modalContainer); // يمكنك تفعيلها إذا كنت تريد جعل النافذة قابلة للسحب

    // مستمعات الأحداث للأزرار
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });

    // مستمع حدث keydown لمفتاح Esc لإغلاق النافذة
    function handleEscape(event) {
        if (event.key === "Escape") {
            modalOverlay.remove();
            document.removeEventListener("keydown", handleEscape);
        }
    }
    document.addEventListener("keydown", handleEscape);

    confirmButton.addEventListener('click', () => {
        const editedDate = expiryDateInput.value;
        if (!editedDate) {
            alert('Please enter a valid expiry date.');
            return;
        }

        const isDateChanged = editedDate !== (currentExpiryDate ? formatDateForInput(currentExpiryDate) : '');
        onConfirm(editedDate, isDateChanged);
        document.body.removeChild(modalOverlay);
    });

    // مستمع حدث للضغط على مفتاح Enter في حقل الإدخال
    expiryDateInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            // منع السلوك الافتراضي
            event.preventDefault();
            // تفعيل الزر
            confirmButton.click();
        }
    });
}

// **دالة لتنسيق التواريخ لتكون متوافقة مع إدخال التاريخ**
function formatDateForInput(dateString) {
    // dateString متوقع في تنسيق 'DD-MM-YYYY' أو 'DD/MM/YYYY'
    const parts = dateString.split(/[-\/]/); // التقسيم على '-' أو '/'
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (!day || !month || !year) return '';
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return formattedDate;
}

// **دالة لإرسال تاريخ الانتهاء المعدل إلى API**
async function sendEditedExpiryDate(docName, editedDate) {
    const editApiUrl = 'https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_company_document'; // تأكد من صحة الرابط

    const payload = {
        userId : userId ,
        file_name: docName,
        expiry_date: editedDate
    };

    try {
        showSpinner(); // إظهار السبينر أثناء الاستدعاء

        const response = await fetch(editApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        let data = await response.json();

        // تحليل data.body إذا كانت سلسلة نصية
        if (typeof data.body === 'string') {
            try {
                data = JSON.parse(data.body);
            } catch (e) {
                console.error('Error parsing JSON string:', e);
                alert('Failed to parse response. Please try again.');
                return;
            }
        }

        if (response.ok && data.success) {
            alert(`Expiry date for ${docName} updated successfully.`);
            // تحديث حالة الوثائق
            await fetchDocumentStatuses();
        } else {
            console.error(`Error updating expiry date for ${docName}:`, data.message || data);
            alert(`Error: ${data.message || 'Failed to update expiry date.'}`);
        }
    } catch (error) {
        console.error(`Error in sendEditedExpiryDate for ${docName}:`, error);
        alert('Failed to update expiry date. Please try again.');
    } finally {
        hideSpinner(); // إخفاء السبينر بعد الاستدعاء
    }
}

// إضافة عنصر السبينر إلى الصفحة
const spinnerHTML = `
    <div id="loadingSpinner" style="
        display: none;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
    ">
        <div style="
            border: 8px solid #f3f3f3;
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
        "></div>
    </div>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        /* نمط الزر المعطل */
        .disabled-button {
            background-color: #2c2c2c !important;
            cursor: not-allowed;
            color:#fff !important;
            opacity: 0.6;
        }
    </style>
`;
document.body.insertAdjacentHTML('beforeend', spinnerHTML);

// Function to Show the Spinner
function showSpinner() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

// Function to Hide the Spinner
function hideSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Function to Refresh the Page
function refreshPage() {
    location.reload();
}

// Function to Upload Document to Lambda
async function uploadDocument(file, docName, row) {
    const uploadApiUrl = 'https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_company_document';  // استبدل بالرابط الفعلي لـ Lambda

    try {
        showSpinner(); // إظهار السبينر أثناء الرفع

        const fileBase64 = await toBase64(file);

        const payload = {
            userId: userId,
            file_name: docName,
            file_content: fileBase64
        };

        const response = await fetch(uploadApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data) {
            row.querySelector('td:nth-child(5)').textContent = 'Uploaded';
            row.querySelector('td:nth-child(5)').style.color = 'green';
            row.querySelector('td:nth-child(8) button').disabled = false; // تفعيل زر التنزيل

            // تحديث حالة الوثائق
            await fetchDocumentStatuses();

            // استخراج تاريخ الانتهاء للوثيقة المرفوعة من الصف المحدث
            const expiryDateCell = row.querySelector('td:nth-child(6)');
            const expiryDate = expiryDateCell.textContent !== '__' ? expiryDateCell.textContent : '';

            // عرض النافذة المنبثقة مع تحديد تاريخ الانتهاء المستخرج
            createExpiryDateModal(docName, expiryDate, async (editedDate, isDateChanged) => {
                if (isDateChanged) {
                    await sendEditedExpiryDate(docName, editedDate);
                } else {
                }

                // تحديث الصفحة بعد التعامل مع تاريخ الانتهاء
                refreshPage(); // <-- تحديث الصفحة هنا
            });

        } else {
            console.error(`Error uploading document for ${docName}:`, data.message || data);
            alert(`Error: ${data.message || 'Failed to upload document.'}`);
        }
    } catch (error) {
        console.error(`خطأ في رفع ملف ${docName}:`, error);
        alert('Upload failed. Please try again.');
    } finally {
        hideSpinner(); // إخفاء السبينر بعد الرفع
    }
}

// Function to Delete Document
async function deleteDocument(docName) {
    const deleteApiUrl = 'https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_company_document';

    try {
        showSpinner(); // إظهار السبينر أثناء الحذف

        const payload = {
            userId: userId,
            file_name: docName,
            delete: true
        };

        const response = await fetch(deleteApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data) {
            alert(`Document ${docName} deleted successfully.`);
            // تحديث حالة الوثائق
            await fetchDocumentStatuses();
            // تحديث الصفحة بعد التعامل مع تاريخ الانتهاء
            refreshPage(); // <-- تحديث الصفحة هنا
        } else {
            console.error(`Error deleting document ${docName}:`, data.message || data);
            alert(`Error: ${data.message || 'Failed to delete document.'}`);
        }
    } catch (error) {
        console.error(`Error deleting document ${docName}:`, error);
        alert('Failed to delete document. Please try again.');
    } finally {
        hideSpinner(); // إخفاء السبينر بعد الحذف
    }
}

// Function to Normalize Text
function normalizeText(text) {
    if (!text) return '';

    // إزالة الترميزات اليونيكود وأي أحرف خاصة أو مسافات زائدة
    return text
        .replace(/\\u[\dA-Fa-f]{4}/g, '') // إزالة ترميزات اليونيكود
        .replace(/[^\w\s\u0621-\u064A]/g, '') // إزالة أي أحرف خاصة باستثناء الحروف العربية والإنجليزية والأرقام
        .replace(/\s+/g, '') // إزالة جميع المسافات
        .trim(); // إزالة المسافات الزائدة في البداية والنهاية
}

// Function to Update Table with Fetched Status Details
function updateTableWithStatus(fileDetails) {
    const tbody = document.querySelector('tbody');


    fileDetails.forEach((fileDetail) => {
        // التحقق مما إذا كان fileDetail يحتوي على ملفات


        if (fileDetail.files && fileDetail.files.length > 0) {
            fileDetail.files.forEach(file => {

                if (!file.folder_name) {
                    console.warn('folder_name غير موجود في الاستجابة:', file);
                    return;
                }

                // تطبيع اسم المجلد من الاستجابة
                const normalizedResponseName = normalizeText(file.folder_name);

                // محاولة إيجاد صف مطابق
                let row = Array.from(tbody.children).find(row => {
                    const documentNameCell = row.querySelector('td:first-child');
                    if (documentNameCell) {
                        // تطبيع النص في خلية اسم الوثيقة
                        const normalizedDocumentName = normalizeText(documentNameCell.textContent);
                        return normalizedDocumentName === normalizedResponseName;
                    }
                    return false;
                });

                // إذا لم يتم العثور على صف مطابق، إنشاء صف جديد
                if (!row) {
                    // استخراج اسم الوثيقة الأصلي وعدد الأسطر المضافة
                    let match = file.folder_name.match(/^(\d+)-\s*(.*)/);
                    if (match) {
                        let lineNumber = parseInt(match[1]);
                        let originalName = match[2];

                        // التأكد من تحديث addedLinesCount
                        if (!addedLinesCount[originalName]) {
                            addedLinesCount[originalName] = 1;
                        }

                        if (addedLinesCount[originalName] < 5) {
                            const newRow = createDocumentRow(file.folder_name, `${Date.now()}_${Math.random()}`, true, originalName);
                            tbody.appendChild(newRow);
                            addedLinesCount[originalName]++;

                            // تحديث مرجع الصف إلى الصف الجديد
                            row = newRow;
                        }
                    } else {
                        console.warn('Could not parse folder_name:', file.folder_name);
                        return;
                    }
                }

                // تحديث الصف بتفاصيل الملف
                if (row) {
                    const statusCell = row.querySelector('td:nth-child(5)');
                    const expiryDateCell = row.querySelector('td:nth-child(6)');
                    const daysRemainingCell = row.querySelector('td:nth-child(7)');
                    const downloadButton = row.querySelector('td:nth-child(8) button');

                    // تحديث الحالة بناءً على حالة الإنذار
                    if (!file.alarm_status || file.alarm_status === 'No alarm') {
                        statusCell.textContent = 'OK';
                        statusCell.style.color = 'green';
                        expiryDateCell.style.color = 'green';
                        daysRemainingCell.style.color = 'green';
                    } else {
                        statusCell.textContent = file.alarm_status;
                        if (file.alarm_status.trim() === 'Expired') {
                            statusCell.style.color = 'red';
                            expiryDateCell.style.color = 'red';
                            daysRemainingCell.style.color = 'red';
                        } else {
                            statusCell.style.color = 'black';
                            expiryDateCell.style.color = 'black';
                            daysRemainingCell.style.color = 'black';
                        }
                    }

                    // ملء خلايا تاريخ الانتهاء والأيام المتبقية
                    expiryDateCell.textContent = file.expiry_date || 'N/A';
                    daysRemainingCell.textContent = file.days_left || 'N/A';

                    // تمكين زر التنزيل
                    if (file.download_url) {
                        downloadButton.disabled = false;
                        downloadButton.onclick = () => {
                            const signedURL = file.download_url;  // تعيين اسم افتراضي مع امتداد .pdf
                            if (signedURL) {
                                // فتح الرابط في تبويب جديد
                                window.open(signedURL, '_blank');
                            } else {
                                alert('فشل في الحصول على رابط التنزيل.');
                            }
                        };
                    } else {
                        downloadButton.disabled = true;
                        downloadButton.onclick = null;
                    }
                }
            });
        } else {
            console.warn('لم يتم العثور على ملفات داخل الكائن fileDetail:', fileDetail);
        }
    });
}

// Function to Fetch Document Statuses from Lambda
async function fetchDocumentStatuses() {
    const fetchApiUrl = 'https://ma0sx37da7.execute-api.us-east-1.amazonaws.com/prod/mf_fetch_company_document';

    try {
        showSpinner(); // إظهار السبينر أثناء الجلب

        const response = await fetch(fetchApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId  // رقم التسجيل مُرسل في الحمولة
            })
        });

        let data = await response.json();

        // تحليل data.body إذا كانت سلسلة نصية
        if (typeof data.body === 'string') {
            try {
                data = JSON.parse(data.body);
            } catch (e) {
                console.error('Error parsing JSON string:', e);
                
                return [];
            }
        }

        // تسجيل البيانات للتصحيح

        // التأكد من وجود data.files
        if (response.ok && data.files) {
            updateTableWithStatus([data]); // تمرير البيانات كمصفوفة
        } else {
            console.error('Invalid response structure:', data);
            
        }
    } catch (error) {
        console.error('Error fetching document statuses:', error);
        alert('فشل في جلب حالة الوثائق. برجاء المحاولة مرة أخرى.');
    } finally {
        hideSpinner(); // إخفاء السبينر بعد الجلب
    }
}

// Function to Clear Session Storage and Log Out the User
function logOutAndClearSession() {
    sessionStorage.clear();
    window.location.href =
        "https://us-east-1fhfklvrxm.auth.us-east-1.amazoncognito.com/login?response_type=code&client_id=6fj5ma49n4cc1b033qiqsblc2v&redirect_uri=https://personal-opn5odjq.outsystemscloud.com/MohasibFriend/homedashboard";
}

// إضافة مستمع حدث لزر تسجيل الخروج
const logoutButton = document.getElementById("logoutbutton");

if (logoutButton) {
    logoutButton.addEventListener("click", logOutAndClearSession);
}

// Function to Upload Document to Lambda
// (تم تعريفها سابقًا)

// Function to Delete Document
// (تم تعريفها سابقًا)

// Function to Initialize the App
function initApp() {
    createPageElements();
    fetchDocumentStatuses();  // جلب حالة الوثائق عند تحميل الصفحة
}

// تحميل jQuery ديناميكيًا إذا لم يكن محملاً بالفعل
if (typeof jQuery === 'undefined') {
    const script = document.createElement('script');
    script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    script.onload = function () {
        $(document).ready(function () {
            initApp();
        });
    };
    script.onerror = function () {
        console.error("Failed to load jQuery.");
    };
    document.head.appendChild(script);
} else {
    $(document).ready(function () {
        initApp();
    });
}

// أنماط Media Queries (تم تعليقها في الكود الأصلي)
const style = document.createElement('style');
style.textContent = `
   /* @media (max-width: 768px) {
        #mainContainer {
            padding: 10px;
            width: 85% ;
            height: auto;

            background-color: rgb(163, 182, 229);
            border: 3px solid black;
            border-radius: 20px;

        }

       
        #documentTable {
            font-size: 4px;
            margin-Left : -5% !important;
        }
        th, td {
            padding: 5px;
        }
        input[type="file"], button {
            font-size: 12px;
            width: 100%;
        }
    }
    @media (max-width: 480px) {
        #mainContainer {
            padding: 1px;
        }
        #documentTable {
            font-size: 4px;
            width: 100%;
            margin-left: -20px;
        }
        th, td {
            padding: 2px;
        }
        input[type="file"], button {
            font-size: 7px;
            width: 100%;
        }
    }*/
`;
document.head.appendChild(style);

// Additional Code (showInfo, closeModal) remains unchanged

function showInfo() {
    document.getElementById("infoModal").style.display = "block";
}

function closeModal() {
    document.getElementById("infoModal").style.display = "none";
}

// إغلاق النافذة المنبثقة عند النقر خارج المحتوى
window.onclick = function (event) {
    if (event.target == document.getElementById("infoModal")) {
        closeModal();
    }
}

// إضافة مستمع حدث للضغط على مفتاح Esc لإغلاق النافذة
window.addEventListener('keydown', function (event) {
    // التحقق مما إذا كان المفتاح المضغوط هو Esc
    if (event.key === 'Escape' || event.key === 'Esc') {
        closeModal();
    }
});
