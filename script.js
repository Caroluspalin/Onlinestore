/* =========================================
   1. ASETUKSET JA MUUTTUJAT
   ========================================= */

// --- SUPABASE YHTEYS ---
const SUPABASE_URL = 'https://nyqacczlqcecswqkhzjc.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cWFjY3pscWNlY3N3cWtoempjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzUzNjUsImV4cCI6MjA4MzExMTM2NX0.ASO0i2YRWZHkRSSsmzd4us-dOls52FokGe9caxon3Yg';

// KORJAUS: Nimetään muuttuja 'db':ksi (tai supabaseClient), jotta se ei riitele 'supabase'-kirjaston kanssa
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Globaalit muuttujat
let cart = []; 
let currentProduct = {}; 
let selectedSize = 'Standard'; 

// DOM Elementit
const cartButton = document.getElementById('cartButton');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-item');
const productModal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCart = document.getElementById('modalAddToCart');
const customInputs = document.getElementById('customInputs');
const checkoutModal = document.getElementById('checkoutModal');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalElement = document.getElementById('cartTotal');


/* =========================================
   2. HAE TUOTTEET TIETOKANNASTA
   ========================================= */

async function fetchProducts() {
    console.log("Haetaan tuotteita...");

    // KORJAUS: Käytetään nyt 'db' muuttujaa
    const { data: products, error } = await db
        .from('Products')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Virhe haettaessa tuotteita:', error);
        return;
    }

    if (products) {
        console.log("Tuotteet ladattu:", products);
        products.forEach(product => {
            createProductCard(product);
        });
    }
}

function createProductCard(product) {
    const gridId = `grid-${product.category}`; 
    const container = document.getElementById(gridId);

    if (!container) return;

    const isCustom = product.text_id === 'custom';
    const btnText = isCustom ? 'CUSTOMIZE' : 'INSPECT';
    const overlayHTML = isCustom ? '<div class="overlay">CREATE YOUR OWN</div>' : '';
    
    const card = document.createElement('div');
    card.classList.add('product-card');
    
    card.onclick = () => openProduct(product.text_id, product.title, product.image_url, product.price);

    card.innerHTML = `
        <div class="card-image">
            <img src="${product.image_url}" alt="${product.title}">
            ${overlayHTML}
        </div>
        <div class="card-details">
            <div class="info-top">
                <h3>${product.title}</h3>
                <div class="pricing">
                    <span class="new-price">$${product.price.toFixed(2)}</span>
                </div>
            </div>
            <button class="add-btn">${btnText}</button>
        </div>
    `;

    container.appendChild(card);
}

// Käynnistetään haku
fetchProducts();


/* =========================================
   3. SCROLL SPY
   ========================================= */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('active'));
            const id = entry.target.getAttribute('id');
            const activeLink = document.querySelector(`.nav-item[href="#${id}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}, { threshold: 0.3 });

sections.forEach(section => observer.observe(section));


/* =========================================
   4. TUOTE MODAL LOGIIKKA
   ========================================= */

function openProduct(id, title, imgUrl, basePrice) {
    currentProduct = { id, title, imgUrl, basePrice };
    
    modalImg.src = imgUrl;
    modalTitle.innerText = title;
    
    if (id === 'custom') {
        customInputs.style.display = 'block';
    } else {
        customInputs.style.display = 'none';
    }
    
    selectedSize = 'Standard';
    resetSizeButtons();
    updatePrice();
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProduct() {
    productModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProduct();
});

function selectSize(btn, size) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSize = size;
    updatePrice();
}

function resetSizeButtons() {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    const firstBtn = document.querySelector('.size-btn');
    if(firstBtn) firstBtn.classList.add('active');
}

function updatePrice() {
    let finalPrice = currentProduct.basePrice;
    if (selectedSize === 'Large' || selectedSize === 'A3') finalPrice += 10;
    if (selectedSize === 'XL' || selectedSize === '50x70') finalPrice += 20;
    modalPrice.innerText = '$' + finalPrice.toFixed(2);
}

modalAddToCart.addEventListener('click', () => {
    let finalPrice = currentProduct.basePrice;
    if (selectedSize === 'Large' || selectedSize === 'A3') finalPrice += 10;
    if (selectedSize === 'XL' || selectedSize === '50x70') finalPrice += 20;

    cart.push({
        title: currentProduct.title,
        price: finalPrice,
        size: selectedSize,
        img: currentProduct.imgUrl
    });

    cartButton.innerText = `CART (${cart.length})`;

    const originalText = modalAddToCart.innerText;
    modalAddToCart.innerText = "ADDED TO CART";
    modalAddToCart.style.background = "#fff";
    modalAddToCart.style.color = "#000";
    
    setTimeout(() => {
        modalAddToCart.innerText = originalText;
        modalAddToCart.style.background = "";
        modalAddToCart.style.color = "";
        closeProduct();
    }, 800);
});


/* =========================================
   5. OSTOSKORI / CHECKOUT
   ========================================= */

cartButton.addEventListener('click', () => {
    renderCart();
    checkoutModal.classList.add('active');
});

function closeCheckout() {
    checkoutModal.classList.remove('active');
}

checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeCheckout();
});

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        cartTotalElement.innerText = '$0.00';
        return;
    }

    cart.forEach((item) => {
        total += item.price;
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <div class="item-info">
                <h4>${item.title}</h4>
                <span>Option: ${item.size}</span>
            </div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalElement.innerText = '$' + total.toFixed(2);
}


/* =========================================
   6. CHATBOT
   ========================================= */

const chatTrigger = document.getElementById('chatTrigger');
const chatInterface = document.getElementById('chatInterface');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatControls = document.getElementById('chatControls');

const botData = {
    start: { 
        text: "Yo. Welcome to the Archive. Upgrade your setup or just browsing?", 
        options: [
            { label: "Upgrade Room", next: 'vibes' }, 
            { label: "Just Browsing", next: 'browsing' }
        ] 
    },
    vibes: { 
        text: "Bet. What's the vibe?", 
        options: [
            { label: "Chill / Moody", next: 'chill' }, 
            { label: "Cyberpunk / RGB", next: 'party' }, 
            { label: "Clean / Minimal", next: 'clean' }
        ] 
    },
    browsing: { 
        text: "Check our best sellers.", 
        options: [
            { label: "Show Clouds", action: 'goto_atmosphere' }, 
            { label: "Show Prints", action: 'goto_visuals' }
        ] 
    },
    chill: { 
        text: "Levitating Moon or Infinity Mirror is the move for late nights.", 
        options: [
            { label: "Check Objects", action: 'goto_objects' }
        ] 
    },
    party: { 
        text: "Clouds + Neons = Game over. Total transformation.", 
        options: [
            { label: "Show Atmosphere", action: 'goto_atmosphere' }
        ] 
    },
    clean: { 
        text: "Custom Album Prints look crazy good on a white wall.", 
        options: [
            { label: "Go to Prints", action: 'goto_visuals' }
        ] 
    }
};

chatTrigger.addEventListener('click', () => {
    chatInterface.classList.add('active');
    if(chatMessages.children.length === 0) renderStep(botData.start);
});

closeChat.addEventListener('click', () => {
    chatInterface.classList.remove('active');
});

function renderStep(step) {
    addMsg(step.text, 'bot');
    chatControls.innerHTML = '';
    
    step.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('chat-option');
        btn.innerText = opt.label;
        btn.onclick = () => handleOpt(opt);
        chatControls.appendChild(btn);
    });
}

function handleOpt(opt) {
    addMsg(opt.label, 'user');
    chatControls.innerHTML = '';
    setTimeout(() => {
        if (opt.action) {
            const sectionId = opt.action.replace('goto_', '');
            const section = document.getElementById(sectionId);
            if(section) {
                section.scrollIntoView({behavior: 'smooth'});
                addMsg("Scrolled down for you. 👇", 'bot');
            }
        } else if (opt.next) {
            renderStep(botData[opt.next]);
        }
    }, 500);
}

function addMsg(txt, sender) {
    const d = document.createElement('div');
    d.classList.add('msg', sender);
    d.innerText = txt;
    chatMessages.appendChild(d);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}