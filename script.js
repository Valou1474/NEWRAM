document.addEventListener('DOMContentLoaded', () => {

    // --- 0. LOAD DATA (Premium) ---
    if (typeof RAME_DATA !== 'undefined') {
        populateData(RAME_DATA);
    } else {
        console.error('RAME_DATA not found. Check data.js');
    }

    function populateData(data) {
        // Production Page
        if (window.location.pathname.includes('production.html')) {
            const blocks = document.querySelectorAll('.text-block');
            if (blocks.length >= 3 && data.production) {
                data.production.forEach((item, index) => {
                    if (blocks[index]) {
                        blocks[index].querySelector('h2').textContent = item.title;
                        blocks[index].querySelector('p').textContent = item.text;
                    }
                });
            }
        }

        // Apropos Page
        if (window.location.pathname.includes('apropos.html')) {
            if (data.apropos && data.apropos.intro) {
                const introBlock = document.querySelector('.content-section .text-block:first-child');
                if (introBlock) {
                    introBlock.querySelector('h2').textContent = data.apropos.intro.title;
                    introBlock.querySelector('p').textContent = data.apropos.intro.text;
                }
            }
            if (data.apropos && data.apropos.team) {
                const teamGrid = document.querySelector('.team-grid');
                if (teamGrid) {
                    teamGrid.innerHTML = ''; // Clear existing
                    data.apropos.team.forEach(member => {
                        const memberDiv = document.createElement('div');
                        memberDiv.className = 'team-member reveal-scroll'; // Add Reveal Class

                        // Generate socials HTML
                        let socialsHtml = '';
                        if (member.socials) {
                            for (const [network, link] of Object.entries(member.socials)) {
                                let iconClass = 'fas fa-link';
                                if (network === 'instagram') iconClass = 'fab fa-instagram';
                                if (network === 'linkedin') iconClass = 'fab fa-linkedin';
                                if (network === 'vimeo') iconClass = 'fab fa-vimeo-v';
                                if (network === 'twitter') iconClass = 'fab fa-twitter';

                                socialsHtml += `<a href="${link}" class="team-social-link" target="_blank" aria-label="${network}"><i class="${iconClass}"></i></a>`;
                            }
                        }

                        memberDiv.innerHTML = `
                            <div class="team-image-wrapper">
                                <img src="${member.image}" alt="${member.name}" loading="lazy">
                                <div class="team-social-overlay">
                                    ${socialsHtml}
                                </div>
                            </div>
                            <h3>${member.name}</h3>
                            <p>${member.role}</p>
                        `;
                        teamGrid.appendChild(memberDiv);

                        // Observe new dynamic element immediately
                        if (window.sharedObserver) {
                            window.sharedObserver.observe(memberDiv);
                        }
                    });
                }
            }
        }

        // Contact Page
        if (window.location.pathname.includes('contact.html')) {
            if (data.contact) {
                const details = document.querySelector('.contact-details');
                if (details) {
                    details.innerHTML = `
                        <p><a href="mailto:${data.contact.email}">${data.contact.email}</a></p>
                        <p><a href="tel:${data.contact.phone}">${data.contact.phone}</a></p>
                        <p>${data.contact.address}</p>
                    `;
                }
            }
        }
    }


    // --- 1. PREMIUM AMBIANCE (Custom Cursor) ---
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // Variables état
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let cursorWidth = 30;
    let cursorHeight = 30;
    let hoveredElement = null;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Add listeners to static elements
    const hoverElements = document.querySelectorAll('a, button, .btn-scroll');
    hoverElements.forEach(el => {
        addHoverListeners(el);
    });

    // Helper to add listeners (useful for dynamic content)
    function addHoverListeners(el) {
        el.addEventListener('mouseenter', () => {
            hoveredElement = el;
            cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            hoveredElement = null;
            cursor.classList.remove('hovered');
        });
    }

    // Animation Loop
    function animateCursor() {
        let savedX = mouseX;
        let savedY = mouseY;
        let savedW = 30;
        let savedH = 30;
        let savedR = 50; // %

        if (hoveredElement) {
            const rect = hoveredElement.getBoundingClientRect();
            savedX = rect.left + rect.width / 2;
            savedY = rect.top + rect.height / 2;
            savedW = rect.width + 10;
            savedH = rect.height + 10;

            if (hoveredElement.classList.contains('btn-scroll') || hoveredElement.classList.contains('team-member')) {
                // Keep shape or adapt
            } else {
                savedR = 10;
            }

            if (getComputedStyle(hoveredElement).borderRadius.includes('50%')) {
                savedR = 50;
            } else {
                savedR = 4;
            }
        }

        const speed = 0.4;
        cursorX += (savedX - cursorX) * speed;
        cursorY += (savedY - cursorY) * speed;
        cursorWidth += (savedW - cursorWidth) * speed;
        cursorHeight += (savedH - cursorHeight) * speed;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        cursor.style.width = cursorWidth + 'px';
        cursor.style.height = cursorHeight + 'px';

        if (savedR === 50) {
            cursor.style.borderRadius = '50%';
        } else {
            cursor.style.borderRadius = '8px';
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();


    // --- 2. SMOOTH SCROLL (Lenis) & VIDEO EFFECT ---
    const videoContainer = document.querySelector('.video-bg-container');
    let lenis;

    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            updateVideoEffect(lenis.scroll);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    } else {
        window.addEventListener('scroll', () => {
            updateVideoEffect(window.scrollY);
        });
    }

    function updateVideoEffect(scrollY) {
        if (videoContainer) {
            const viewportHeight = window.innerHeight;
            const progress = Math.min(scrollY / viewportHeight, 1);
            const opacity = 1 - (progress * 0.8);
            const blur = progress * 10;

            videoContainer.style.opacity = opacity;
            videoContainer.style.filter = `blur(${blur}px)`;
        }
    }


    // --- 3. SCROLL OBSERVER (SHARED & SINGLE) ---
    // Defined globally effectively to be used by dynamic content
    window.sharedObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15 });

    // Initial Observation (Static Content)
    const textBlocks = document.querySelectorAll('.text-block');
    textBlocks.forEach(block => {
        // Classes .reveal-text are hardcoded in HTML for stability, but we can double check
        const h2 = block.querySelector('h2');
        const p = block.querySelector('p');
        if (h2) h2.classList.add('reveal-text');
        if (p) p.classList.add('reveal-text');

        window.sharedObserver.observe(block);
    });

    const scrollItems = document.querySelectorAll('.reveal-scroll');
    scrollItems.forEach(item => window.sharedObserver.observe(item));


    // --- 4. PRELOADER & TRANSITIONS ---

    // A. PRELOADER (Si présent, ex: index.html)
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        const pLogo = preloader.querySelector('.preloader-logo img');
        const pCounter = preloader.querySelector('.preloader-counter');

        setTimeout(() => {
            if (pLogo) {
                pLogo.style.transition = 'opacity 1s ease, transform 1s ease';
                pLogo.style.opacity = '1';
                pLogo.style.transform = 'scale(1)';
            }
            if (pCounter) pCounter.style.opacity = '1';
        }, 100);

        let count = 0;
        if (pCounter) {
            const counterInterval = setInterval(() => {
                count += Math.floor(Math.random() * 10) + 5;
                if (count > 100) count = 100;
                pCounter.textContent = count + '%';
                if (count === 100) clearInterval(counterInterval);
            }, 100);
        }

        setTimeout(() => {
            preloader.style.transition = 'transform 0.8s cubic-bezier(0.7, 0, 0.3, 1)';
            preloader.style.transform = 'translateY(-100%)';
        }, 2200);
    }

    // Body Loaded Class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);


    // B. LINK INTERCEPTION (Rideau Transition)
    const links = document.querySelectorAll('a');
    const curtain = document.querySelector('.page-curtain');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !link.target) {
                e.preventDefault();

                if (curtain) {
                    curtain.style.transition = 'height 0.6s cubic-bezier(0.7, 0, 0.3, 1)';
                    curtain.style.height = '100%';
                    curtain.style.bottom = '0';
                } else {
                    document.body.style.opacity = 0;
                }

                setTimeout(() => {
                    window.location.href = href;
                }, 700);
            }
        });
    });


    // --- 5. LOGIC UTILITIES ---

    // Smooth Scroll to #content for Buttons
    const scrollButtons = document.querySelectorAll('.btn-scroll');
    scrollButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = document.getElementById('content');
            if (content) {
                if (typeof lenis !== 'undefined') {
                    lenis.scrollTo(content);
                } else {
                    content.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });


    // --- 6. VIDEO LIGHTBOX LOGIC ---
    if (document.querySelector('.projects-grid')) {
        if (!document.querySelector('.video-modal')) {
            const modalHTML = `
                <div class="video-modal">
                    <div class="video-modal-content">
                        <button class="video-modal-close"><i class="fas fa-times"></i></button>
                        <div class="video-container-iframe"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const modal = document.querySelector('.video-modal');
        const modalContent = modal.querySelector('.video-container-iframe');
        const closeBtn = modal.querySelector('.video-modal-close');

        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.getAttribute('data-video-type');
                const id = card.getAttribute('data-video-id');

                if (type && id) {
                    let iframeSrc = '';
                    if (type === 'youtube') {
                        iframeSrc = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&showinfo=0`;
                    } else if (type === 'vimeo') {
                        iframeSrc = `https://player.vimeo.com/video/${id}?autoplay=1&color=ffffff&title=0&byline=0&portrait=0`;
                    }

                    modalContent.innerHTML = `<iframe src="${iframeSrc}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
                    modal.classList.add('active');

                    if (typeof lenis !== 'undefined') lenis.stop();
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        function closeModal() {
            modal.classList.remove('active');
            setTimeout(() => {
                modalContent.innerHTML = '';
            }, 300);
            if (typeof lenis !== 'undefined') lenis.start();
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

});
