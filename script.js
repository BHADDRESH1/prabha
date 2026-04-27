/* 
  Prabha Agencies - Main Script (V3 - Split Projects & Gallery)
*/
import { supabase } from "./src/supabase.js";

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const projectsContainer = document.getElementById('projects-container');
    const galleryGrid = document.getElementById('galleryGrid');

    // 1. Sticky Navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 2. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Default Data
    const defaultProjects = [
        {
            id: 1,
            title: "Villa, Madampakkam",
            description: "Elegant 3BHK completed with premium building materials and luxury finishes.",
            images: ["assets/villa.png", "assets/hero.png"],
            category: "construction",
            status: "Completed"
        },
        {
            id: 2,
            title: "Residential Complex",
            description: "Modern multi-story steel frame structure with a sophisticated facade.",
            images: ["assets/residential.png"],
            category: "construction",
            status: "Completed"
        }
    ];

    const defaultGallery = [
        {
            id: 101,
            title: "Interior Finishing",
            description: "Detailed view of our interior finishing work.",
            images: ["assets/hero.png", "assets/villa.png"],
            category: "interiors"
        },
        {
            id: 102,
            title: "Construction Material",
            description: "Quality bricks and cement supply.",
            images: ["assets/place.jpeg"],
            category: "construction"
        }
    ];

    // 4. Rendering Functions
    function renderProjects(projects) {
        if (!projectsContainer) return;
        projectsContainer.innerHTML = '';
        
        projects.forEach((project) => {
            const projectImages = project.images || ['assets/hero.png'];
            const hasMultiple = projectImages.length > 1;
            
            let sliderHtml = '';
            if (hasMultiple) {
                sliderHtml = `
                    <div class="project-img-container" id="slider-${project.id}">
                        <div class="carousel-track">
                            ${projectImages.map(img => `<div class="calendar-slide"><img src="${img}" alt="Project"></div>`).join('')}
                        </div>
                        <button class="slider-btn prev-btn" onclick="changeSlide(${project.id}, -1)"><i class="fas fa-chevron-left"></i></button>
                        <button class="slider-btn next-btn" onclick="changeSlide(${project.id}, 1)"><i class="fas fa-chevron-right"></i></button>
                        <div class="slider-dots">
                            ${projectImages.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${project.id}, ${i})"></div>`).join('')}
                        </div>
                    </div>
                `;
            } else {
                sliderHtml = `
                    <div class="project-img-container">
                        <img src="${projectImages[0]}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                `;
            }

            const projectCard = document.createElement('div');
            projectCard.className = 'project-card scroll-reveal';
            projectCard.innerHTML = `
                ${sliderHtml}
                <div class="project-info">
                    <span class="project-tag">${project.status || 'Project'}</span>
                    <h3>${project.title}</h3>
                    <p>${project.description || ''}</p>
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });
        observeElements();
    }

    function renderGallery(galleryItems) {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';
        
        galleryItems.forEach(item => {
            const images = item.images || ['assets/hero.png'];
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item scroll-reveal';
            galleryItem.dataset.category = item.category || 'construction';
            galleryItem.dataset.images = JSON.stringify(images);
            galleryItem.dataset.title = item.title;
            
            galleryItem.innerHTML = `
                <div class="gallery-img-wrap">
                    <img src="${images[0]}" alt="${item.title}" loading="lazy">
                    <div class="gallery-overlay">
                        <div class="gallery-overlay-inner">
                            <i class="fas fa-expand-alt"></i>
                            <span>View Image</span>
                        </div>
                    </div>
                </div>
                <p class="gallery-caption">${item.title}</p>
            `;
            galleryGrid.appendChild(galleryItem);
        });
        
        initGallery(); // Re-init lightbox logic
        observeElements();
    }

    // 5. Data Loading
    async function loadData() {
        try {
            const { data: projectsData, error: projectsError } = await supabase.from('projects').select('*');
            if (projectsError) throw projectsError;

            const { data: galleryData, error: galleryError } = await supabase.from('gallery').select('*');
            if (galleryError) throw galleryError;

            if (!projectsData || projectsData.length === 0) {
                 const container = document.getElementById('projects-container');
                 if (container) container.innerHTML = '<p style="text-align:center; width:100%; color:#666;">No projects yet</p>';
            } else {
                 renderProjects(projectsData);
            }

            if (!galleryData || galleryData.length === 0) {
                 const gGrid = document.getElementById('galleryGrid');
                 if (gGrid) gGrid.innerHTML = '<p style="text-align:center; width:100%; color:#666;">No images available</p>';
            } else {
                 renderGallery(galleryData);
            }

        } catch (error) {
            console.error("Failed to load data from Supabase.", error);
        }
    }

    // 6. Project Carousel Controls
    window.projectSlides = {};
    window.changeSlide = function(projectId, direction) {
        if (!window.projectSlides[projectId]) window.projectSlides[projectId] = 0;
        const slider = document.getElementById(`slider-${projectId}`);
        const track = slider.querySelector('.carousel-track');
        const total = track.querySelectorAll('.calendar-slide').length;
        window.projectSlides[projectId] = (window.projectSlides[projectId] + direction + total) % total;
        updateSliderUI(projectId);
    };
    window.goToSlide = function(projectId, index) {
        window.projectSlides[projectId] = index;
        updateSliderUI(projectId);
    };
    function updateSliderUI(projectId) {
        const index = window.projectSlides[projectId] || 0;
        const slider = document.getElementById(`slider-${projectId}`);
        const track = slider.querySelector('.carousel-track');
        const dots = slider.querySelectorAll('.dot');
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    // 7. Gallery Lightbox Logic
    function initGallery() {
        const filterBtns = document.querySelectorAll('.gallery-filter-btn');
        const items = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('galleryLightbox');
        const lbImg = document.getElementById('lightboxImg');
        const lbTitle = document.getElementById('lightboxTitle');
        const lbCounter = document.getElementById('lightboxCounter');
        const lbPrev = document.getElementById('lightboxPrev');
        const lbNext = document.getElementById('lightboxNext');
        const lbClose = document.getElementById('lightboxClose');
        const lbBackdrop = document.getElementById('lightboxBackdrop');

        let currentItemImages = [];
        let currentImgIndex = 0;

        // Filtering
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                items.forEach(item => {
                    const show = filter === 'all' || item.dataset.category === filter;
                    item.classList.toggle('hidden', !show);
                });
            });
        });

        // Lightbox Open
        items.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('hidden')) return;
                currentItemImages = JSON.parse(item.dataset.images);
                currentImgIndex = 0;
                openLightbox(item.dataset.title);
            });
        });

        function openLightbox(title) {
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
            updateLightboxContent(title);
        }

        function updateLightboxContent(title) {
            const src = currentItemImages[currentImgIndex];
            lbImg.style.opacity = '0';
            lbImg.src = src;
            lbImg.onload = () => lbImg.style.opacity = '1';
            lbTitle.textContent = `${title} ${currentItemImages.length > 1 ? `(${currentImgIndex + 1}/${currentItemImages.length})` : ''}`;
            lbCounter.textContent = `${currentImgIndex + 1} / ${currentItemImages.length}`;
            
            // Toggle arrows based on image count
            const showArrows = currentItemImages.length > 1;
            lbPrev.style.display = showArrows ? 'flex' : 'none';
            lbNext.style.display = showArrows ? 'flex' : 'none';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        lbPrev.onclick = (e) => { e.stopPropagation(); currentImgIndex = (currentImgIndex - 1 + currentItemImages.length) % currentItemImages.length; updateLightboxContent(lbTitle.textContent.split(' (')[0]); };
        lbNext.onclick = (e) => { e.stopPropagation(); currentImgIndex = (currentImgIndex + 1) % currentItemImages.length; updateLightboxContent(lbTitle.textContent.split(' (')[0]); };
        lbClose.onclick = closeLightbox;
        lbBackdrop.onclick = closeLightbox;

        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft' && currentItemImages.length > 1) lbPrev.click();
            if (e.key === 'ArrowRight' && currentItemImages.length > 1) lbNext.click();
        });
    }

    // 8. Scroll Reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });

    function observeElements() {
        document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
    }

    // 9. Initial Load
    loadData();
    observeElements();

    // Promotional Video Play Functionality
    const promoVideo = document.getElementById('promoVideo');
    const playBtn = document.getElementById('playBtn');
    const videoOverlay = document.getElementById('videoOverlay');

    if (playBtn && promoVideo && videoOverlay) {
        playBtn.addEventListener('click', () => {
            promoVideo.muted = false; // Unmute video on click
            promoVideo.controls = true; // Ensure controls are shown
            promoVideo.play().then(() => {
                videoOverlay.classList.add('hidden'); // Hide overlay after successful play
            }).catch(error => {
                console.error("Video playback failed:", error);
            });
        });

        // Safety: Always unmute when the video starts playing
        promoVideo.addEventListener('play', () => {
            promoVideo.muted = false;
        });

        // Pause video when out of viewport
        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting && !promoVideo.paused) {
                    promoVideo.pause();
                }
            });
        }, { threshold: 0 }).observe(promoVideo);
    }

    // Listen for changes from Admin (removed for backend)
    // Removed storage event listener since we are not using localStorage anymore.

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.querySelector("input[placeholder='Your Name']").value;
            const contactNumber = document.querySelector("input[placeholder='Your Contact Number']").value;
            const message = document.querySelector("textarea").value;

            const { data, error } = await supabase
                .from("contacts")
                .insert([{ name, email: contactNumber, message }]);

            if (error) {
                alert("Error sending message");
                console.log(error);
            } else {
                alert("Message sent successfully ✅");
                contactForm.reset();
            }
        });
    }

    // 10. Dealer Mobile Auto-Scroll (High performance transform version)
    if (window.innerWidth <= 768) {
        const track = document.getElementById('dealerTrack');
        if (track) {
            let position = 0;
            let speed = 0.6; // Focused only on mobile performance

            function autoScrollDealers() {
                position -= speed;
                // Infinite loop point (when 50% reached, as cards are duplicated)
                if (Math.abs(position) >= (track.scrollWidth / 2)) {
                    position = 0;
                }
                track.style.transform = `translateX(${position}px)`;
                requestAnimationFrame(autoScrollDealers);
            }
            autoScrollDealers();
        }
    }
});
