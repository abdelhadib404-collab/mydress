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
    fillCreator();
    fillProducts();
    fillCategories();
    fillWilayas();
    fillPayments();
    fillAccount();
    fillEmailjs();
    fillCheckoutTexts();
    fillTemplates();
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

  /* ================= التعريف الشخصي (جديد) ================= */
  function fillCreator() {
    if (!siteData.creator) siteData.creator = { bio: '', img: '' };
    document.getElementById('creatorBioText').value = siteData.creator.bio || '';
    const prev = document.getElementById('creatorImgPreview');
    prev.innerHTML = siteData.creator.img ? `<img src="${siteData.creator.img}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">` : '';
  }

  let tempCreatorImg = '';
  document.getElementById('creatorImgFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        tempCreatorImg = ev.target.result;
        document.getElementById('creatorImgPreview').innerHTML = `<img src="${tempCreatorImg}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('saveCreator').addEventListener('click', async () => {
    if (!siteData.creator) siteData.creator = {};
    siteData.creator.bio = document.getElementById('creatorBioText').value;
    if (tempCreatorImg) siteData.creator.img = tempCreatorImg;
    await saveData(siteData);
    alert('تم حفظ التعريف الشخصي ✅');
  });

  /* ================= المنتجات + تصميم الكاردز ================= */
  const productList = document.getElementById('productList');

  function fillProducts() {
    productList.innerHTML = '';
    siteData.products.forEach(p => productList.appendChild(buildProductRow(p)));
    if (siteData.cardStyle) {
      document.getElementById('cardStylePreset').value = siteData.cardStyle;
    }
  }

  document.getElementById('cardStylePreset').addEventListener('change', async (e) => {
    siteData.cardStyle = e.target.value;
    await saveData(siteData);
  });

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
      <span>اسحب الصور أو اضغط للاختيار</span>
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

  /* ================= نصوص صفحة الدفع ================= */
  function fillCheckoutTexts() {
    if (!siteData.checkoutTexts) siteData.checkoutTexts = {};
    document.getElementById('checkoutTitle').value = siteData.checkoutTexts.title || '';
    document.getElementById('checkoutConfirmText').value = siteData.checkoutTexts.confirm || '';
    document.getElementById('checkoutInvoiceTitle').value = siteData.checkoutTexts.invoice || '';
    document.getElementById('checkoutSuccessMessage').value = siteData.checkoutTexts.success || '';
  }
  document.getElementById('saveCheckoutTexts').addEventListener('click', async () => {
    siteData.checkoutTexts = {
      title: document.getElementById('checkoutTitle').value,
      confirm: document.getElementById('checkoutConfirmText').value,
      invoice: document.getElementById('checkoutInvoiceTitle').value,
      success: document.getElementById('checkoutSuccessMessage').value
    };
    await saveData(siteData);
    alert('تم حفظ نصوص الدفع ✅');
  });

  /* ================= القوالب الجاهزة (جديد) ================= */
  function fillTemplates() {
    if (!siteData.templates) siteData.templates = [];
    const listEl = document.getElementById('savedTemplatesList');
    listEl.innerHTML = '';
    if (siteData.templates.length === 0) {
      listEl.innerHTML = '<p class="hint">لا توجد قوالب محفوظة حالياً.</p>';
      return;
    }
    siteData.templates.forEach((t, index) => {
      listEl.innerHTML += `
        <div class="wilaya-row">
          <span>${t.name}</span>
          <button class="add-btn" data-apply="${index}" style="padding:4px 10px;margin:0;">تفعيل القالب</button>
          <button data-del-template="${index}">✕</button>
        </div>`;
    });
  }

  document.getElementById('saveCurrentTemplateBtn').addEventListener('click', async () => {
    const name = document.getElementById('templateNameInput').value.trim();
    if (!name) return alert('الرجاء كتابة اسم القالب');
    if (!siteData.templates) siteData.templates = [];
    siteData.templates.push({
      name: name,
      colors: JSON.parse(JSON.stringify(siteData.colors)),
      cardStyle: siteData.cardStyle
    });
    await saveData(siteData);
    fillTemplates();
    document.getElementById('templateNameInput').value = '';
    alert('تم حفظ القالب بنجاح ✅');
  });

  document.getElementById('savedTemplatesList').addEventListener('click', async (e) => {
    if (e.target.dataset.apply !== undefined) {
      const idx = e.target.dataset.apply;
      const t = siteData.templates[idx];
      siteData.colors = JSON.parse(JSON.stringify(t.colors));
      siteData.cardStyle = t.cardStyle;
      await saveData(siteData);
      applyColors(siteData.colors);
      alert(`تم تطبيق القالب "${t.name}" بنجاح ✅`);
    } else if (e.target.dataset.delTemplate !== undefined) {
      const idx = e.target.dataset.delTemplate;
      siteData.templates.splice(idx, 1);
      await saveData(siteData);
      fillTemplates();
    }
  });

})();