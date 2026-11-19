// Filtro de produtos por categoria
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.game-card');

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        const category = button.dataset.category;

        productCards.forEach((card) => {
            const matches = category === 'all' || card.dataset.category === category;
            card.classList.toggle('hidden', !matches);
        });
    });
});

// Modal de detalhes do produto
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalTag = document.getElementById('modal-tag');
const modalPrice = document.getElementById('modal-price');
const modalDesc = document.getElementById('modal-desc');

document.querySelectorAll('.open-modal').forEach((btn) => {
    btn.addEventListener('click', () => {
        modalTitle.textContent = btn.dataset.title;
        modalTag.textContent = btn.dataset.tag;
        modalPrice.textContent = btn.dataset.price;
        modalDesc.textContent = btn.dataset.desc;

        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
    });
});

function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
}

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
        closeModal();
    }
});

// Carrinho e pagamentos
const cartDrawer = document.getElementById('cart-drawer');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const paymentHintEl = document.getElementById('payment-hint');
const installmentBox = document.getElementById('installment-box');
const installmentsSelect = document.getElementById('installments-select');
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const checkoutBtn = document.getElementById('checkout-btn');

let cart = [];

function formatBRL(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getSelectedPayment() {
    const checked = document.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : 'pix';
}

function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}

function updateInstallments(amount) {
    const currentSelection = Number(installmentsSelect.value) || 1;
    installmentsSelect.innerHTML = '';

    for (let i = 1; i <= 10; i++) {
        const parcelValue = amount / i;
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}x de ${formatBRL(parcelValue)} sem juros`;
        if (i === currentSelection) {
            option.selected = true;
        }
        installmentsSelect.appendChild(option);
    }
}

function updatePaymentSummary() {
    const subtotal = getSubtotal();
    const method = getSelectedPayment();

    installmentBox.classList.toggle('hidden', method !== 'cartao');

    if (method === 'pix') {
        const finalPix = subtotal * 0.9;
        cartTotalEl.textContent = formatBRL(finalPix);
        paymentHintEl.textContent = '10% de desconto aplicado no PIX.';
    } else if (method === 'cartao') {
        cartTotalEl.textContent = formatBRL(subtotal);
        updateInstallments(subtotal);
        const parcelas = Number(installmentsSelect.value) || 1;
        paymentHintEl.textContent = subtotal > 0
            ? `Parcelamento em ${parcelas}x de ${formatBRL(subtotal / parcelas)}.`
            : 'Selecione as parcelas no cartão.';
    } else {
        cartTotalEl.textContent = formatBRL(subtotal);
        paymentHintEl.textContent = 'Compensação em até 2 dias úteis após o pagamento.';
    }
}

function renderCart() {
    cartCountEl.textContent = cart.length;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Seu carrinho está vazio.</p>';
        updatePaymentSummary();
        return;
    }

    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div>
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatBRL(item.price)}</div>
            </div>
            <button class="remove-item" data-index="${index}">Remover</button>
        `;
        cartItemsContainer.appendChild(row);
    });

    document.querySelectorAll('.remove-item').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.index);
            cart.splice(idx, 1);
            renderCart();
        });
    });

    updatePaymentSummary();
}

document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
        cart.push({
            name: btn.dataset.name,
            price: Number(btn.dataset.price)
        });
        renderCart();
        cartDrawer.classList.add('open');
        cartDrawer.setAttribute('aria-hidden', 'false');
    });
});

paymentRadios.forEach((radio) => {
    radio.addEventListener('change', updatePaymentSummary);
});

installmentsSelect.addEventListener('change', updatePaymentSummary);

openCartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
});

closeCartBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Adicione pelo menos um produto antes de finalizar.');
        return;
    }

    const method = getSelectedPayment();
    const labelMap = {
        pix: 'PIX (10% off)',
        cartao: `Cartão de Crédito (${installmentsSelect.value}x)`,
        boleto: 'Boleto Bancário'
    };

    alert(
        `Cobrança simulada!\n` +
        `Itens: ${cart.length}\n` +
        `Pagamento: ${labelMap[method]}\n` +
        `Total: ${cartTotalEl.textContent}`
    );

    cart = [];
    renderCart();
});

// Formulário de contato
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('contact-name');
    formFeedback.textContent = `Obrigado, ${nameInput.value}! Sua mensagem foi registrada.`;
    contactForm.reset();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
        cartDrawer.classList.remove('open');
        cartDrawer.setAttribute('aria-hidden', 'true');
    }
});

updatePaymentSummary();