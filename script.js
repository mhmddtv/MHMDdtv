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

    document.getElementById('timeFasting').value = currentTime;
    document.getElementById('timePostBreakfast').value = currentTime;
    document.getElementById('timePreLunch').value = currentTime;
    document.getElementById('timePostLunch').value = currentTime;
    document.getElementById('timePreDinner').value = currentTime;
    document.getElementById('timePostDinner').value = currentTime;
    document.getElementById('timeBedtime').value = currentTime;
    document.getElementById('timeMidnight').value = currentTime;
    document.getElementById('timeInsulinSlow').value = currentTime; // وقت الأنسولين البطيء

    displayRecords();
});

// دالة لحفظ الإدخالات
function saveEntry() {
    const entryDate = document.getElementById('entryDate').value;

    if (!entryDate) {
        showStatusMessage('الرجاء إدخال التاريخ العام لليوم.', 'error');
        return;
    }

    const insulinSlow = document.getElementById('insulinSlow').value;
    const timeInsulinSlow = document.getElementById('timeInsulinSlow').value; // جلب وقت الأنسولين البطيء

    // جمع بيانات كل قياس على حدة
    const measurements = {
        fasting: {
            glucose: document.getElementById('glucoseFasting').value !== '' ? parseInt(document.getElementById('glucoseFasting').value) : null,
            time: document.getElementById('timeFasting').value || null,
            insulinRapid: document.getElementById('insulinRapidFasting').value !== '' ? parseInt(document.getElementById('insulinRapidFasting').value) : null,
            carb: document.getElementById('carbBreakfast').value !== '' ? parseInt(document.getElementById('carbBreakfast').value) : null, // الكارب للفطور مع الصائم
        },
        postBreakfast: {
            glucose: document.getElementById('glucosePostBreakfast').value !== '' ? parseInt(document.getElementById('glucosePostBreakfast').value) : null,
            time: document.getElementById('timePostBreakfast').value || null,
            insulinRapid: document.getElementById('insulinRapidPostBreakfast').value !== '' ? parseInt(document.getElementById('insulinRapidPostBreakfast').value) : null,
        },
        preLunch: {
            glucose: document.getElementById('glucosePreLunch').value !== '' ? parseInt(document.getElementById('glucosePreLunch').value) : null,
            time: document.getElementById('timePreLunch').value || null,
            insulinRapid: document.getElementById('insulinRapidPreLunch').value !== '' ? parseInt(document.getElementById('insulinRapidPreLunch').value) : null,
            carb: document.getElementById('carbLunch').value !== '' ? parseInt(document.getElementById('carbLunch').value) : null, // الكارب للغداء مع قبل الغداء
        },
        postLunch: {
            glucose: document.getElementById('glucosePostLunch').value !== '' ? parseInt(document.getElementById('glucosePostLunch').value) : null,
            time: document.getElementById('timePostLunch').value || null,
            insulinRapid: document.getElementById('insulinRapidPostLunch').value !== '' ? parseInt(document.getElementById('insulinRapidPostLunch').value) : null,
        },
        preDinner: {
            glucose: document.getElementById('glucosePreDinner').value !== '' ? parseInt(document.getElementById('glucosePreDinner').value) : null,
            time: document.getElementById('timePreDinner').value || null,
            insulinRapid: document.getElementById('insulinRapidPreDinner').value !== '' ? parseInt(document.getElementById('insulinRapidPreDinner').value) : null,
            carb: document.getElementById('carbDinner').value !== '' ? parseInt(document.getElementById('carbDinner').value) : null, // الكارب للعشاء مع قبل العشاء
        },
        postDinner: {
            glucose: document.getElementById('glucosePostDinner').value !== '' ? parseInt(document.getElementById('glucosePostDinner').value) : null,
            time: document.getElementById('timePostDinner').value || null,
            insulinRapid: document.getElementById('insulinRapidPostDinner').value !== '' ? parseInt(document.getElementById('insulinRapidPostDinner').value) : null,
        },
        bedtime: {
            glucose: document.getElementById('glucoseBedtime').value !== '' ? parseInt(document.getElementById('glucoseBedtime').value) : null,
            time: document.getElementById('timeBedtime').value || null,
            insulinRapid: document.getElementById('insulinRapidBedtime').value !== '' ? parseInt(document.getElementById('insulinRapidBedtime').value) : null,
        },
        midnight: {
            glucose: document.getElementById('glucoseMidnight').value !== '' ? parseInt(document.getElementById('glucoseMidnight').value) : null,
            time: document.getElementById('timeMidnight').value || null,
            insulinRapid: document.getElementById('insulinRapidMidnight').value !== '' ? parseInt(document.getElementById('insulinRapidMidnight').value) : null,
        },
    };

    // التحقق مما إذا كان هناك أي بيانات تم إدخالها على الأقل (سكر أو أنسولين سريع أو كارب)
    const hasAnyMeasurement = Object.values(measurements).some(m => m.glucose !== null || m.insulinRapid !== null || m.time !== null || m.carb !== null);
    const hasSlowInsulin = insulinSlow !== '' || timeInsulinSlow !== ''; // التحقق من وجود الأنسولين البطيء أو وقته

    if (!hasAnyMeasurement && !hasSlowInsulin) {
        showStatusMessage('الرجاء إدخال قياس سكر أو جرعة أنسولين أو كمية كارب واحدة على الأقل.', 'error');
        return;
    }


    // إنشاء كائن يمثل الإدخال الجديد
    const newEntry = {
        id: Date.now(), // معرّف فريد لكل إدخال
        date: entryDate,
        measurements: measurements,
        insulinSlow: insulinSlow !== '' ? parseInt(insulinSlow) : null,
        timeInsulinSlow: timeInsulinSlow || null, // حفظ وقت الأنسولين البطيء
    };

    // جلب السجلات الموجودة من Local Storage
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // إضافة الإدخال الجديد إلى السجلات
    records.push(newEntry);

    // حفظ السجلات المحدثة في Local Storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    // ************ إضافة المنطق الجديد لردود الفعل ************
    let feedbackMessages = [];
    let allNormal = true; // لتتبع إذا كانت جميع القياسات طبيعية

    const glucoseMeasurements = {
        fasting: newEntry.measurements.fasting.glucose,
        postBreakfast: newEntry.measurements.postBreakfast.glucose,
        preLunch: newEntry.measurements.preLunch.glucose,
        postLunch: newEntry.measurements.postLunch.glucose,
        preDinner: newEntry.measurements.preDinner.glucose,
        postDinner: newEntry.measurements.postDinner.glucose,
        bedtime: newEntry.measurements.bedtime.glucose,
        midnight: newEntry.measurements.midnight.glucose,
    };

    const measurementLabels = {
        fasting: 'السكر الصائم',
        postBreakfast: 'السكر بعد الفطور',
        preLunch: 'السكر قبل الغداء',
        postLunch: 'السكر بعد الغداء',
        preDinner: 'السكر قبل العشاء',
        postDinner: 'السكر بعد العشاء',
        bedtime: 'السكر قبل النوم',
        midnight: 'السكر في منتصف الليل',
    };

    for (const key in glucoseMeasurements) {
        const glucoseValue = glucoseMeasurements[key];
        if (glucoseValue !== null) {
            if (glucoseValue >= 70 && glucoseValue <= 140) {
                feedbackMessages.push(`قياس ${measurementLabels[key]} ممتاز! ${glucoseValue} 😍 بطل!`);
            } else {
                allNormal = false;
                if (glucoseValue < 70) {
                    feedbackMessages.push(`قياس ${measurementLabels[key]} منخفض: ${glucoseValue} ☹️ بس لا تقلق، المرة الجاية أحسن!`);
                } else { // glucoseValue > 140
                    feedbackMessages.push(`قياس ${measurementLabels[key]} مرتفع: ${glucoseValue} 😔 خليك ويانا، وتقدر تضبطه أحسن!`);
                }
            }
        }
    }

    let finalStatusMessage = 'تم حفظ القياسات بنجاح! ✅';
    let statusType = 'success'; // افتراضي

    if (feedbackMessages.length > 0) {
        finalStatusMessage = feedbackMessages.join('<br>'); // عرض كل الرسائل
        if (!allNormal) {
            statusType = 'warning'; // إذا كان هناك أي قياس خارج الطبيعي
        }
    }

    showStatusMessage(finalStatusMessage, statusType);
    // ************ نهاية إضافة المنطق الجديد ************

    // مسح الحقول بعد الحفظ
    clearFormFields();

    // تحديث عرض السجلات
    displayRecords();
}

// دالة لعرض رسائل الحالة
function showStatusMessage(message, type) {
    const statusMessageElement = document.getElementById('statusMessage');
    statusMessageElement.innerHTML = message; // استخدام innerHTML للسماح بالـ <br>
    statusMessageElement.className = `status-message ${type}`;
    statusMessageElement.style.display = 'block';

    setTimeout(() => {
        statusMessageElement.style.display = 'none';
    }, 5000); // إخفاء الرسالة بعد 5 ثوانٍ للسماح بالقراءة
}

// دالة لمسح حقول النموذج
function clearFormFields() {
    document.getElementById('glucoseFasting').value = '';
    document.getElementById('timeFasting').value = '';
    document.getElementById('insulinRapidFasting').value = '';
    document.getElementById('carbBreakfast').value = ''; // مسح حقل الكارب للفطور

    document.getElementById('glucosePostBreakfast').value = '';
    document.getElementById('timePostBreakfast').value = '';
    document.getElementById('insulinRapidPostBreakfast').value = '';

    document.getElementById('glucosePreLunch').value = '';
    document.getElementById('timePreLunch').value = '';
    document.getElementById('insulinRapidPreLunch').value = '';
    document.getElementById('carbLunch').value = ''; // مسح حقل الكارب للغداء

    document.getElementById('glucosePostLunch').value = '';
    document.getElementById('timePostLunch').value = '';
    document.getElementById('insulinRapidPostLunch').value = '';

    document.getElementById('glucosePreDinner').value = '';
    document.getElementById('timePreDinner').value = '';
    document.getElementById('insulinRapidPreDinner').value = '';
    document.getElementById('carbDinner').value = ''; // مسح حقل الكارب للعشاء

    document.getElementById('glucosePostDinner').value = '';
    document.getElementById('timePostDinner').value = '';
    document.getElementById('insulinRapidPostDinner').value = '';

    document.getElementById('glucoseBedtime').value = '';
    document.getElementById('timeBedtime').value = '';
    document.getElementById('insulinRapidBedtime').value = '';

    document.getElementById('glucoseMidnight').value = '';
    document.getElementById('timeMidnight').value = '';
    document.getElementById('insulinRapidMidnight').value = '';

    document.getElementById('insulinSlow').value = '';
    document.getElementById('timeInsulinSlow').value = ''; // مسح وقت الأنسولين البطيء

    // إعادة تعيين التاريخ والوقت الحاليين كقيم افتراضية بعد المسح
    const today = new Date();
    document.getElementById('entryDate').valueAsDate = today;
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    document.getElementById('timeFasting').value = currentTime;
    document.getElementById('timePostBreakfast').value = currentTime;
    document.getElementById('timePreLunch').value = currentTime;
    document.getElementById('timePostLunch').value = currentTime;
    document.getElementById('timePreDinner').value = currentTime;
    document.getElementById('timePostDinner').value = currentTime;
    document.getElementById('timeBedtime').value = currentTime;
    document.getElementById('timeMidnight').value = currentTime;
    document.getElementById('timeInsulinSlow').value = currentTime; // إعادة تعيين وقت الأنسولين البطيء
}


// دالة لعرض السجلات المحفوظة في جدول
function displayRecords() {
    const recordsContainer = document.getElementById('mealHistoryContainer');
    recordsContainer.innerHTML = ''; // مسح المحتوى الحالي

    const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (records.length === 0) {
        recordsContainer.innerHTML = '<p>لا توجد قياسات مسجلة حتى الآن.</p>';
        return;
    }

    // فرز السجلات من الأحدث إلى الأقدم بناءً على التاريخ العام
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    // إنشاء الجدول
    const table = document.createElement('table');
    table.className = 'meal-history-table';

    // إنشاء رأس الجدول
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
        "التاريخ", "النوع", "وقت القياس", "السكر (ملغ/دل)",
        "أنسولين سريع (وحدة)", "الكارب (غرام)", "أنسولين بطيء (وحدة)",
        "وقت الأنسولين البطيء", "إجراء"
    ];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // إنشاء جسم الجدول
    const tbody = document.createElement('tbody');

    const measurementLabels = {
        fasting: 'صائم',
        postBreakfast: 'بعد الفطور',
        preLunch: 'قبل الغداء',
        postLunch: 'بعد الغداء',
        preDinner: 'قبل العشاء',
        postDinner: 'بعد العشاء',
        bedtime: 'قبل النوم',
        midnight: 'منتصف الليل'
    };

    records.forEach(record => {
        // صفوف القياسات اليومية
        const dailyMeasurementsKeys = [
            'fasting', 'postBreakfast', 'preLunch', 'postLunch',
            'preDinner', 'postDinner', 'bedtime', 'midnight'
        ];

        let isFirstRowForDate = true; // لدمج خلايا التاريخ والأنسولين البطيء

        // تصفية القياسات الموجودة فقط لليوم
        const existingMeasurementsForDay = dailyMeasurementsKeys.filter(k => {
            const meas = record.measurements[k];
            // إضافة شرط للوقت فقط إذا لم يكن هناك قياسات أخرى
            return (meas && (meas.glucose !== null || meas.insulinRapid !== null || meas.time !== null || meas.carb !== null));
        });

        // إذا لم يكن هناك أي قياسات وجبة ولكن يوجد أنسولين بطيء، أضف صفاً واحداً
        if (existingMeasurementsForDay.length === 0 && (record.insulinSlow !== null || record.timeInsulinSlow !== null)) {
            const tr = document.createElement('tr');

            const tdDate = document.createElement('td');
            tdDate.textContent = record.date;
            tdDate.rowSpan = 1; // فقط صف واحد للأنسولين البطيء
            tr.appendChild(tdDate);

            const tdType = document.createElement('td');
            tdType.textContent = 'أنسولين بطيء'; // تحديد النوع ليمثل الأنسولين البطيء فقط
            tr.appendChild(tdType);

            // خلايا فارغة للقياسات غير الموجودة
            const emptyCells = ["", "", "", ""]; // وقت القياس، سكر، أنسولين سريع، كارب
            emptyCells.forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                tr.appendChild(td);
            });

            const tdInsulinSlow = document.createElement('td');
            tdInsulinSlow.textContent = record.insulinSlow !== null ? record.insulinSlow : '';
            tr.appendChild(tdInsulinSlow);

            const tdTimeInsulinSlow = document.createElement('td');
            tdTimeInsulinSlow.textContent = record.timeInsulinSlow || '';
            tr.appendChild(tdTimeInsulinSlow);

            // خلية زر الحذف
            const tdActions = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-record-button';
            deleteButton.textContent = 'حذف 🗑️';
            deleteButton.onclick = () => deleteRecord(record.id);
            tdActions.appendChild(deleteButton);
            tr.appendChild(tdActions);

            tbody.appendChild(tr);

        } else {
            // إذا كان هناك قياسات وجبات
            existingMeasurementsForDay.forEach(key => {
                const m = record.measurements[key];
                const tr = document.createElement('tr');

                // خلية التاريخ
                if (isFirstRowForDate) {
                    const tdDate = document.createElement('td');
                    tdDate.textContent = record.date;
                    tdDate.rowSpan = existingMeasurementsForDay.length;
                    tr.appendChild(tdDate);
                }

                // خلية نوع القياس (صائم، بعد الفطور، إلخ)
                const tdType = document.createElement('td');
                tdType.textContent = measurementLabels[key];
                tr.appendChild(tdType);

                // وقت القياس
                const tdTime = document.createElement('td');
                tdTime.textContent = m.time || '';
                tr.appendChild(tdTime);

                // السكر
                const tdGlucose = document.createElement('td');
                tdGlucose.textContent = m.glucose !== null ? m.glucose : '';
                tr.appendChild(tdGlucose);

                // أنسولين سريع
                const tdInsulinRapid = document.createElement('td');
                tdInsulinRapid.textContent = m.insulinRapid !== null ? m.insulinRapid : '';
                tr.appendChild(tdInsulinRapid);

                // الكارب
                const tdCarb = document.createElement('td');
                tdCarb.textContent = m.carb !== null ? m.carb : '';
                tr.appendChild(tdCarb);

                // خلية الأنسولين البطيء (تظهر مرة واحدة فقط في أول صف لليوم)
                if (isFirstRowForDate) {
                    const tdInsulinSlow = document.createElement('td');
                    tdInsulinSlow.textContent = record.insulinSlow !== null ? record.insulinSlow : '';
                    tdInsulinSlow.rowSpan = existingMeasurementsForDay.length;
                    tr.appendChild(tdInsulinSlow);

                    const tdTimeInsulinSlow = document.createElement('td');
                    tdTimeInsulinSlow.textContent = record.timeInsulinSlow || '';
                    tdTimeInsulinSlow.rowSpan = existingMeasurementsForDay.length;
                    tr.appendChild(tdTimeInsulinSlow);

                    // خلية زر الحذف (تظهر مرة واحدة فقط في أول صف لليوم)
                    const tdActions = document.createElement('td');
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-record-button';
                    deleteButton.textContent = 'حذف 🗑️';
                    deleteButton.onclick = () => deleteRecord(record.id);
                    tdActions.appendChild(deleteButton);
                    tdActions.rowSpan = existingMeasurementsForDay.length;
                    tr.appendChild(tdActions);
                }

                tbody.appendChild(tr);
                isFirstRowForDate = false;
            });
        }
    });

    table.appendChild(tbody);
    recordsContainer.appendChild(table);
}


// دالة لحذف سجل معين
function deleteRecord(idToDelete) {
    let records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    records = records.filter(record => record.id !== idToDelete);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    displayRecords(); // تحديث العرض بعد الحذف
    showStatusMessage('تم حذف السجل بنجاح. ✅', 'success');
}

// دالة لمسح كل السجلات (تفتح نافذة تأكيد)
function clearMealHistory() {
    openModal();
}

// دالة لتأكيد مسح كل السجلات
function confirmClear() {
    localStorage.removeItem(STORAGE_KEY);
    displayRecords(); // تحديث العرض بعد المسح
    showStatusMessage('تم مسح جميع السجلات بنجاح! 🗑️', 'success');
    closeModal();
}

// وظائف لإدارة نافذة التأكيد (Modal)
const modal = document.getElementById('deleteConfirmationModal');
const closeButton = document.querySelector('.modal .close-button');
const confirmButton = document.querySelector('.modal .confirm-delete-button');
const cancelButton = document.querySelector('.modal .cancel-delete-button');

// إضافة مستمعي الأحداث للأزرار
if (closeButton) closeButton.onclick = closeModal;
if (confirmButton) confirmButton.onclick = confirmClear;
if (cancelButton) cancelButton.onclick = closeModal;

function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

// إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// دالة لتصدير البيانات إلى ملف CSV (Excel)
function exportToCsv() {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (records.length === 0) {
        showStatusMessage('لا توجد بيانات لتصديرها.', 'error');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,%EF%BB%BF"; // BOM for UTF-8 in Excel
    const headers = [
        "التاريخ",
        "أنسولين بطيء (وحدة)", "وقت أنسولين بطيء",
        "سكر صائم (ملغ/دل)", "وقت صائم", "أنسولين سريع صائم (وحدة)", "كارب الفطور (غرام)",
        "سكر بعد الفطور بساعتين (ملغ/دل)", "وقت بعد الفطور بساعتين", "أنسولين سريع بعد الفطور بساعتين (وحدة)",
        "سكر قبل الغداء (ملغ/دل)", "وقت قبل الغداء", "أنسولين سريع قبل الغداء (وحدة)", "كارب الغداء (غرام)",
        "سكر بعد الغداء بساعتين (ملغ/دل)", "وقت بعد الغداء بساعتين", "أنسولين سريع بعد الغداء بساعتين (وحدة)",
        "سكر قبل العشاء (ملغ/دل)", "وقت قبل العشاء", "أنسولين سريع قبل العشاء (وحدة)", "كارب العشاء (غرام)",
        "سكر بعد العشاء بساعتين (ملغ/دل)", "وقت بعد العشاء بساعتين", "أنسولين سريع بعد العشاء بساعتين (وحدة)",
        "سكر قبل النوم (ملغ/دل)", "وقت قبل النوم", "أنسولين سريع قبل النوم (وحدة)",
        "سكر منتصف الليل (ملغ/دل)", "وقت منتصف الليل", "أنسولين سريع منتصف الليل (وحدة)"
    ];
    csvContent += headers.join(',') + "\n";

    records.forEach(record => {
        const row = [];
        row.push(record.date || '');
        row.push(record.insulinSlow !== null ? record.insulinSlow : '');
        row.push(record.timeInsulinSlow || '');

        // استخراج بيانات القياسات بضمان وجود الكائنات
        const mFasting = record.measurements.fasting || {};
        const mPostBreakfast = record.measurements.postBreakfast || {};
        const mPreLunch = record.measurements.preLunch || {};
        const mPostLunch = record.measurements.postLunch || {};
        const mPreDinner = record.measurements.preDinner || {};
        const mPostDinner = record.measurements.postDinner || {};
        const mBedtime = record.measurements.bedtime || {};
        const mMidnight = record.measurements.midnight || {};

        // دفع البيانات لكل نقطة قياس بترتيب ثابت ومطابق لرؤوس الأعمدة
        // صائم
        row.push(mFasting.glucose !== null ? mFasting.glucose : '');
        row.push(mFasting.time || '');
        row.push(mFasting.insulinRapid !== null ? mFasting.insulinRapid : '');
        row.push(mFasting.carb !== null ? mFasting.carb : ''); // كارب الفطور

        // بعد الفطور
        row.push(mPostBreakfast.glucose !== null ? mPostBreakfast.glucose : '');
        row.push(mPostBreakfast.time || '');
        row.push(mPostBreakfast.insulinRapid !== null ? mPostBreakfast.insulinRapid : '');

        // قبل الغداء
        row.push(mPreLunch.glucose !== null ? mPreLunch.glucose : '');
        row.push(mPreLunch.time || '');
        row.push(mPreLunch.insulinRapid !== null ? mPreLunch.insulinRapid : '');
        row.push(mPreLunch.carb !== null ? mPreLunch.carb : ''); // كارب الغداء

        // بعد الغداء
        row.push(mPostLunch.glucose !== null ? mPostLunch.glucose : '');
        row.push(mPostLunch.time || '');
        row.push(mPostLunch.insulinRapid !== null ? mPostLunch.insulinRapid : '');

        // قبل العشاء
        row.push(mPreDinner.glucose !== null ? mPreDinner.glucose : '');
        row.push(mPreDinner.time || '');
        row.push(mPreDinner.insulinRapid !== null ? mPreDinner.insulinRapid : '');
        row.push(mPreDinner.carb !== null ? mPreDinner.carb : ''); // كارب العشاء

        // بعد العشاء
        row.push(mPostDinner.glucose !== null ? mPostDinner.glucose : '');
        row.push(mPostDinner.time || '');
        row.push(mPostDinner.insulinRapid !== null ? mPostDinner.insulinRapid : '');

        // قبل النوم
        row.push(mBedtime.glucose !== null ? mBedtime.glucose : '');
        row.push(mBedtime.time || '');
        row.push(mBedtime.insulinRapid !== null ? mBedtime.insulinRapid : '');

        // منتصف الليل
        row.push(mMidnight.glucose !== null ? mMidnight.glucose : '');
        row.push(mMidnight.time || '');
        row.push(mMidnight.insulinRapid !== null ? mMidnight.insulinRapid : '');

        csvContent += row.map(item => `"${String(item).replace(/"/g, '""')}"`).join(',') + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "سجل_السكري.csv"); // تغيير اسم الملف ليكون بالعربية
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatusMessage('تم تصدير البيانات إلى ملف Excel بنجاح! 📊', 'success');
}

// دالة لتصدير البيانات إلى ملف PDF
async function exportToPdf() {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (records.length === 0) {
        showStatusMessage('لا توجد بيانات لتصديرها.', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ************* هنا تم تفعيل الخط العربي في PDF *************
    // بناءً على الملف الذي أرسلته (Cairo-Black-normal.js)، سنستخدم "Cairo-Black" كاسم للخط.
    doc.addFont('Cairo-Black-normal.js', 'Cairo-Black', 'normal'); // المسار النسبي للملف، اسم الخط الذي ستستخدمه في jsPDF، النمط
    doc.setFont('Cairo-Black'); // تعيين الخط الافتراضي للمستند
    // ************************************************************


    // عنوان المستند واسم الكروب
    doc.setFontSize(16);
    doc.text('سجل قياسات السكري اليومية', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('كروب أطفال السكري النوع الأول في العراق IQ 🇮🇶', 105, 27, { align: 'center' });

    // رؤوس الجدول
    const head = [[
        "التاريخ",
        "النوع",
        "وقت القياس",
        "السكر\n(ملغ/دل)",
        "أنسولين سريع\n(وحدة)",
        "الكارب\n(غرام)",
        "أنسولين بطيء\n(وحدة)",
        "وقت\nالبطيء"
    ]];

    // جسم الجدول
    const body = [];
    const measurementLabels = {
        fasting: 'صائم',
        postBreakfast: 'بعد الفطور',
        preLunch: 'قبل الغداء',
        postLunch: 'بعد الغداء',
        preDinner: 'قبل العشاء',
        postDinner: 'بعد العشاء',
        bedtime: 'قبل النوم',
        midnight: 'منتصف الليل'
    };

    records.forEach(record => {
        const dailyMeasurementsKeys = [
            'fasting', 'postBreakfast', 'preLunch', 'postLunch',
            'preDinner', 'postDinner', 'bedtime', 'midnight'
        ];

        let hasAnyMeasurementForDay = false;
        // Check if there's any actual data for the day
        for (const key of dailyMeasurementsKeys) {
            const m = record.measurements[key];
            if (m && (m.glucose !== null || m.insulinRapid !== null || m.time !== null || m.carb !== null)) {
                hasAnyMeasurementForDay = true;
                break;
            }
        }
        if (record.insulinSlow !== null || record.timeInsulinSlow !== null) {
            hasAnyMeasurementForDay = true;
        }

        if (!hasAnyMeasurementForDay) {
            return; // Skip if no data for the day
        }

        const existingMeasurementsForDay = dailyMeasurementsKeys.filter(k => {
            const meas = record.measurements[k];
            return (meas && (meas.glucose !== null || meas.insulinRapid !== null || meas.time !== null || meas.carb !== null));
        });

        let numRowsForDay = existingMeasurementsForDay.length;
        if (numRowsForDay === 0 && (record.insulinSlow !== null || record.timeInsulinSlow !== null)) {
            // Case where only slow insulin is recorded for the day, and no meal measurements
            body.push([
                { content: record.date || '', rowSpan: 1 },
                'أنسولين بطيء', // Indicate this row is for slow insulin
                '', // No specific time for meal
                '', // No glucose
                '', // No rapid insulin
                '', // No carb
                record.insulinSlow !== null ? record.insulinSlow : '',
                record.timeInsulinSlow || ''
            ]);
        } else {
            // Case where meal measurements exist (and potentially slow insulin)
            existingMeasurementsForDay.forEach((key, index) => {
                const m = record.measurements[key];
                const isFirstMeasurementRow = (index === 0);

                const row = [
                    isFirstMeasurementRow ? { content: record.date || '', rowSpan: numRowsForDay } : '',
                    measurementLabels[key],
                    m.time || '',
                    m.glucose !== null ? m.glucose : '',
                    m.insulinRapid !== null ? m.insulinRapid : '',
                    m.carb !== null ? m.carb : '',
                    isFirstMeasurementRow ? (record.insulinSlow !== null ? record.insulinSlow : '') : '',
                    isFirstMeasurementRow ? (record.timeInsulinSlow || '') : ''
                ];
                body.push(row);
            });
        }
    });


    // إعدادات الجدول التلقائي
    doc.autoTable({
        head: head,
        body: body,
        startY: 35, // بدء الجدول بعد العنوان
        theme: 'striped', // نمط الجدول (striped, grid, plain)
        headStyles: { fillColor: [0, 123, 255], textColor: 255, fontStyle: 'bold', halign: 'center' }, // رؤوس زرقاء
        styles: {
            font: 'Cairo-Black', // *** تأكد من استخدام نفس اسم الخط المعرف أعلاه ***
            fontStyle: 'normal',
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            halign: 'right', // محاذاة النص لليمين داخل الخلايا
            cellWidth: 'auto',
            minCellHeight: 8 // For better spacing
        },
        columnStyles: {
            0: { halign: 'center' }, // التاريخ في الوسط
            1: { halign: 'right' }, // النوع لليمين
            2: { halign: 'center' }, // وقت القياس في الوسط
            3: { halign: 'center' }, // السكر في الوسط
            4: { halign: 'center' }, // الأنسولين سريع في الوسط
            5: { halign: 'center' }, // الكارب في الوسط
            6: { halign: 'center' }, // الأنسولين بطيء في الوسط
            7: { halign: 'center' }, // وقت البطيء في الوسط
        },
        didDrawPage: function (data) {
            // إضافة التذييل في كل صفحة
            doc.setFontSize(8);
            doc.text('صفحة ' + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
            doc.text('ملاحظة: البيانات المدخلة في التطبيق لأغراض المتابعة وليست بديلاً عن استشارة الطبيب.', doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
        }
    });

    doc.save('سجل_السكري_المنظم.pdf');
    showStatusMessage('تم تصدير البيانات إلى ملف PDF منظم بنجاح! 📄', 'success');
}