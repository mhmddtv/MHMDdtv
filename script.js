const STORAGE_KEY = 'diabetes_records_v7'; // تغيير المفتاح لتجنب تضارب البيانات القديمة

// عند تحميل الصفحة، قم بعرض السجلات الموجودة
document.addEventListener('DOMContentLoaded', () => {
    // تعيين التاريخ الحالي كقيمة افتراضية للتاريخ العام
    const today = new Date();
    document.getElementById('entryDate').valueAsDate = today;

    // تعيين الوقت الحالي كقيمة افتراضية لكل حقول الوقت
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Update all time input fields
    document.getElementById('timeFasting').value = currentTime;
    document.getElementById('timePreBreakfast').value = currentTime;
    document.getElementById('timePostBreakfast').value = currentTime;
    document.getElementById('timePreLunch').value = currentTime;
    document.getElementById('timePostLunch').value = currentTime;
    document.getElementById('timePreDinner').value = currentTime;
    document.getElementById('timePostDinner').value = currentTime;
    document.getElementById('timeBedtime').value = currentTime;
    document.getElementById('timeMidnight').value = currentTime;
    document.getElementById('timeInsulinSlow').value = currentTime;

    displayRecords();
    displayDailyTip(); // استدعاء دالة عرض النصيحة اليومية

    // إضافة مُستمع الحدث لزر الحفظ
    document.getElementById('saveEntryBtn').addEventListener('click', saveEntry);
    // إضافة مُستمع الحدث لزر مسح الحقول
    document.getElementById('clearFormBtn').addEventListener('click', clearFormFields);
    // إضافة مُستمع الحدث لزر مسح جميع السجلات
    document.getElementById('deleteAllRecordsBtn').addEventListener('click', deleteAllRecords);
    // إضافة مُستمع الحدث لفلترة السجلات بالتاريخ
    document.getElementById('filterDate').addEventListener('change', displayRecords);
    // إضافة مُستمع الحدث لزر مسح الفلترة
    document.getElementById('clearFilterBtn').addEventListener('click', () => {
        document.getElementById('filterDate').value = ''; // مسح قيمة حقل التاريخ
        displayRecords(); // إعادة عرض جميع السجلات
    });

    // إضافة مُستمع حدث لزر تصدير الصورة
    const exportImageBtn = document.getElementById('exportImageBtn');
    if (exportImageBtn) {
        exportImageBtn.addEventListener('click', exportRecordsAsImage);
    }
});

// دالة لحفظ الإدخالات
function saveEntry() {
    const entryDate = document.getElementById('entryDate').value;

    if (!entryDate) {
        showStatusMessage('الرجاء إدخال التاريخ.', 'error');
        return;
    }

    const newRecord = {
        id: Date.now(), // معرف فريد لكل سجل
        date: entryDate,
        fasting: {
            glucose: document.getElementById('glucoseFasting').value,
            time: document.getElementById('timeFasting').value,
            insulinRapid: document.getElementById('insulinRapidFasting').value
        },
        preBreakfast: {
            glucose: document.getElementById('glucosePreBreakfast').value,
            time: document.getElementById('timePreBreakfast').value,
            insulinRapid: document.getElementById('insulinRapidPreBreakfast').value,
            carbs: document.getElementById('carbsPreBreakfast').value
        },
        postBreakfast: {
            glucose: document.getElementById('glucosePostBreakfast').value,
            time: document.getElementById('timePostBreakfast').value
        },
        preLunch: {
            glucose: document.getElementById('glucosePreLunch').value,
            time: document.getElementById('timePreLunch').value,
            insulinRapid: document.getElementById('insulinRapidPreLunch').value,
            carbs: document.getElementById('carbsPreLunch').value
        },
        postLunch: {
            glucose: document.getElementById('glucosePostLunch').value,
            time: document.getElementById('timePostLunch').value
        },
        preDinner: {
            glucose: document.getElementById('glucosePreDinner').value,
            time: document.getElementById('timePreDinner').value,
            insulinRapid: document.getElementById('insulinRapidPreDinner').value,
            carbs: document.getElementById('carbsPreDinner').value
        },
        postDinner: {
            glucose: document.getElementById('glucosePostDinner').value,
            time: document.getElementById('timePostDinner').value
        },
        bedtime: {
            glucose: document.getElementById('glucoseBedtime').value,
            time: document.getElementById('timeBedtime').value,
            insulinRapid: document.getElementById('insulinRapidBedtime').value
        },
        midnight: {
            glucose: document.getElementById('glucoseMidnight').value,
            time: document.getElementById('timeMidnight').value,
            insulinRapid: document.getElementById('insulinRapidMidnight').value
        },
        insulinSlow: document.getElementById('insulinSlow').value,
        timeInsulinSlow: document.getElementById('timeInsulinSlow').value,
        carbRatio: document.getElementById('carbRatio').value,
        bloodSugarAfter: document.getElementById('bloodSugarAfter').value,
        insulinRapidPurpose: document.querySelector('input[name="insulinRapidPurpose"]:checked')?.value || '' // تأكد من اختيار قيمة
    };

    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    showStatusMessage('تم حفظ القياسات والجرعات بنجاح!', 'success');
    clearFormFields();
    displayRecords();
}

// دالة لمسح جميع حقول النموذج
function clearFormFields() {
    // إعادة تعيين التاريخ والوقت الحاليين
    const today = new Date();
    document.getElementById('entryDate').valueAsDate = today;
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    const timeFields = ['timeFasting', 'timePreBreakfast', 'timePostBreakfast', 'timePreLunch', 'timePostLunch', 'timePreDinner', 'timePostDinner', 'timeBedtime', 'timeMidnight', 'timeInsulinSlow'];
    timeFields.forEach(id => document.getElementById(id).value = currentTime);

    // مسح حقول الأرقام والنصوص
    const numberTextFields = [
        'glucoseFasting', 'insulinRapidFasting',
        'glucosePreBreakfast', 'insulinRapidPreBreakfast', 'carbsPreBreakfast',
        'glucosePostBreakfast',
        'glucosePreLunch', 'insulinRapidPreLunch', 'carbsPreLunch',
        'glucosePostLunch',
        'glucosePreDinner', 'insulinRapidPreDinner', 'carbsPreDinner',
        'glucosePostDinner',
        'glucoseBedtime', 'insulinRapidBedtime',
        'glucoseMidnight', 'insulinRapidMidnight',
        'insulinSlow', 'carbRatio', 'bloodSugarAfter'
    ];
    numberTextFields.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });

    // إعادة تعيين زر الراديو الافتراضي
    const defaultRadio = document.getElementById('purposeHigh');
    if (defaultRadio) defaultRadio.checked = true;

    showStatusMessage('تم مسح جميع حقول النموذج.', 'info');
}

// دالة لعرض السجلات المحفوظة
function displayRecords() {
    const recordsDisplay = document.getElementById('recordsDisplay');
    recordsDisplay.innerHTML = ''; // مسح أي سجلات سابقة

    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // تطبيق الفلترة إذا كان هناك تاريخ محدد
    const filterDate = document.getElementById('filterDate').value;
    if (filterDate) {
        records = records.filter(record => record.date === filterDate);
    }

    if (records.length === 0) {
        recordsDisplay.innerHTML = '<p>لا توجد سجلات محفوظة حتى الآن.</p>';
        return;
    }

    // فرز السجلات من الأحدث إلى الأقدم
    records.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);

    records.forEach(record => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'record-item';
        recordDiv.setAttribute('data-id', record.id); // إضافة data-id لسهولة الحذف

        let content = `
            <h3>تاريخ: ${record.date}</h3>
            <div class="record-details">
                <div class="detail-block">
                    <h4>الصيام</h4>
                    <p>القياس: ${record.fasting.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.fasting.time || '-'}</p>
                    <p>أنسولين: ${record.fasting.insulinRapid || '-'} وحدة</p>
                </div>
                <div class="detail-block">
                    <h4>قبل الفطور</h4>
                    <p>القياس: ${record.preBreakfast.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.preBreakfast.time || '-'}</p>
                    <p>أنسولين: ${record.preBreakfast.insulinRapid || '-'} وحدة</p>
                    <p>كارب: ${record.preBreakfast.carbs || '-'} غرام</p>
                </div>
                <div class="detail-block">
                    <h4>بعد الفطور</h4>
                    <p>القياس: ${record.postBreakfast.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.postBreakfast.time || '-'}</p>
                </div>
                <div class="detail-block">
                    <h4>قبل الغداء</h4>
                    <p>القياس: ${record.preLunch.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.preLunch.time || '-'}</p>
                    <p>أنسولين: ${record.preLunch.insulinRapid || '-'} وحدة</p>
                    <p>كارب: ${record.preLunch.carbs || '-'} غرام</p>
                </div>
                <div class="detail-block">
                    <h4>بعد الغداء</h4>
                    <p>القياس: ${record.postLunch.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.postLunch.time || '-'}</p>
                </div>
                <div class="detail-block">
                    <h4>قبل العشاء</h4>
                    <p>القياس: ${record.preDinner.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.preDinner.time || '-'}</p>
                    <p>أنسولين: ${record.preDinner.insulinRapid || '-'} وحدة</p>
                    <p>كارب: ${record.preDinner.carbs || '-'} غرام</p>
                </div>
                <div class="detail-block">
                    <h4>بعد العشاء</h4>
                    <p>القياس: ${record.postDinner.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.postDinner.time || '-'}</p>
                </div>
                <div class="detail-block">
                    <h4>قبل النوم</h4>
                    <p>القياس: ${record.bedtime.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.bedtime.time || '-'}</p>
                    <p>أنسولين: ${record.bedtime.insulinRapid || '-'} وحدة</p>
                </div>
                <div class="detail-block">
                    <h4>المنتصف</h4>
                    <p>القياس: ${record.midnight.glucose || '-'} ملغ/دل</p>
                    <p>الوقت: ${record.midnight.time || '-'}</p>
                    <p>أنسولين: ${record.midnight.insulinRapid || '-'} وحدة</p>
                </div>
                <div class="detail-block">
                    <h4>أنسولين بطيء</h4>
                    <p>وحدات: ${record.insulinSlow || '-'} وحدة</p>
                    <p>الوقت: ${record.timeInsulinSlow || '-'}</p>
                </div>
                <div class="detail-block">
                    <h4>نسبة الكارب</h4>
                    <p>${record.carbRatio || '-'}</p>
                </div>
                <div class="detail-block">
                    <h4>بعد سكر مرتفع/منخفض</h4>
                    <p>القياس: ${record.bloodSugarAfter || '-'} ملغ/دل</p>
                    <p>السبب: ${record.insulinRapidPurpose || '-'}</p>
                </div>
            </div>
            <button class="delete-record-btn action-button delete-button" data-id="${record.id}">حذف هذا السجل</button>
        `;
        recordDiv.innerHTML = content;
        recordsDisplay.appendChild(recordDiv);
    });

    // إضافة مُستمعي حدث الحذف لكل زر حذف سجل
    document.querySelectorAll('.delete-record-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const recordId = parseInt(event.target.dataset.id);
            deleteRecord(recordId);
        });
    });
}

// دالة لحذف سجل معين
function deleteRecord(idToDelete) {
    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const updatedRecords = records.filter(record => record.id !== idToDelete);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    showStatusMessage('تم حذف السجل بنجاح.', 'success');
    displayRecords(); // إعادة عرض السجلات بعد الحذف
}

// دالة لمسح جميع السجلات
function deleteAllRecords() {
    if (confirm('هل أنت متأكد أنك تريد مسح جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        localStorage.removeItem(STORAGE_KEY);
        showStatusMessage('تم مسح جميع السجلات بنجاح!', 'success');
        displayRecords(); // تحديث العرض
    }
}

// دالة لعرض رسائل الحالة
function showStatusMessage(message, type) {
    const statusMessageDiv = document.getElementById('statusMessage');
    if (statusMessageDiv) {
        statusMessageDiv.textContent = message;
        statusMessageDiv.className = `status-message ${type}`;
        statusMessageDiv.style.display = 'block'; // Show the message

        setTimeout(() => {
            statusMessageDiv.style.display = 'none'; // Hide after 3 seconds
        }, 3000);
    }
}


// ----------- الدوال الجديدة لتصدير الصورة والنصائح -----------

// قائمة بالنصائح (يمكنك إضافة المزيد هنا)
const tips = [
    "تأكد من شرب كمية كافية من الماء طوال اليوم للحفاظ على ترطيب الجسم.",
    "قم بممارسة النشاط البدني بانتظام. حتى المشي السريع يمكن أن يساعد في تحسين مستويات السكر.",
    "تناول وجبات متوازنة وغنية بالألياف للمساعدة في تنظيم مستويات السكر في الدم.",
    "راقب مستويات السكر في الدم بانتظام وسجلها لمتابعة تقدمك.",
    "استشر طبيبك أو أخصائي التغذية للحصول على خطة غذائية مناسبة لك.",
    "تعلم كيفية قراءة ملصقات الطعام لفهم محتوى الكربوهيدرات والسكريات.",
    "حافظ على أوقات نوم منتظمة وكافية، فالنوم يؤثر على مستويات السكر.",
    "تعلم كيفية التعامل مع ارتفاع وانخفاض سكر الدم، وكن مستعدًا دائمًا.",
    "لا تتردد في طلب الدعم من عائلتك وأصدقائك، أو الانضمام إلى مجموعات دعم مرضى السكري.",
    "تذكر أنك قوي وقادر على إدارة السكري والعيش حياة صحية ونشطة!"
];

// دالة لعرض نصيحة عشوائية يوميًا
function displayDailyTip() {
    const dailyTipElement = document.getElementById('dailyTip');
    if (dailyTipElement) {
        const randomIndex = Math.floor(Math.random() * tips.length);
        dailyTipElement.textContent = tips[randomIndex];
    }
}

// دالة لتصدير السجلات كصورة باستخدام html2canvas
function exportRecordsAsImage() {
    // العنصر الذي يحتوي على السجلات المراد تصديرها
    // تأكد من أن 'recordsDisplay' هو الـ ID الصحيح للعنصر الذي يعرض سجلاتك
    const recordsContainer = document.getElementById('recordsDisplay'); 

    if (recordsContainer) {
        // يمكنك تعديل الخيارات هنا (مثل backgroundColor لجعل الخلفية بيضاء إذا كانت شفافة)
        html2canvas(recordsContainer, {
            scale: 2, // لزيادة جودة الصورة
            backgroundColor: '#ffffff' // تعيين خلفية بيضاء لضمان وضوح الصورة
        }).then(canvas => {
            // إنشاء رابط لتنزيل الصورة
            const link = document.createElement('a');
            link.download = 'سجلات-السكري.png'; // اسم الملف الذي سيتم تنزيله
            link.href = canvas.toDataURL('image/png'); // تحويل الكانفاس إلى صورة PNG بصيغة data URL
            
            // إضافة الرابط مؤقتًا إلى الجسم النقر عليه ثم إزالته
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showStatusMessage('تم تصدير السجلات كصورة بنجاح!', 'success');
        }).catch(error => {
            console.error('حدث خطأ أثناء تصدير الصورة:', error);
            showStatusMessage('فشل تصدير السجلات كصورة. يرجى المحاولة مرة أخرى.', 'error');
        });
    } else {
        showStatusMessage('لم يتم العثور على عنصر عرض السجلات لتصديره.', 'error');
    }
}