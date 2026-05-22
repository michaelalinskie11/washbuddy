import './style.css'

console.log("WashBuddy Premium UI v4.0 initialized");

// ============================================
// NAVBAR SCROLL & ACTIVE STATE
// ============================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
}, { passive: true });

const sections = document.querySelectorAll('section[id], div[id="home"]');
const navLinks = document.querySelectorAll('.nav-links a');

const observerOptions = { rootMargin: '-40% 0px -55% 0px' };
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        }
    });
}, observerOptions);

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================
// GSAP SCROLL TRIGGERS & ANIMATIONS
// ============================================
if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance animations
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
        .from('.pill-badge',     { y: 20, opacity: 0, duration: 0.6 })
        .from('.hero-title',     { y: 40, opacity: 0, duration: 0.8 }, '-=0.3')
        .from('.hero-subtitle',  { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
        .from('.hero-cta > *',   { y: 20, opacity: 0, duration: 0.5, stagger: 0.15 }, '-=0.4')
        .from('.hero-stats',     { y: 20, opacity: 0, duration: 0.5 }, '-=0.3')
        .from('.phone-mockup',   { scale: 0.85, y: 30, opacity: 0, duration: 0.9, ease: 'back.out(1.2)' }, '-=0.7');

    // Counter animation
    document.querySelectorAll('.counter').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const suffix = counter.querySelector('span') ? counter.querySelector('span').outerHTML : '';
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                let obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        counter.innerHTML = Math.ceil(obj.val).toLocaleString('id-ID') + suffix;
                    }
                });
            }
        });
    });

    // Generic scroll reveals
    gsap.utils.toArray('.reveal-up').forEach(el => {
        gsap.from(el, {
            y: 40, opacity: 0, duration: 0.75, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });
    gsap.utils.toArray('.reveal-left').forEach(el => {
        gsap.from(el, {
            x: -40, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });
    gsap.utils.toArray('.reveal-right').forEach(el => {
        gsap.from(el, {
            x: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
    });

    // Step cards stagger
    gsap.from('.step-card', {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'back.out(1.2)',
        scrollTrigger: { trigger: '.steps-grid', start: 'top 80%', once: true }
    });

    // Service cards stagger
    gsap.from('.service-card', {
        y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: '.services-grid', start: 'top 80%', once: true }
    });
}

// ============================================
// AUTH & LOGIN MODAL
// ============================================
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');

const loginTrigger = document.getElementById('btn-masuk');
if (loginTrigger) {
    loginTrigger.addEventListener('click', e => {
        e.preventDefault();
        if (authModal) {
            authModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    });
}

function closeAuthModal() {
    if (authModal) {
        authModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);
if (authModal) {
    authModal.addEventListener('click', e => {
        if (e.target === authModal) closeAuthModal();
    });
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && authModal && !authModal.classList.contains('hidden')) {
        closeAuthModal();
    }
});

// ============================================
// MOBILE NAVBAR MENU
// ============================================
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('hamburger');
    if (!menu) return;
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    if (btn) {
        btn.innerHTML = isOpen
            ? '<i class="ph-bold ph-list"></i>'
            : '<i class="ph-bold ph-x"></i>';
    }
};

document.addEventListener('click', e => {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('hamburger');
    if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !btn?.contains(e.target)) {
        menu.classList.remove('open');
        if (btn) btn.innerHTML = '<i class="ph-bold ph-list"></i>';
    }
});

// ============================================
// CARD PERSPECTIVE TILT (DESKTOP)
// ============================================
if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.service-card, .step-card, .track-panel').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rx = ((y - cy) / cy) * -4;
            const ry = ((x - cx) / cx) * 4;
            card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// SMARTPHONE SIMULATOR INTERACTIVE LOGIC
// ============================================

// 1. Clock status bar
function updateMockupClock() {
    const clockEl = document.getElementById('phone-time');
    if (clockEl) {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        clockEl.textContent = `${hrs}:${mins}`;
    }
}
setInterval(updateMockupClock, 1000);
updateMockupClock();

// 2. Tabs simulator clicking
const mockupNavItems = document.querySelectorAll('.phone-nav-item');
const mockupPanes = document.querySelectorAll('.phone-pane');

mockupNavItems.forEach(item => {
    item.addEventListener('click', () => {
        mockupNavItems.forEach(n => n.classList.remove('active'));
        mockupPanes.forEach(p => p.classList.remove('active'));
        
        item.classList.add('active');
        const targetPane = document.getElementById(item.getAttribute('data-target'));
        if (targetPane) targetPane.classList.add('active');
    });
});

// 3. Voucher Copy & Toast popup
const phoneToast = document.getElementById('phone-toast');
let toastTimeout;
document.querySelectorAll('.mini-promo-card').forEach(promo => {
    promo.addEventListener('click', () => {
        const code = promo.getAttribute('data-code');
        navigator.clipboard.writeText(code).then(() => {
            if (phoneToast) {
                clearTimeout(toastTimeout);
                phoneToast.textContent = `Kupon "${code}" disalin!`;
                phoneToast.classList.add('show');
                toastTimeout = setTimeout(() => {
                    phoneToast.classList.remove('show');
                }, 2500);
            }
        }).catch(err => {
            console.error("Gagal menyalin kode voucher: ", err);
        });
    });
});

// ============================================
// LIVE PRICE & TIME ESTIMATOR (KALKULATOR)
// ============================================
const calcServiceBtns = document.querySelectorAll('.service-select-btn');
const calcMinusBtn = document.getElementById('calc-minus');
const calcPlusBtn = document.getElementById('calc-plus');
const calcQtyValEl = document.getElementById('calc-qty-val');
const calcUnitLabelEl = document.getElementById('calc-unit-label');
const calcAddonPerfume = document.getElementById('addon-perfume');
const calcAddonSorting = document.getElementById('addon-sorting');
const calcTotalValEl = document.getElementById('calc-total-val');
const calcTimeValEl = document.getElementById('calc-time-val');

let currentCalcService = {
    type: 'wash',
    price: 8000,
    unit: 'kg',
    time: '24 jam'
};
let currentCalcQty = 3; // default for wash is 3 kg

function updateCalculator() {
    // 1. Bound quantity
    const minQty = (currentCalcService.unit === 'kg') ? 3 : 1;
    if (currentCalcQty < minQty) {
        currentCalcQty = minQty;
    }
    
    // 2. Render quantity & unit
    if (calcQtyValEl) calcQtyValEl.textContent = currentCalcQty;
    if (calcUnitLabelEl) calcUnitLabelEl.textContent = currentCalcService.unit;
    
    // 3. Math calculation
    const serviceCost = currentCalcService.price * currentCalcQty;
    const perfumeCost = (calcAddonPerfume && calcAddonPerfume.checked) ? 2000 * currentCalcQty : 0;
    const sortingCost = (calcAddonSorting && calcAddonSorting.checked) ? 5000 : 0; // Flat sorting cost
    const totalCost = serviceCost + perfumeCost + sortingCost;
    
    // 4. Update displays
    if (calcTotalValEl) {
        calcTotalValEl.textContent = `Rp ${totalCost.toLocaleString('id-ID')}`;
    }
    if (calcTimeValEl) {
        calcTimeValEl.textContent = `~ ${currentCalcService.time} Pengerjaan`;
    }
}

// Service selectors
calcServiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        calcServiceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentCalcService.type = btn.getAttribute('data-type');
        currentCalcService.price = parseInt(btn.getAttribute('data-price'));
        currentCalcService.unit = btn.getAttribute('data-unit');
        currentCalcService.time = btn.getAttribute('data-time');
        
        // Adjust default values based on unit
        if (currentCalcService.unit === 'kg') {
            currentCalcQty = Math.max(currentCalcQty, 3);
        } else {
            currentCalcQty = Math.max(currentCalcQty, 1);
        }
        
        updateCalculator();
    });
});

// Qty Plus / Minus
if (calcMinusBtn) {
    calcMinusBtn.addEventListener('click', () => {
        const minQty = (currentCalcService.unit === 'kg') ? 3 : 1;
        if (currentCalcQty > minQty) {
            currentCalcQty--;
            updateCalculator();
        }
    });
}
if (calcPlusBtn) {
    calcPlusBtn.addEventListener('click', () => {
        currentCalcQty++;
        updateCalculator();
    });
}

// Addon changes
if (calcAddonPerfume) calcAddonPerfume.addEventListener('change', updateCalculator);
if (calcAddonSorting) calcAddonSorting.addEventListener('change', updateCalculator);

// Initial calc update
updateCalculator();


// ============================================
// MULTI-STEP BOOKING WIZARD MODAL
// ============================================
const bookingModal = document.getElementById('booking-modal');
const closeBooking = document.getElementById('close-booking');

// Form state variables
let wizardStep = 1;
let wizardQty = 3;
let wizardUnit = 'kg';

// Open booking modal triggers
const bookingTriggers = document.querySelectorAll(
    '#btn-hero-main, #btn-pesan-nav, #btn-pesan-mobile, #btn-calc-book, [id^="btn-svc-"], #btn-cta-bottom'
);

bookingTriggers.forEach(trigger => {
    trigger.addEventListener('click', e => {
        e.preventDefault();
        
        // Fill data from calculator if booking from calculator
        if (trigger.id === 'btn-calc-book') {
            syncWizardFromCalculator();
        } else if (trigger.id.startsWith('btn-svc-')) {
            // Fill default based on service clicked
            const svcType = trigger.id.replace('btn-svc-', '');
            syncWizardFromServiceCard(svcType);
        } else {
            // Default booking initialization
            syncWizardFromServiceCard('wash');
        }
        
        openBookingWizard();
    });
});

function openBookingWizard() {
    if (bookingModal) {
        bookingModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setWizardStep(1);
    }
}

function closeBookingWizard() {
    if (bookingModal) {
        bookingModal.classList.add('hidden');
        document.body.style.overflow = '';
        resetWizardForm();
    }
}

if (closeBooking) closeBooking.addEventListener('click', closeBookingWizard);
if (bookingModal) {
    bookingModal.addEventListener('click', e => {
        if (e.target === bookingModal) closeBookingWizard();
    });
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && bookingModal && !bookingModal.classList.contains('hidden')) {
        closeBookingWizard();
    }
});

// Sync data helpers
function syncWizardFromCalculator() {
    const wizardServiceCards = document.querySelectorAll('#booking-form [data-service]');
    wizardServiceCards.forEach(card => {
        let matches = false;
        if (currentCalcService.type === 'wash' && card.getAttribute('data-service') === 'regular') matches = true;
        else if (currentCalcService.type === 'kilat' && card.getAttribute('data-service') === 'kilat') matches = true;
        else if (currentCalcService.type === 'dry' && card.getAttribute('data-service') === 'dryclean') matches = true;
        else if (currentCalcService.type === card.getAttribute('data-service')) matches = true;
        
        card.classList.toggle('active', matches);
        const radio = card.querySelector('input[type="radio"]');
        if (radio && matches) radio.checked = true;
    });
    
    wizardQty = currentCalcQty;
    wizardUnit = (currentCalcService.unit === 'kg') ? 'kg' : 'pcs';
    
    const wizardQtyValEl = document.getElementById('wizard-weight-val');
    const wizardQtyUnitEl = document.getElementById('wizard-weight-unit');
    if (wizardQtyValEl) wizardQtyValEl.textContent = wizardQty;
    if (wizardQtyUnitEl) wizardQtyUnitEl.textContent = wizardUnit;
}

function syncWizardFromServiceCard(svcType) {
    const wizardServiceCards = document.querySelectorAll('#booking-form [data-service]');
    wizardServiceCards.forEach(card => {
        let matches = false;
        if (svcType === 'wash' && card.getAttribute('data-service') === 'regular') matches = true;
        else if (svcType === 'kilat' && card.getAttribute('data-service') === 'kilat') matches = true;
        else if (svcType === 'dry' && card.getAttribute('data-service') === 'dryclean') matches = true;
        else if (svcType === card.getAttribute('data-service')) matches = true;
        
        card.classList.toggle('active', matches);
        const radio = card.querySelector('input[type="radio"]');
        if (radio && matches) radio.checked = true;
    });
    
    if (svcType === 'wash' || svcType === 'kilat') {
        wizardQty = 3;
        wizardUnit = 'kg';
    } else {
        wizardQty = 1;
        wizardUnit = 'pcs';
    }
    
    const wizardQtyValEl = document.getElementById('wizard-weight-val');
    const wizardQtyUnitEl = document.getElementById('wizard-weight-unit');
    if (wizardQtyValEl) wizardQtyValEl.textContent = wizardQty;
    if (wizardQtyUnitEl) wizardQtyUnitEl.textContent = wizardUnit;
}

// Step Pane handling elements
const wizardPanes = document.querySelectorAll('.wizard-pane');
const wizardSteps = document.querySelectorAll('.wizard-step-indicator');
const wizardProgressBar = document.getElementById('wizard-progress');
const wizardPrevBtn = document.getElementById('wizard-btn-prev');
const wizardNextBtn = document.getElementById('wizard-btn-next');

// Set wizard step function
function setWizardStep(step) {
    wizardStep = step;
    
    wizardPanes.forEach(pane => {
        pane.classList.toggle('active', parseInt(pane.getAttribute('data-pane')) === step);
    });
    
    wizardSteps.forEach(ind => {
        const indStep = parseInt(ind.getAttribute('data-step'));
        ind.classList.toggle('active', indStep === step);
        ind.classList.toggle('completed', indStep < step);
    });
    
    if (wizardProgressBar) {
        const pct = ((step - 1) / 2) * 100;
        wizardProgressBar.style.width = `${pct}%`;
    }
    
    if (wizardPrevBtn) {
        wizardPrevBtn.style.visibility = (step === 1) ? 'hidden' : 'visible';
    }
    
    if (wizardNextBtn) {
        if (step === 3) {
            const activePayCard = document.querySelector('.pay-card-grid .pay-card-btn.active');
            const isQris = activePayCard && activePayCard.getAttribute('data-pay') === 'qris';
            wizardNextBtn.innerHTML = isQris 
                ? `<span>Bayar dengan QRIS</span> <i class="ph-bold ph-qr-code"></i>` 
                : `<span>Buat Pesanan</span> <i class="ph-bold ph-check"></i>`;
        } else {
            wizardNextBtn.innerHTML = `<span>Lanjut</span> <i class="ph-bold ph-arrow-right"></i>`;
        }
    }
}

// Radio selectors inside form (Service Cards clicking)
const wizardServiceButtons = document.querySelectorAll('#booking-form [data-service]');
wizardServiceButtons.forEach(card => {
    card.addEventListener('click', () => {
        wizardServiceButtons.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        
        const svc = card.getAttribute('data-service');
        if (svc === 'regular' || svc === 'kilat') {
            wizardUnit = 'kg';
            wizardQty = Math.max(wizardQty, 3);
        } else {
            wizardUnit = 'pcs';
            wizardQty = Math.max(wizardQty, 1);
        }
        
        const wizardQtyValEl = document.getElementById('wizard-weight-val');
        const wizardQtyUnitEl = document.getElementById('wizard-weight-unit');
        if (wizardQtyValEl) wizardQtyValEl.textContent = wizardQty;
        if (wizardQtyUnitEl) wizardQtyUnitEl.textContent = wizardUnit;
    });
});

// Qty Adjusters inside form
const wizardWeightMinus = document.getElementById('wizard-weight-minus');
const wizardWeightPlus = document.getElementById('wizard-weight-plus');

if (wizardWeightMinus) {
    wizardWeightMinus.addEventListener('click', () => {
        const minQty = (wizardUnit === 'kg') ? 3 : 1;
        if (wizardQty > minQty) {
            wizardQty--;
            document.getElementById('wizard-weight-val').textContent = wizardQty;
        }
    });
}
if (wizardWeightPlus) {
    wizardWeightPlus.addEventListener('click', () => {
        wizardQty++;
        document.getElementById('wizard-weight-val').textContent = wizardQty;
    });
}

// Date setting - set tomorrow as default date picker value
const dateInput = document.getElementById('wizard-date');
if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    dateInput.min = `${yyyy}-${mm}-${dd}`; 
}

// Time Slot buttons toggle inside form
const wizardSlotButtons = document.querySelectorAll('.slot-grid .slot-btn');
wizardSlotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        wizardSlotButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Payment choices toggle
const wizardPayButtons = document.querySelectorAll('.pay-card-grid .pay-card-btn');
const qrisView = document.getElementById('qris-payment-view');

wizardPayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        wizardPayButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const radio = btn.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        
        const pay = btn.getAttribute('data-pay');
        
        if (pay === 'qris') {
            if (wizardNextBtn) wizardNextBtn.innerHTML = `<span>Bayar dengan QRIS</span> <i class="ph-bold ph-qr-code"></i>`;
        } else {
            if (qrisView) qrisView.style.display = 'none';
            if (wizardNextBtn) {
                wizardNextBtn.style.display = 'inline-flex';
                wizardNextBtn.innerHTML = `<span>Buat Pesanan</span> <i class="ph-bold ph-check"></i>`;
            }
            if (wizardPrevBtn) wizardPrevBtn.style.display = 'inline-flex';
        }
    });
});

// Update final summary details
function fillWizardSummary() {
    const activeServiceCard = document.querySelector('#booking-form [data-service].active');
    const svcName = activeServiceCard ? activeServiceCard.querySelector('span').textContent.split(' (')[0] : 'Wash Regular';
    
    const qtyText = `${wizardQty} ${wizardUnit}`;
    
    const dateVal = dateInput ? dateInput.value : '';
    const activeSlot = document.querySelector('.slot-grid .slot-btn.active');
    const slotText = activeSlot ? activeSlot.getAttribute('data-slot') : '09:00 - 12:00';
    
    let formattedDate = dateVal;
    if (dateVal) {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
            const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
            formattedDate = `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`;
        }
    }
    const scheduleText = `${formattedDate} (${slotText})`;
    
    let price = 8000;
    const svcType = activeServiceCard ? activeServiceCard.getAttribute('data-service') : 'regular';
    if (svcType === 'kilat') price = 15000;
    else if (svcType === 'dryclean') price = 25000;
    
    const finalTotal = price * wizardQty;
    
    const summarySvcEl = document.getElementById('wizard-summary-service');
    const summaryQtyEl = document.getElementById('wizard-summary-qty');
    const summarySchedEl = document.getElementById('wizard-summary-schedule');
    const summaryTotalEl = document.getElementById('wizard-summary-total');
    
    if (summarySvcEl) summarySvcEl.textContent = svcName;
    if (summaryQtyEl) summaryQtyEl.textContent = qtyText;
    if (summarySchedEl) summarySchedEl.textContent = scheduleText;
    if (summaryTotalEl) summaryTotalEl.textContent = `Rp ${finalTotal.toLocaleString('id-ID')}`;
    
    return {
        service: svcName,
        qty: qtyText,
        schedule: scheduleText,
        total: finalTotal,
        rawService: svcType,
        slot: slotText,
        date: dateVal
    };
}

// Next / prev navigation handlers
if (wizardPrevBtn) {
    wizardPrevBtn.addEventListener('click', () => {
        if (wizardStep > 1) {
            setWizardStep(wizardStep - 1);
        }
    });
}

// Timer QRIS
let qrisInterval;
function startQrisTimer() {
    const timerVal = document.getElementById('qris-timer-val');
    if (!timerVal) return;
    let sec = 900; 
    clearInterval(qrisInterval);
    
    qrisInterval = setInterval(() => {
        sec--;
        if (sec <= 0) {
            clearInterval(qrisInterval);
            timerVal.textContent = "EXPIRED";
        } else {
            const m = String(Math.floor(sec / 60)).padStart(2, '0');
            const s = String(sec % 60).padStart(2, '0');
            timerVal.textContent = `${m}:${s}`;
        }
    }, 1000);
}

if (wizardNextBtn) {
    wizardNextBtn.addEventListener('click', () => {
        if (wizardStep === 1) {
            setWizardStep(2);
        } else if (wizardStep === 2) {
            const addressVal = document.getElementById('wizard-address').value.trim();
            if (!addressVal) {
                alert("Silakan tulis alamat lengkap penjemputan Anda!");
                document.getElementById('wizard-address').focus();
                return;
            }
            if (!dateInput.value) {
                alert("Silakan pilih tanggal penjemputan!");
                dateInput.focus();
                return;
            }
            
            fillWizardSummary();
            setWizardStep(3);
        } else if (wizardStep === 3) {
            const summary = fillWizardSummary();
            const activePayCard = document.querySelector('.pay-card-grid .pay-card-btn.active');
            const activePay = activePayCard ? activePayCard.getAttribute('data-pay') : 'qris';
            
            if (activePay === 'cod') {
                wizardNextBtn.disabled = true;
                wizardNextBtn.innerHTML = `<i class="ph-bold ph-spinner-gap spinner"></i> Memproses...`;
                
                setTimeout(() => {
                    completeWizardBooking(summary, 'COD');
                }, 1500);
            } else {
                if (qrisView && qrisView.style.display === 'none') {
                    qrisView.style.display = 'flex';
                    startQrisTimer();
                    
                    if (wizardPrevBtn) wizardPrevBtn.style.display = 'none';
                    wizardNextBtn.innerHTML = `<i class="ph-bold ph-spinner-gap spinner"></i> Menunggu Pembayaran...`;
                    wizardNextBtn.disabled = true;
                    
                    // Simulate payment verification success
                    setTimeout(() => {
                        completeWizardBooking(summary, 'QRIS');
                    }, 5000);
                }
            }
        }
    });
}

function completeWizardBooking(summary, paymentType) {
    clearInterval(qrisInterval);
    
    // Generate Random Invoice ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `WB-${randomNum}`;
    
    // Create new booking object
    const newBooking = {
        id: invoiceId,
        service: summary.service,
        qty: summary.qty,
        schedule: summary.schedule,
        total: `Rp ${summary.total.toLocaleString('id-ID')}`,
        pay: paymentType,
        date: summary.date,
        slot: summary.slot,
        rawService: summary.rawService,
        status: 'Kurir Menjemput',
        timestamp: new Date().getTime()
    };
    
    // Save in LocalStorage
    const existingBookings = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('wb_bookings', JSON.stringify(existingBookings));
    
    resetWizardForm();
    closeBookingWizard();
    
    alert(`Pesanan Sukses Dibuat!\nID Pesanan Anda: ${invoiceId}\nMetode: ${paymentType}`);
    
    // Trigger Tracker automatically
    const trackInput = document.getElementById('track-search-input');
    if (trackInput) {
        trackInput.value = invoiceId;
        searchInvoiceTracker(invoiceId);
        
        const trackingSec = document.getElementById('tracking');
        if (trackingSec) {
            trackingSec.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function resetWizardForm() {
    wizardStep = 1;
    wizardQty = 3;
    wizardUnit = 'kg';
    
    const addressEl = document.getElementById('wizard-address');
    if (addressEl) addressEl.value = '';
    
    if (wizardNextBtn) {
        wizardNextBtn.disabled = false;
        wizardNextBtn.style.display = 'inline-flex';
    }
    if (wizardPrevBtn) {
        wizardPrevBtn.style.display = 'inline-flex';
    }
    
    if (qrisView) qrisView.style.display = 'none';
    clearInterval(qrisInterval);
}


// ============================================
// DYNAMIC TRACKER SEARCH
// ============================================
const trackSearchBtn = document.getElementById('btn-track-search');
const trackSearchInput = document.getElementById('track-search-input');
const trackWarningEl = document.getElementById('track-warning');
const trackVisualPanel = document.querySelector('.tracking-visual');

function searchInvoiceTracker(query) {
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return;
    
    if (trackWarningEl) trackWarningEl.style.display = 'none';
    
    if (cleanQuery === 'WB-2204') {
        renderHardcodedTracker();
        return;
    }
    
    const bookings = JSON.parse(localStorage.getItem('wb_bookings') || '[]');
    const matched = bookings.find(b => b.id.toUpperCase() === cleanQuery);
    
    if (matched) {
        renderDynamicTracker(matched);
    } else {
        if (trackWarningEl) {
            trackWarningEl.style.display = 'flex';
            trackWarningEl.style.animation = 'none';
            trackWarningEl.offsetHeight; 
            trackWarningEl.style.animation = 'shake 0.3s ease';
            
            setTimeout(() => {
                trackWarningEl.style.display = 'none';
            }, 4000);
        }
    }
}

if (trackSearchBtn) {
    trackSearchBtn.addEventListener('click', () => {
        searchInvoiceTracker(trackSearchInput.value);
    });
}
if (trackSearchInput) {
    trackSearchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            searchInvoiceTracker(trackSearchInput.value);
        }
    });
}

function renderHardcodedTracker() {
    if (trackVisualPanel) {
        trackVisualPanel.innerHTML = `
            <div class="track-panel">
              <div class="track-header">
                <h5><i class="ph-fill ph-map-pin" style="color:var(--blue-bright)"></i> &nbsp;Lacak Pesanan</h5>
                <span>#WB-2204</span>
              </div>

              <div class="tracker-steps">
                <div class="t-step done">
                  <div class="t-line"></div>
                  <div class="t-icon done"><i class="ph-bold ph-check"></i></div>
                  <div class="t-body">
                    <h4>Kurir Menjemput</h4>
                    <p>Selesai · 10:15 WIB</p>
                  </div>
                </div>
                <div class="t-step done">
                  <div class="t-line"></div>
                  <div class="t-icon done"><i class="ph-bold ph-check"></i></div>
                  <div class="t-body">
                    <h4>Pakaian Diterima</h4>
                    <p>Selesai · 10:48 WIB</p>
                  </div>
                </div>
                <div class="t-step active">
                  <div class="t-line"></div>
                  <div class="t-icon active"><i class="ph-bold ph-spinner-gap spinner"></i></div>
                  <div class="t-body">
                    <h4>Proses Pencucian</h4>
                    <p>Sedang dicuci &amp; dikeringkan…</p>
                  </div>
                </div>
                <div class="t-step pending">
                  <div class="t-icon pending"><i class="ph-bold ph-truck"></i></div>
                  <div class="t-body">
                    <h4>Dalam Perjalanan</h4>
                    <p>Estimasi: 15:00 WIB</p>
                  </div>
                </div>
              </div>

              <div class="track-eta">
                <i class="ph-fill ph-clock"></i>
                <div>
                  <h6>Estimasi Selesai</h6>
                  <p>Hari ini pukul 15:00 WIB · tersisa ~3 jam</p>
                </div>
              </div>
            </div>
        `;
    }
}

function renderDynamicTracker(booking) {
    if (trackVisualPanel) {
        const elapsed = new Date().getTime() - booking.timestamp;
        
        let step1Class = 'done';
        let step2Class = 'active';
        let step3Class = 'pending';
        let step4Class = 'pending';
        
        let step2Icon = '<i class="ph-bold ph-spinner-gap spinner"></i>';
        let step3Icon = '<i class="ph-bold ph-washing-machine"></i>';
        let step4Icon = '<i class="ph-bold ph-truck"></i>';
        
        let statusText = "Menunggu Kurir Penjemputan";
        let etaText = `Dijadwalkan jemput pada slot ${booking.slot}`;
        
        if (elapsed > 40000) {
            step1Class = 'done';
            step2Class = 'done';
            step3Class = 'active';
            step4Class = 'pending';
            step2Icon = '<i class="ph-bold ph-check"></i>';
            step3Icon = '<i class="ph-bold ph-spinner-gap spinner"></i>';
            statusText = "Sedang Proses Cuci";
            etaText = "Pakaian sedang dicuci bersih & higienis";
        }
        
        trackVisualPanel.innerHTML = `
            <div class="track-panel">
              <div class="track-header">
                <h5><i class="ph-fill ph-map-pin" style="color:var(--blue-bright)"></i> &nbsp;Lacak Pesanan</h5>
                <span>#${booking.id}</span>
              </div>
              
              <div style="background:rgba(20,184,166,0.1); border:1px solid rgba(20,184,166,0.2); border-radius:12px; padding:0.75rem; margin-bottom:1.25rem; font-size:0.78rem;">
                <span style="font-weight:700; color:#fff;">Layanan:</span> ${booking.service} (${booking.qty})
              </div>

              <div class="tracker-steps">
                <div class="t-step ${step1Class}">
                  <div class="t-line"></div>
                  <div class="t-icon done"><i class="ph-bold ph-check"></i></div>
                  <div class="t-body">
                    <h4>Pesanan Diterima</h4>
                    <p>Selesai · Pembayaran ${booking.pay}</p>
                  </div>
                </div>
                
                <div class="t-step ${step2Class}">
                  <div class="t-line"></div>
                  <div class="t-icon ${step2Class === 'done' ? 'done' : 'active'}">${step2Icon}</div>
                  <div class="t-body">
                    <h4>Kurir Penjemputan</h4>
                    <p>${step2Class === 'done' ? 'Selesai' : 'Kurir dalam perjalanan...'}</p>
                  </div>
                </div>
                
                <div class="t-step ${step3Class}">
                  <div class="t-line"></div>
                  <div class="t-icon ${step3Class === 'active' ? 'active' : 'pending'}">${step3Icon}</div>
                  <div class="t-body">
                    <h4>Proses Pencucian</h4>
                    <p>${step3Class === 'active' ? 'Sedang dicuci & disetrika...' : 'Menunggu antrean...'}</p>
                  </div>
                </div>
                
                <div class="t-step ${step4Class}">
                  <div class="t-icon pending">${step4Icon}</div>
                  <div class="t-body">
                    <h4>Pengantaran Kurir</h4>
                    <p>Estimasi slot pengantaran setelah dicuci</p>
                  </div>
                </div>
              </div>

              <div class="track-eta">
                <i class="ph-fill ph-info"></i>
                <div>
                  <h6>Status Layanan</h6>
                  <p>${statusText} · ${etaText}</p>
                </div>
              </div>
            </div>
        `;
    }
}


// ============================================
// FAQ ACCORDION LOGIC
// ============================================
const faqAccordionBtns = document.querySelectorAll('.faq-accordion-btn');

faqAccordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-accordion-item');
        const content = item.querySelector('.faq-accordion-content');
        const isActive = item.classList.contains('active');
        
        // Close all items
        document.querySelectorAll('.faq-accordion-item').forEach(otherItem => {
            otherItem.classList.remove('active');
            const otherContent = otherItem.querySelector('.faq-accordion-content');
            if (otherContent) otherContent.style.maxHeight = '0px';
        });
        
        // If it wasn't active, open it smoothly
        if (!isActive) {
            item.classList.add('active');
            if (content) content.style.maxHeight = `${content.scrollHeight}px`;
        }
    });
});


// ============================================
// TESTIMONIAL CAROUSEL SLIDER LOGIC
// ============================================
const sliderTrack = document.getElementById('testimonial-track');
const sliderPrevBtn = document.querySelector('.slider-arrow-btn.btn-prev');
const sliderNextBtn = document.querySelector('.slider-arrow-btn.btn-next');
const sliderDots = document.querySelectorAll('.slider-dot-btn');

let sliderIndex = 0;
const totalSlides = sliderDots.length;

function setSliderIndex(index) {
    sliderIndex = index;
    
    if (sliderTrack) {
        sliderTrack.style.transform = `translateX(-${index * 100}%)`;
    }
    
    sliderDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
    });
}

if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener('click', () => {
        const target = (sliderIndex - 1 + totalSlides) % totalSlides;
        setSliderIndex(target);
    });
}

if (sliderNextBtn) {
    sliderNextBtn.addEventListener('click', () => {
        const target = (sliderIndex + 1) % totalSlides;
        setSliderIndex(target);
    });
}

sliderDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-index'));
        setSliderIndex(target);
    });
});
