// ثوابت للملف
const IDEAS_FILE_PATH = 'ideas.json';
const DELETED_IDEAS_FILE = 'deleted_ideas.json';
const fs = window.require('fs');
const path = window.require('path');

// ثوابت لحجم التخزين
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5 ميجابايت
const WARNING_THRESHOLD = 4 * 1024 * 1024; // 4 ميجابايت

// حساب الحجم الحالي للتخزين المحلي
export const getCurrentStorageSize = () => {
  let size = 0;
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stats = fs.statSync(file);
    size += stats.size;
  });
  return size;
};

// حساب حجم كائن JSON
export const getObjectSize = (obj) => {
  const str = JSON.stringify(obj);
  return str.length * 2; // تحويل إلى بايت
};

// التحقق من حجم التخزين قبل الحفظ
export const checkStorageSize = (newData) => {
  const currentSize = getCurrentStorageSize();
  const newDataSize = getObjectSize(newData);
  const totalSize = currentSize + newDataSize;

  if (totalSize > MAX_STORAGE_SIZE) {
    return {
      canSave: false,
      error: `لا يمكن الحفظ: حجم البيانات (${(totalSize / 1024 / 1024).toFixed(2)} ميجابايت) يتجاوز الحد الأقصى (${MAX_STORAGE_SIZE / 1024 / 1024} ميجابايت)`
    };
  }

  if (totalSize > WARNING_THRESHOLD) {
    return {
      canSave: true,
      warning: `تحذير: مساحة التخزين تقترب من الحد الأقصى (${(totalSize / 1024 / 1024).toFixed(2)}/${MAX_STORAGE_SIZE / 1024 / 1024} ميجابايت)`
    };
  }

  return { canSave: true };
};

export const saveToJson = async (nodes, edges, customTitle = '') => {
  try {
    let savedIdeas = [];
    if (fs.existsSync(IDEAS_FILE_PATH)) {
      const fileContent = fs.readFileSync(IDEAS_FILE_PATH, 'utf8');
      savedIdeas = JSON.parse(fileContent || '[]');
    }

    const defaultTitle = `مجموعة أفكار ${savedIdeas.length + 1}`;
    
    // حساب عدد الأفكار في المجموعة
    const ideaCount = nodes.length;
    
    const newIdeaSet = {
      nodes,
      edges,
      savedAt: new Date().toISOString(),
      title: customTitle || defaultTitle,
      ideaCount,
      lastModified: new Date().toISOString()
    };

    // فحص حجم البيانات قبل الحفظ
    const storageCheck = checkStorageSize(newIdeaSet);
    if (!storageCheck.canSave) {
      return { 
        success: false, 
        error: storageCheck.error,
        storageInfo: {
          currentSize: getCurrentStorageSize(),
          maxSize: MAX_STORAGE_SIZE
        }
      };
    }

    // البحث عن نسخة سابقة بنفس العنوان
    const existingIndex = savedIdeas.findIndex(idea => idea.title === newIdeaSet.title);
    
    if (existingIndex !== -1) {
      // تحديث النسخة الموجودة
      savedIdeas[existingIndex] = newIdeaSet;
    } else {
      // إضافة نسخة جديدة
      savedIdeas.push(newIdeaSet);
    }
    
    fs.writeFileSync(IDEAS_FILE_PATH, JSON.stringify(savedIdeas, null, 2));
    
    return { 
      success: true,
      warning: storageCheck.warning,
      storageInfo: {
        currentSize: getCurrentStorageSize(),
        maxSize: MAX_STORAGE_SIZE
      }
    };
  } catch (error) {
    console.error('Error saving data:', error);
    return { 
      success: false, 
      error: error.message,
      storageInfo: {
        currentSize: getCurrentStorageSize(),
        maxSize: MAX_STORAGE_SIZE
      }
    };
  }
};

export const loadFromJson = async () => {
  try {
    if (!fs.existsSync(IDEAS_FILE_PATH)) {
      return [];
    }
    
    const fileContent = fs.readFileSync(IDEAS_FILE_PATH, 'utf8');
    const ideas = JSON.parse(fileContent || '[]');
    
    // ترتيب الأفكار حسب آخر تعديل
    return ideas.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
  } catch (error) {
    console.error('Error loading data:', error);
    return [];
  }
};

export const deleteSavedIdea = async (index) => {
  try {
    const fileContent = fs.readFileSync(IDEAS_FILE_PATH, 'utf8');
    const savedIdeas = JSON.parse(fileContent || '[]');
    const deletedIdea = savedIdeas.splice(index, 1)[0];
    
    // حفظ الأفكار المتبقية
    fs.writeFileSync(IDEAS_FILE_PATH, JSON.stringify(savedIdeas, null, 2));
    
    // حفظ الفكرة المحذوفة في ملف منفصل
    fs.writeFileSync(DELETED_IDEAS_FILE, JSON.stringify(deletedIdea, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting data:', error);
    return { success: false, error: error.message };
  }
};

export const undoDelete = async () => {
  try {
    if (!fs.existsSync(DELETED_IDEAS_FILE)) {
      return { success: false, error: 'لا توجد أفكار محذوفة لاستعادتها' };
    }
    
    const deletedContent = fs.readFileSync(DELETED_IDEAS_FILE, 'utf8');
    const deletedIdea = JSON.parse(deletedContent);
    
    const fileContent = fs.readFileSync(IDEAS_FILE_PATH, 'utf8');
    const savedIdeas = JSON.parse(fileContent || '[]');
    savedIdeas.push(deletedIdea);
    
    // حفظ الأفكار مع الفكرة المستعادة
    fs.writeFileSync(IDEAS_FILE_PATH, JSON.stringify(savedIdeas, null, 2));
    // حذف ملف الأفكار المحذوفة
    fs.unlinkSync(DELETED_IDEAS_FILE);
    
    return { success: true };
  } catch (error) {
    console.error('Error undoing delete:', error);
    return { success: false, error: error.message };
  }
};
