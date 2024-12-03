import axios from 'axios';

const API_KEY = 'AIzaSyCYbiv7ztLES2XI3RKhc4cFBWPBaLDtQ_s';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const analyzeIdeas = async (ideas) => {
  try {
    if (!ideas || ideas.length === 0) {
      throw new Error('لا توجد أفكار للتحليل');
    }

    const prompt = `تحليل الأفكار التالية وتقديم اقتراحات لتحسينها وتصنيفها:
      ${ideas.join('\n')}
      
      الرجاء تقديم:
      1. تصنيف لكل فكرة (تقنية، اجتماعية، اقتصادية، إلخ)
      2. اقتراحات لتحسين كل فكرة
      3. أفكار جديدة مرتبطة بالأفكار الحالية
      
      قم بتنسيق الإجابة بشكل منظم ومرتب.`;

    const response = await axios({
      method: 'post',
      url: `${API_URL}?key=${API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }
    });

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('لم نتمكن من تحليل الأفكار. حاول مرة أخرى');
    }

    return {
      success: true,
      analysis: response.data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    console.error('Error analyzing ideas:', error);
    let errorMessage = 'حدث خطأ أثناء تحليل الأفكار';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = 'خطأ في مفتاح API. الرجاء التحقق من صحة المفتاح';
          break;
        case 429:
          errorMessage = 'تم تجاوز حد الطلبات المسموح به. حاول مرة أخرى لاحقاً';
          break;
        case 400:
          errorMessage = 'طلب غير صالح. تأكد من صحة البيانات المدخلة';
          break;
        default:
          errorMessage = 'حدث خطأ في الاتصال بالخدمة. حاول مرة أخرى لاحقاً';
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

export const suggestNextIdea = async (currentIdea) => {
  try {
    if (!currentIdea) {
      throw new Error('لم يتم تحديد فكرة للتحليل');
    }

    console.log('Suggesting next idea for:', currentIdea);

    const prompt = `بناءً على الفكرة التالية: "${currentIdea}"
    اقترح فكرة جديدة مرتبطة بها ومكملة لها. 
    قدم الفكرة بشكل مختصر ومباشر في سطر واحد فقط.`;

    const response = await axios({
      method: 'post',
      url: `${API_URL}?key=${API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }
    });

    console.log('API Response:', response.data);

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('لم نتمكن من اقتراح فكرة جديدة');
    }

    const suggestion = response.data.candidates[0].content.parts[0].text.trim();
    console.log('Generated suggestion:', suggestion);

    return {
      success: true,
      suggestion
    };
  } catch (error) {
    console.error('Error suggesting next idea:', error);
    console.error('Error details:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'حدث خطأ أثناء اقتراح الفكرة التالية'
    };
  }
};

export const suggestCompletion = async (currentText) => {
  try {
    if (!currentText) {
      return { success: false, error: 'لا يوجد نص للإكمال' };
    }

    const prompt = `أكمل الجملة التالية بكلمة أو كلمتين مناسبتين:
    "${currentText}"
    قم بإعطاء الإكمال فقط دون أي نص إضافي.`;

    const response = await axios({
      method: 'post',
      url: `${API_URL}?key=${API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }
    });

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('لم نتمكن من اقتراح إكمال');
    }

    const completion = response.data.candidates[0].content.parts[0].text
      .trim()
      .replace(/^["']|["']$/g, ''); // إزالة علامات التنصيص إن وجدت

    return {
      success: true,
      completion
    };
  } catch (error) {
    console.error('Error suggesting completion:', error);
    return {
      success: false,
      error: error.message || 'حدث خطأ أثناء اقتراح الإكمال'
    };
  }
};
