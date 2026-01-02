// --- 1. GLOBAL VARIABLES ---
let cartCount = 0;
let currentProduct = {};
let selectedSize = 'A4';

// DOM Elements
const cartButton = document.getElementById('cartButton');
const modal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCart = document.getElementById('modalAddToCart');

// --- 2. SCROLL SPY (Navigaatio seuraa skrollausta) ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-item');

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

// --- 3. PRODUCT MODAL LOGIC ---

// Avaa pop-up (kutsutaan HTML:stä)
function openProduct(id, title, imgUrl, basePrice) {
    currentProduct = { id, title, imgUrl, basePrice };
    
    // Aseta tiedot
    modalImg.src = imgUrl;
    modalTitle.innerText = title;
    
    // Nollaa koko-valinnat
    selectedSize = 'A4';
    resetSizeButtons();
    updatePrice();
    
    // Näytä
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Estä taustan skrollaus
}

// Sulje pop-up
function closeProduct() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Sulje jos klikkaa taustalle
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProduct();
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
    document.querySelector('.size-btn').classList.add('active'); // Eka nappi (A4) aktiiviseksi
}

// Päivitä hinta
function updatePrice() {
    let finalPrice = currentProduct.basePrice;
    
    if (selectedSize === '50x70') {
        finalPrice += 10;
    }
    
    modalPrice.innerText = '$' + finalPrice.toFixed(2);
}

// Lisää koriin (Modaalista)
modalAddToCart.addEventListener('click', () => {
    cartCount++;
    cartButton.innerText = `CART (${cartCount})`;
    
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

// Lisää koriin (Suoraan listasta, "Atmosphere" tuotteille joissa ei ole view nappia)
document.querySelectorAll('.product-card .add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Estä modaalin aukeaminen jos painaa nappia
        cartCount++;
        cartButton.innerText = `CART (${cartCount})`;
        
        const originalText = btn.innerText;
        btn.innerText = "ADDED";
        btn.classList.add('added');
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('added');
        }, 1000);
    });
});


// --- 4. CHATBOT LOGIC ---
const chatTrigger = document.getElementById('chatTrigger');
const chatInterface = document.getElementById('chatInterface');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatControls = document.getElementById('chatControls');

const botData = {
    start: {
        text: "Yo. Welcome to the Archive. Looking to upgrade your room setup or just browsing?",
        options: [
            { label: "Upgrade Setup", next: 'vibes' },
            { label: "Just Browsing", next: 'browsing' }
        ]
    },
    vibes: {
        text: "Bet. What's the vibe?",
        options: [
            { label: "Chill / Moody", next: 'chill' },
            { label: "Cyberpunk RGB", next: 'party' },
            { label: "Clean / Minimalist", next: 'clean' }
        ]
    },
    browsing: {
        text: "Our best sellers are the Custom Prints and Cloud Ceilings. Want to see?",
        options: [
            { label: "Show Clouds", action: 'goto_atmosphere' },
            { label: "Show Prints", action: 'goto_visuals' }
        ]
    },
    chill: {
        text: "For late night relax mode, the Levitating Moon is perfect.",
        options: [
            { label: "Check Moon", action: 'goto_objects' },
            { label: "Show me Prints", action: 'goto_visuals' }
        ]
    },
    party: {
        text: "Say less. Thunder Cloud Ceiling + Smart Neon Ropes is the combo.",
        options: [
            { label: "Show Clouds", action: 'goto_atmosphere' }
        ]
    },
    clean: {
        text: "Respect. The Custom Album Prints look crazy good on a white wall.",
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
            document.getElementById(sectionId).scrollIntoView({behavior: 'smooth'});
            addMsg("Scrolled down for you. 👇", 'bot');
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