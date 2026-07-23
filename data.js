// ⚠️ مهم جدا: بدّل هذا الرابط برابط Firebase الخاص بيك (شوف خطوات الإعداد)
// لازم يكون شكل الرابط هكذا وينتهي بـ /mydress.json
const FIREBASE_URL = 'https://PASTE-YOUR-PROJECT-default-rtdb.firebaseio.com/mydress.json';
/* ============ بيانات الموقع - النسخة السحابية (Firebase) ============ */

const DEFAULT_DATA = {
  auth: { email: 'admin@mydress.com', password: 'admin123' },
  colors: { wine: '#6b1e2f', cream: '#f6efe6', gold: '#c6a15b', ink: '#2b2320', blush: '#ecdfd5' },
  texts: {
    heroTitle: 'فستانك… لمناسبتك',
    heroSubtitle: 'كراء وشراء أرقى الفساتين',
    footerText: 'My Dress © 2026 — كراء وشراء الفساتين'
  },
  categories: ['أعراس', 'سهرة', 'كاجوال', 'حفلات'],
  products: [
    { id: 1, name: 'فستان زفاف أبيض', img: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500', category: 'أعراس', rentPrice: 15000, buyPrice: 60000, desc: 'فستان زفاف أنيق بتصميم كلاسيكي' },
    { id: 2, name: 'فستان سهرة أحمر', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500', category: 'سهرة', rentPrice: 8000, buyPrice: 25000, desc: 'فستان سهرة بلون أحمر جذاب' },
    { id: 3, name: 'فستان كاجوال', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', category: 'كاجوال', rentPrice: 0, buyPrice: 3500, desc: 'فستان يومي مريح وبسيط' },
    { id: 4, name: 'فستان حفلة ذهبي', img: 'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=500', category: 'حفلات', rentPrice: 9000, buyPrice: 30000, desc: 'فستان لامع بلون ذهبي' }
  ],
  wilayas: [
    {name:'أدرار',delivery:700},{name:'الشلف',delivery:700},{name:'الأغواط',delivery:700},{name:'أم البواقي',delivery:700},
    {name:'باتنة',delivery:700},{name:'بجاية',delivery:700},{name:'بسكرة',delivery:700},{name:'بشار',delivery:700},
    {name:'البليدة',delivery:700},{name:'البويرة',delivery:700},{name:'تمنراست',delivery:700},{name:'تبسة',delivery:700},
    {name:'تلمسان',delivery:700},{name:'تيارت',delivery:700},{name:'تيزي وزو',delivery:700},{name:'الجزائر',delivery:700},
    {name:'الجلفة',delivery:700},{name:'جيجل',delivery:700},{name:'سطيف',delivery:700},{name:'سعيدة',delivery:700},
    {name:'سكيكدة',delivery:700},{name:'سيدي بلعباس',delivery:700},{name:'عنابة',delivery:700},{name:'قالمة',delivery:700},
    {name:'قسنطينة',delivery:700},{name:'المدية',delivery:700},{name:'مستغانم',delivery:700},{name:'المسيلة',delivery:700},
    {name:'معسكر',delivery:700},{name:'ورقلة',delivery:700},{name:'وهران',delivery:700},{name:'البيض',delivery:700},
    {name:'إليزي',delivery:700},{name:'برج بوعريريج',delivery:700},{name:'بومرداس',delivery:700},{name:'الطارف',delivery:700},
    {name:'تندوف',delivery:700},{name:'تيسمسيلت',delivery:700},{name:'الوادي',delivery:700},{name:'خنشلة',delivery:700},
    {name:'سوق أهراس',delivery:700},{name:'تيبازة',delivery:700},{name:'ميلة',delivery:700},{name:'عين الدفلى',delivery:700},
    {name:'النعامة',delivery:700},{name:'عين تموشنت',delivery:700},{name:'غرداية',delivery:700},{name:'غليزان',delivery:700},
    {name:'تيميمون',delivery:700},{name:'برج باجي مختار',delivery:700},{name:'أولاد جلال',delivery:700},
    {name:'بني عباس',delivery:700},{name:'عين صالح',delivery:700},{name:'عين قزام',delivery:700},
    {name:'تقرت',delivery:700},{name:'جانت',delivery:700},{name:'المغير',delivery:700},{name:'المنيعة',delivery:700}
  ],
  paymentMethods: ['الدفع عند الاستلام', 'بطاقة بنكية', 'تحويل بريدي (CCP)'],
  emailjs: { publicKey: '', serviceId: '', templateId: '' }
};

function loadData() {
  return new Promise((resolve) => {
    fetch(FIREBASE_URL)
      .then(r => r.json())
      .then(data => {
        if (data && data.auth) {
          localStorage.setItem('myDressData_cache', JSON.stringify(data));
          resolve(data);
          return;
        }
        throw new Error('empty');
      })
      .catch(() => {
        const raw = localStorage.getItem('myDressData_cache');
        if (raw) {
          try { resolve(JSON.parse(raw)); return; } catch(e){}
        }
        const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
        resolve(fresh);
      });
  });
}

function saveData(data) {
  return new Promise((resolve) => {
    localStorage.setItem('myDressData_cache', JSON.stringify(data));
    fetch(FIREBASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r => resolve(r.ok))
    .catch(() => resolve(false));
  });
}

function applyColors(colors) {
  const root = document.documentElement.style;
  root.setProperty('--wine', colors.wine);
  root.setProperty('--cream', colors.cream);
  root.setProperty('--gold', colors.gold);
  root.setProperty('--ink', colors.ink);
  root.setProperty('--blush', colors.blush);
}