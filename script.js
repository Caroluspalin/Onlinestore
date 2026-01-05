/* =========================================
   1. ASETUKSET JA MUUTTUJAT
   ========================================= */

// --- SUPABASE YHTEYS ---
const SUPABASE_URL = 'https://nyqacczlqcecswqkhzjc.supabase.co'; 
// TÄMÄ OLI VÄÄRIN, TÄSSÄ ON NYT SE OIKEA PITKÄ AVAIN:
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cWFjY3pscWNlY3N3cWtoempjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzUzNjUsImV4cCI6MjA4MzExMTM2NX0.ASO0i2YRWZHkRSSsmzd4us-dOls52FokGe9caxon3Yg';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); 
// Globaalit muuttujat
let cart = []; // Ostoskori
let currentProduct = {}; // Tällä hetkellä auki oleva tuote
let selectedSize = 'Standard'; // Valittu koko

// DOM Elementit (Navigaatio & UI)
const cartButton = document.getElementById('cartButton');
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-item');

// DOM Elementit (Tuote Modal)
const productModal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCart = document.getElementById('modalAddToCart');
const customInputs = document.getElementById('customInputs');

// DOM Elementit (Checkout / Cart)
const checkoutModal = document.getElementById('checkoutModal');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalElement = document.getElementById('cartTotal');


/* =========================================
   2. HAE TUOTTEET TIETOKANNASTA (SUPABASE)
   ========================================= */

async function fetchProducts() {
    console.log("Haetaan tuotteita...");

    // 1. Hae kaikki rivit 'products' taulusta
    const { data: products, error } = await supabase
        .from('Products')
        .select('*')
        .order('id', { ascending: true }); // Järjestä ID:n mukaan

    // 2. Jos virhe, kerro konsolissa
    if (error) {
        console.error('Virhe haettaessa tuotteita:', error);
        return;
    }

    // 3. Jos onnistui, luo kortit
    if (products) {
        console.log("Tuotteet ladattu:", products);
        products.forEach(product => {
            createProductCard(product);
        });
    }
}

// Tämä funktio rakentaa HTML-kortin yhdelle tuotteelle
function createProductCard(product) {
    // Päätellään mihin gridiin tuote kuuluu kategorian perusteella
    // Esim. jos category on 'visuals', etsitään elementti id="grid-visuals"
    const gridId = `grid-${product.category}`; 
    const container = document.getElementById(gridId);

    // Jos gridiä ei löydy HTML:stä, lopeta
    if (!container) return;

    // Logiikka napeille ja teksteille
    const isCustom = product.text_id === 'custom';
    const btnText = isCustom ? 'CUSTOMIZE' : 'INSPECT';
    const overlayHTML = isCustom ? '<div class="overlay">CREATE YOUR OWN</div>' : '';
    
    // Luodaan kortti elementti
    const card = document.createElement('div');
    card.classList.add('product-card');
    
    // Kun korttia klikataan, avataan modal näillä tiedoilla
    card.onclick = () => openProduct(product.text_id, product.title, product.image_url, product.price);

    // Kortin HTML-sisältö
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

    // Lisää kortti sivulle
    container.appendChild(card);
}

// KÄYNNISTÄ HAKU HETI KUN SIVU LATAUTUU
fetchProducts();


/* =========================================
   3. SCROLL SPY (NAVIGAATION KOROSTUS)
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
   4. TUOTE MODAL (POP-UP) LOGIIKKA
   ========================================= */

function openProduct(id, title, imgUrl, basePrice) {
    // Tallenna tiedot muistiin
    currentProduct = { id, title, imgUrl, basePrice };
    
    // Päivitä UI
    modalImg.src = imgUrl;
    modalTitle.innerText = title;
    
    // Näytä custom-kentät vain jos kyseessä on custom-tuote
    if (id === 'custom') {
        customInputs.style.display = 'block';
    } else {
        customInputs.style.display = 'none';
    }
    
    // Nollaa koko ja hinta
    selectedSize = 'Standard';
    resetSizeButtons();
    updatePrice();
    
    // Avaa ikkuna
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProduct() {
    productModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Sulje jos klikkaa taustalle
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProduct();
});

// Koon valinta
function selectSize(btn, size) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedSize = size;
    updatePrice();
}

function resetSizeButtons() {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    // Etsi eka nappi ja aktivoi se (olettaen että se on Standard/A4)
    const firstBtn = document.querySelector('.size-btn');
    if(firstBtn) firstBtn.classList.add('active');
}

// Hinnan päivitys koon mukaan
function updatePrice() {
    let finalPrice = currentProduct.basePrice;
    
    if (selectedSize === 'Large' || selectedSize === 'A3') {
        finalPrice += 10;
    } else if (selectedSize === 'XL' || selectedSize === '50x70') {
        finalPrice += 20;
    }
    
    modalPrice.innerText = '$' + finalPrice.toFixed(2);
}

// LISÄÄ OSTOSKORIIN -NAPPI
modalAddToCart.addEventListener('click', () => {
    // 1. Laske lopullinen hinta
    let finalPrice = currentProduct.basePrice;
    if (selectedSize === 'Large' || selectedSize === 'A3') finalPrice += 10;
    if (selectedSize === 'XL' || selectedSize === '50x70') finalPrice += 20;

    // 2. Lisää tuote kori-taulukkoon
    cart.push({
        title: currentProduct.title,
        price: finalPrice,
        size: selectedSize,
        img: currentProduct.imgUrl
    });

    // 3. Päivitä yläpalkin laskuri
    cartButton.innerText = `CART (${cart.length})`;

    // 4. Animaatio nappiin
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
   5. OSTOSKORI / CHECKOUT LOGIIKKA
   ========================================= */

// Avaa ostoskori
cartButton.addEventListener('click', () => {
    renderCart(); // Päivitä sisältö
    checkoutModal.classList.add('active');
});

function closeCheckout() {
    checkoutModal.classList.remove('active');
}

checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) closeCheckout();
});

// Piirrä ostoskorin sisältö
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
        
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.title}</h4>
                <span>Option: ${item.size}</span>
            </div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
        `;
        
        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotalElement.innerText = '$' + total.toFixed(2);
}


/* =========================================
   6. CHATBOT LOGIIKKA
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