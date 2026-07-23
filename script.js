(async function() {
  const siteData = await loadData();
  applyColors(siteData.colors);

  /* ------ النصوص ------ */
  document.getElementById('heroTitle').textContent = siteData.texts.heroTitle;
  document.getElementById('heroSubtitle').textContent = siteData.texts.heroSubtitle;
  document.getElementById('footerText').textContent = siteData.texts.footerText;

  /* ------ زر السهم في الهيرو ------ */
  document.getElementById('scrollBtn').addEventListener('click', () => {
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
  });

  /* ------ الكاتيغوري: قائمة منسدلة ------ */
  const catDropdown = document.getElementById('catDropdown');
  const catToggle = document.getElementById('catToggle');
  const catList = document.getElementById('catList');
  catList.innerHTML = '';
  siteData.categories.forEach(cat => {
    catList.innerHTML += `<li data-cat="${cat}">${cat}</li>`;
  });
  catToggle.addEventListener('click', () => catDropdown.classList.toggle('open'));
  catList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
      catToggle.querySelector('span').textContent = e.target.dataset.cat;
      catDropdown.classList.remove('open');
      renderProducts(e.target.dataset.cat);
      document.getElementById('prodGrid').scrollIntoView({ behavior: 'smooth' });
    }
  });

  /* ------ عرض المنتجات ------ */
  const grid = document.getElementById('prodGrid');

  function priceLabel(p) {
    if (p.rentPrice > 0) return `${p.buyPrice} دج شراء / ${p.rentPrice} دج كراء`;
    return `${p.buyPrice} دج شراء`;
  }

  function renderProducts(filterCat) {
    const list = filterCat ? siteData.products.filter(p => p.category === filterCat) : siteData.products;
    grid.innerHTML = '';
    list.forEach(p => {
      grid.innerHTML += `
        <div class="prod-card" data-id="${p.id}">
          <div class="img-wrap">
            <img src="${p.img}" alt="${p.name}">
            <div class="hover-veil"><span>عرض التفاصيل</span></div>
          </div>
          <div class="prod-info">
            <h3>${p.name}</h3>
            <div class="price">${priceLabel(p)}</div>
            <button class="add-btn" data-id="${p.id}">أضف إلى السلة</button>
          </div>
        </div>`;
    });
  }
  renderProducts();

  /* ------ مودال تفاصيل المنتج ------ */
  const overlay = document.getElementById('overlay');
  const productModal = document.getElementById('productModal');
  let currentProduct = null;

  function openProductModal(id) {
    const p = siteData.products.find(x => x.id == id);
    if (!p) return;
    currentProduct = p;
    document.getElementById('modalImg').src = p.img;
    document.getElementById('modalName').textContent = p.name;
    document.getElementById('modalDesc').textContent = p.desc;
    document.getElementById('modalRent').textContent = p.rentPrice > 0 ? `كراء: ${p.rentPrice} دج` : 'غير متوفر للكراء';
    document.getElementById('modalBuy').textContent = `شراء: ${p.buyPrice} دج`;
    overlay.classList.add('show');
    productModal.classList.add('open');
  }
  function closeProductModal() {
    overlay.classList.remove('show');
    productModal.classList.remove('open');
  }
  document.getElementById('closeModal').addEventListener('click', closeProductModal);

  grid.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      addToCart(e.target.dataset.id);
    } else {
      const card = e.target.closest('.prod-card');
      if (card) openProductModal(card.dataset.id);
    }
  });
  document.getElementById('modalAddBtn').addEventListener('click', () => {
    if (currentProduct) addToCart(currentProduct.id);
    closeProductModal();
  });

  /* ------ منطق السلة ------ */
  let cart = [];
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const emptyMsg = document.getElementById('emptyMsg');

  function openCart() {
    cartPanel.classList.add('open');
    overlay.classList.add('show');
  }
  function closeCart() {
    cartPanel.classList.remove('open');
    overlay.classList.remove('show');
  }
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  overlay.addEventListener('click', () => {
    closeCart();
    closeProductModal();
    closeCheckout();
  });

  function addToCart(id) {
    const p = siteData.products.find(x => x.id == id);
    if (!p) return;
    cart.push(p);
    renderCart();
    openCart();
  }

  function renderCart() {
    cartCountEl.textContent = cart.length;
    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      cartItemsEl.appendChild(emptyMsg);
      return;
    }
    cart.forEach((p, i) => {
      cartItemsEl.innerHTML += `
        <div class="cart-item">
          <img src="${p.img}" alt="${p.name}">
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <span>${priceLabel(p)}</span>
          </div>
          <button data-index="${i}" class="remove-btn">✕</button>
        </div>`;
    });
  }
  cartItemsEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      cart.splice(e.target.dataset.index, 1);
      renderCart();
      updateInvoice();
    }
  });

  /* ------ صفحة إتمام الدفع ------ */
  const checkoutPage = document.getElementById('checkoutPage');

  function openCheckout() {
    closeCart();
    checkoutPage.classList.add('open');
    updateInvoice();
  }
  function closeCheckout() {
    checkoutPage.classList.remove('open');
  }
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('closeCheckout').addEventListener('click', closeCheckout);

  /* خانة البريد الإلكتروني */
  const hasEmail = document.getElementById('hasEmail');
  const emailField = document.getElementById('emailField');
  hasEmail.addEventListener('change', () => {
    emailField.classList.toggle('open', hasEmail.checked);
  });

  /* قائمة الولايات وطرق الدفع */
  const wilayaSelect = document.getElementById('wilaya');
  siteData.wilayas.forEach(w => {
    wilayaSelect.innerHTML += `<option value="${w.name}">${w.name}</option>`;
  });
  const paymentSelect = document.getElementById('paymentMethod');
  siteData.paymentMethods.forEach(pm => {
    paymentSelect.innerHTML += `<option value="${pm}">${pm}</option>`;
  });

  /* ------ الفاتورة ------ */
  function getMode() {
    return document.querySelector('input[name="mode"]:checked').value;
  }
  function getDeliveryPrice() {
    const w = siteData.wilayas.find(x => x.name === wilayaSelect.value);
    return w ? w.delivery : 0;
  }
  function updateInvoice() {
    const mode = getMode();
    const linesEl = document.getElementById('invoiceLines');
    linesEl.innerHTML = '';
    let productsTotal = 0;
    cart.forEach(p => {
      const price = (mode === 'rent' && p.rentPrice > 0) ? p.rentPrice : p.buyPrice;
      productsTotal += price;
      linesEl.innerHTML += `<div class="invoice-line"><span>${p.name}</span><span>${price} دج</span></div>`;
    });
    const delivery = getDeliveryPrice();
    document.getElementById('invMode').textContent = mode === 'rent' ? 'كراء' : 'شراء';
    document.getElementById('invProducts').textContent = productsTotal + ' دج';
    document.getElementById('invDelivery').textContent = delivery + ' دج';
    document.getElementById('invTotal').textContent = (productsTotal + delivery) + ' دج';
  }
  document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener('change', updateInvoice));
  wilayaSelect.addEventListener('change', updateInvoice);

  /* ------ إرسال الطلب (EmailJS) ------ */
  if (siteData.emailjs && siteData.emailjs.publicKey && window.emailjs) {
    emailjs.init(siteData.emailjs.publicKey);
  }

  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const mode = getMode();
    const delivery = getDeliveryPrice();
    const productsTotal = cart.reduce((sum, p) => sum + ((mode === 'rent' && p.rentPrice > 0) ? p.rentPrice : p.buyPrice), 0);
    const params = {
      products: cart.map(p => p.name).join('، '),
      mode: mode === 'rent' ? 'كراء' : 'شراء',
      wilaya: wilayaSelect.value,
      delivery: delivery,
      total: productsTotal + delivery
    };
    if (siteData.emailjs && siteData.emailjs.publicKey && siteData.emailjs.serviceId && siteData.emailjs.templateId && window.emailjs) {
      emailjs.send(siteData.emailjs.serviceId, siteData.emailjs.templateId, params)
        .then(() => alert('تم استلام طلبك بنجاح ✅'))
        .catch(() => alert('تم تسجيل الطلب، لكن حدث خطأ أثناء إرسال البريد.'));
    } else {
      alert('تم استلام طلبك بنجاح ✅');
    }
    cart = [];
    renderCart();
    closeCheckout();
  });

})();