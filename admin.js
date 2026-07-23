(async function() {
  let siteData = await loadData();

  /* ------ تسجيل الدخول ------ */
  const loginPage = document.getElementById('loginPage');
  const adminDashboard = document.getElementById('adminDashboard');

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (email === siteData.auth.email && password === siteData.auth.password) {
      loginPage.style.display = 'none';
      adminDashboard.style.display = 'block';
      fillAllPanels();
    } else {
      document.getElementById('loginError').textContent = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    adminDashboard.style.display = 'none';
    loginPage.style.display = 'flex';
    document.getElementById('loginForm').reset();
  });

  /* ------ التبويبات ------ */
  document.getElementById('adminTabs').addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab-btn')) return;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById('panel-' + e.target.dataset.tab).classList.add('active');
  });

  function fillAllPanels() {
    fillColors();
    fillTexts();
    fillProducts();
    fillCategories();
    fillWilayas();
    fillPayments();
    fillAccount();
    fillEmailjs();
  }

  /* ================= الألوان ================= */
  function fillColors() {
    document.getElementById('colorWine').value = siteData.colors.wine;
    document.getElementById('colorCream').value = siteData.colors.cream;
    document.getElementById('colorGold').value = siteData.colors.gold;
    document.getElementById('colorInk').value = siteData.colors.ink;
    document.getElementById('colorBlush').value = siteData.colors.blush;
  }
  document.getElementById('saveColors').addEventListener('click', async () => {
    siteData.colors = {
      wine: document.getElementById('colorWine').value,
      cream: document.getElementById('colorCream').value,
      gold: document.getElementById('colorGold').value,
      ink: document.getElementById('colorInk').value,
      blush: document.getElementById('colorBlush').value
    };
    await saveData(siteData);
    applyColors(siteData.colors);
    alert('تم حفظ الألوان ✅ وتم تطبيقها على الموقع');
  });

  /* ================= النصوص ================= */
  function fillTexts() {
    document.getElementById('textHeroTitle').value = siteData.texts.heroTitle;
    document.getElementById('textHeroSubtitle').value = siteData.texts.heroSubtitle;
    document.getElementById('textFooter').value = siteData.texts.footerText;
  }
  document.getElementById('saveTexts').addEventListener('click', async () => {
    siteData.texts = {
      heroTitle: document.getElementById('textHeroTitle').value,
      heroSubtitle: document.getElementById('textHeroSubtitle').value,
      footerText: document.getElementById('textFooter').value
    };
    await saveData(siteData);
    alert('تم حفظ النصوص ✅');
  });

  /* ================= المنتجات + رفع الصور من الجهاز ================= */
  const productList = document.getElementById('productList');

  function fillProducts() {
    productList.innerHTML = '';
    siteData.products.forEach(p => productList.appendChild(buildProductRow(p)));
  }

  // يبني صف صورة واحدة داخل معرض الصور (مع زر حذف)
  function buildImageThumb(gallery, src) {
    const thumb = document.createElement('div');
    thumb.className = 'img-thumb';
    thumb.innerHTML = `<img src="${src}"><button type="button" class="thumb-remove">✕</button>`;
    thumb.querySelector('.thumb-remove').addEventListener('click', () => thumb.remove());
    gallery.appendChild(thumb);
  }

  function buildProductRow(p) {
    const div = document.createElement('div');
    div.className = 'product-row';
    div.dataset.id = p.id;
    const images = (p.images && p.images.length) ? p.images : (p.img ? [p.img] : []);

    const imgBox = document.createElement('div');
    imgBox.className = 'img-upload-box';
    imgBox.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span>اسحب الصور أو اضغط للاختيار (يمكن اختيار أكثر من صورة)</span>
      <input type="file" accept="image/*" class="f-img-file" multiple>
      <div class="img-gallery"></div>
    `;

    const gallery = imgBox.querySelector('.img-gallery');
    images.forEach(src => buildImageThumb(gallery, src));

    imgBox.querySelector('.f-img-file').addEventListener('change', function(e) {
      const files = Array.from(e.target.files || []);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => buildImageThumb(gallery, ev.target.result);
        reader.readAsDataURL(file);
      });
      this.value = '';
    });

    div.innerHTML = `
      <button class="remove-row" data-remove="${p.id}">✕</button>
      <div class="full"><label>صور المنتج</label></div>
      <div class="full"><label>اسم المنتج</label><input type="text" class="f-name" value="${p.name}"></div>
      <div><label>الكاتيغوري</label>
        <select class="f-cat">${siteData.categories.map(c => `<option ${c === p.category ? 'selected' : ''}>${c}</option>`).join('')}</select>
      </div>
      <div><label>سعر الكراء (0 = غير متوفر)</label><input type="number" class="f-rent" value="${p.rentPrice}"></div>
      <div><label>سعر الشراء</label><input type="number" class="f-buy" value="${p.buyPrice}"></div>
      <div class="full"><label>الوصف</label><textarea class="f-desc" rows="2">${p.desc}</textarea></div>
    `;

    const labelDiv = div.querySelector('.full');
    if (labelDiv) labelDiv.after(imgBox);
    return div;
  }

  document.getElementById('addProduct').addEventListener('click', () => {
    const newP = { id: Date.now(), name: 'منتج جديد', images: [], category: siteData.categories[0] || '', rentPrice: 0, buyPrice: 0, desc: '' };
    siteData.products.push(newP);
    productList.appendChild(buildProductRow(newP));
  });

  productList.addEventListener('click', (e) => {
    if (e.target.dataset.remove) {
      const id = e.target.dataset.remove;
      siteData.products = siteData.products.filter(p => p.id != id);
      e.target.closest('.product-row').remove();
    }
  });

  document.getElementById('saveProducts').addEventListener('click', async () => {
    const rows = productList.querySelectorAll('.product-row');
    const updated = [];
    rows.forEach(row => {
      const imgs = Array.from(row.querySelectorAll('.img-gallery img')).map(im => im.src);
      updated.push({
        id: Number(row.dataset.id),
        name: row.querySelector('.f-name').value,
        category: row.querySelector('.f-cat').value,
        rentPrice: Number(row.querySelector('.f-rent').value) || 0,
        buyPrice: Number(row.querySelector('.f-buy').value) || 0,
        images: imgs,
        desc: row.querySelector('.f-desc').value
      });
    });
    siteData.products = updated;
    await saveData(siteData);
    alert('تم حفظ المنتجات ✅');
  });

  /* ================= الكاتيغوريس ================= */
  const categoryList = document.getElementById('categoryList');
  function fillCategories() {
    categoryList.innerHTML = '';
    siteData.categories.forEach(c => {
      categoryList.innerHTML += `<div class="tag-item">${c}<button data-cat="${c}">✕</button></div>`;
    });
  }
  categoryList.addEventListener('click', (e) => {
    if (e.target.dataset.cat) {
      siteData.categories = siteData.categories.filter(c => c !== e.target.dataset.cat);
      fillCategories();
    }
  });
  document.getElementById('addCategory').addEventListener('click', () => {
    const val = document.getElementById('newCategory').value.trim();
    if (val && !siteData.categories.includes(val)) {
      siteData.categories.push(val);
      fillCategories();
      document.getElementById('newCategory').value = '';
    }
  });
  document.getElementById('saveCategories').addEventListener('click', async () => {
    await saveData(siteData);
    alert('تم حفظ الكاتيغوريس ✅');
  });

  /* ================= الولايات والتوصيل ================= */
  const wilayaList = document.getElementById('wilayaList');
  function fillWilayas() {
    wilayaList.innerHTML = '';
    siteData.wilayas.forEach((w, i) => {
      wilayaList.innerHTML += `
        <div class="wilaya-row" data-index="${i}">
          <span>${w.name}</span>
          <input type="number" class="w-price" value="${w.delivery}">
          <button data-remove="${i}">✕</button>
        </div>`;
    });
  }
  wilayaList.addEventListener('input', (e) => {
    if (e.target.classList.contains('w-price')) {
      const i = e.target.closest('.wilaya-row').dataset.index;
      siteData.wilayas[i].delivery = Number(e.target.value) || 0;
    }
  });
  wilayaList.addEventListener('click', (e) => {
    if (e.target.dataset.remove !== undefined && e.target.dataset.remove !== '') {
      siteData.wilayas.splice(e.target.dataset.remove, 1);
      fillWilayas();
    }
  });
  document.getElementById('addWilaya').addEventListener('click', () => {
    const name = document.getElementById('newWilayaName').value.trim();
    const price = Number(document.getElementById('newWilayaPrice').value) || 0;
    if (name) {
      siteData.wilayas.push({ name, delivery: price });
      fillWilayas();
      document.getElementById('newWilayaName').value = '';
      document.getElementById('newWilayaPrice').value = '';
    }
  });
  document.getElementById('saveWilayas').addEventListener('click', async () => {
    await saveData(siteData);
    alert('تم حفظ الولايات وأسعار التوصيل ✅');
  });

  /* ================= طرق الدفع ================= */
  const paymentList = document.getElementById('paymentList');
  function fillPayments() {
    paymentList.innerHTML = '';
    siteData.paymentMethods.forEach(pm => {
      paymentList.innerHTML += `<div class="tag-item">${pm}<button data-pm="${pm}">✕</button></div>`;
    });
  }
  paymentList.addEventListener('click', (e) => {
    if (e.target.dataset.pm) {
      siteData.paymentMethods = siteData.paymentMethods.filter(p => p !== e.target.dataset.pm);
      fillPayments();
    }
  });
  document.getElementById('addPayment').addEventListener('click', () => {
    const val = document.getElementById('newPayment').value.trim();
    if (val && !siteData.paymentMethods.includes(val)) {
      siteData.paymentMethods.push(val);
      fillPayments();
      document.getElementById('newPayment').value = '';
    }
  });
  document.getElementById('savePayments').addEventListener('click', async () => {
    await saveData(siteData);
    alert('تم حفظ طرق الدفع ✅');
  });

  /* ================= معلومات الدخول ================= */
  function fillAccount() {
    document.getElementById('accountEmail').value = siteData.auth.email;
    document.getElementById('accountPassword').value = '';
  }
  document.getElementById('saveAccount').addEventListener('click', async () => {
    const email = document.getElementById('accountEmail').value.trim();
    const password = document.getElementById('accountPassword').value;
    if (email) siteData.auth.email = email;
    if (password) siteData.auth.password = password;
    await saveData(siteData);
    alert('تم حفظ معلومات الدخول ✅');
  });

  /* ================= EmailJS ================= */
  function fillEmailjs() {
    document.getElementById('emailPublicKey').value = siteData.emailjs.publicKey;
    document.getElementById('emailServiceId').value = siteData.emailjs.serviceId;
    document.getElementById('emailTemplateId').value = siteData.emailjs.templateId;
  }
  document.getElementById('saveEmailjs').addEventListener('click', async () => {
    siteData.emailjs = {
      publicKey: document.getElementById('emailPublicKey').value.trim(),
      serviceId: document.getElementById('emailServiceId').value.trim(),
      templateId: document.getElementById('emailTemplateId').value.trim()
    };
    await saveData(siteData);
    alert('تم حفظ إعدادات EmailJS ✅');
  });

})();