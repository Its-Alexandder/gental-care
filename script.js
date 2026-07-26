document.addEventListener('DOMContentLoaded', () => {
    // 1. Barra de Navegación Pegajosa (Sticky Nav)
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Menú de Navegación Móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileMenuBtn && mobileMenu && menuIcon) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                menuIcon.textContent = 'close';
            } else {
                mobileMenu.classList.add('hidden');
                menuIcon.textContent = 'menu';
            }
        });
    }

    // Función auxiliar para cerrar menú al dar clic en enlaces móviles
    window.toggleMenu = () => {
        if (mobileMenu && menuIcon) {
            mobileMenu.classList.add('hidden');
            menuIcon.textContent = 'menu';
        }
    };

    // 3. Animaciones de Entrada (Scroll Reveal)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Se activa un poco antes de ingresar
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Solo se anima una vez
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Controlador de Sliders Antes/Después (Before & After Slider con ResizeObserver)
    function initBeforeAfterSliders() {
        const sliders = document.querySelectorAll('.slider-container');

        sliders.forEach(slider => {
            const beforeImg = slider.querySelector('.before-img');
            const afterImg = slider.querySelector('.after-img');
            const wrapper = slider.querySelector('.after-wrapper');
            const handle = slider.querySelector('.slider-handle');

            if (!wrapper || !afterImg || !handle) return;

            // Ajusta el tamaño de la imagen "Antes" y "Después" para lograr el efecto de slider interactivo
            // a partir de una imagen que ya está dividida a la mitad verticalmente.
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const sliderWidth = entry.contentRect.width;
                    if (sliderWidth > 0) {
                        // La imagen "Antes" muestra la mitad izquierda (ancho doble, alineada a la izquierda)
                        if (beforeImg) {
                            beforeImg.style.width = `${sliderWidth * 2}px`;
                            beforeImg.style.left = '0px';
                        }
                        // La imagen "Después" muestra la mitad derecha (ancho doble, desplazada a la izquierda)
                        afterImg.style.width = `${sliderWidth * 2}px`;
                        afterImg.style.left = `-${sliderWidth}px`;
                    }
                }
            });
            resizeObserver.observe(slider);

            let isDragging = false;

            function positionSlider(clientX) {
                const rect = slider.getBoundingClientRect();
                let offsetX = clientX - rect.left;

                // Restringir entre 0 y el ancho del slider
                if (offsetX < 0) offsetX = 0;
                if (offsetX > rect.width) offsetX = rect.width;

                const percentage = (offsetX / rect.width) * 100;
                
                // Mueve la máscara recortada y la barra del controlador
                wrapper.style.width = `${percentage}%`;
                handle.style.left = `${percentage}%`;
            }

            // Eventos de Mouse
            slider.addEventListener('mousedown', (e) => {
                isDragging = true;
                positionSlider(e.clientX);
                e.preventDefault(); // Evita arrastre nativo de la imagen
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                positionSlider(e.clientX);
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });

            slider.addEventListener('mouseleave', () => {
                isDragging = false;
            });

            // Eventos Táctiles (Móvil)
            slider.addEventListener('touchstart', (e) => {
                isDragging = true;
                if (e.touches && e.touches[0]) {
                    positionSlider(e.touches[0].clientX);
                }
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                if (e.touches && e.touches[0]) {
                    positionSlider(e.touches[0].clientX);
                }
            }, { passive: true });

            window.addEventListener('touchend', () => {
                isDragging = false;
            });
        });
    }

    // 5. Carrusel 3D Estilo Cover Flow para Móvil (Como la foto adjunta)
    function initCoverFlowCarousel() {
        const container = document.getElementById('coverflow-container');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const dots = document.querySelectorAll('#carousel-dots button');
        const slides = document.querySelectorAll('.coverflow-slide');
        
        if (!container || slides.length === 0) return;

        let currentIndex = 0;
        const total = slides.length;

        function updateCoverflow() {
            const isTablet = window.innerWidth >= 640;
            const offset = isTablet ? '48%' : '32%';
            const sideScale = isTablet ? '0.82' : '0.75';

            slides.forEach((slide, i) => {
                let diff = i - currentIndex;
                if (diff < -1) diff += total;
                if (diff > 1) diff -= total;

                if (diff === 0) {
                    // Centro: Destacado, tamaño principal, al frente
                    slide.style.transform = 'translateX(0) scale(1)';
                    slide.style.zIndex = '30';
                    slide.style.opacity = '1';
                    slide.style.filter = 'brightness(1)';
                    slide.style.pointerEvents = 'auto';
                } else if (diff === -1) {
                    // Izquierda: Más pequeño, detrás, ligeramente oscurecido (Espaciado simétrico)
                    slide.style.transform = `translateX(-${offset}) scale(${sideScale})`;
                    slide.style.zIndex = '10';
                    slide.style.opacity = '0.75';
                    slide.style.filter = 'brightness(0.65)';
                    slide.style.pointerEvents = 'auto';
                } else if (diff === 1) {
                    // Derecha: Más pequeño, detrás, ligeramente oscurecido (Espaciado simétrico)
                    slide.style.transform = `translateX(${offset}) scale(${sideScale})`;
                    slide.style.zIndex = '10';
                    slide.style.opacity = '0.75';
                    slide.style.filter = 'brightness(0.65)';
                    slide.style.pointerEvents = 'auto';
                } else {
                    slide.style.transform = 'translateX(0) scale(0.5)';
                    slide.style.zIndex = '0';
                    slide.style.opacity = '0';
                    slide.style.pointerEvents = 'none';
                }
            });

            // Actualizar indicadores (dots)
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.classList.add('bg-primary');
                    dot.classList.remove('bg-outline-variant');
                } else {
                    dot.classList.remove('bg-primary');
                    dot.classList.add('bg-outline-variant');
                }
            });
        }

        // Clic en diapositivas individuales para activarlas
        slides.forEach((slide) => {
            slide.addEventListener('click', () => {
                const idx = parseInt(slide.getAttribute('data-index'), 10);
                currentIndex = idx;
                updateCoverflow();
            });
        });

        // Botones de navegación
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex + 1) % total;
                updateCoverflow();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex - 1 + total) % total;
                updateCoverflow();
            });
        }

        // Dots
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(dot.getAttribute('data-index'), 10);
                currentIndex = index;
                updateCoverflow();
            });
        });

        // Soporte para gestos táctiles (Swipe)
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const threshold = 40;
            if (touchStartX - touchEndX > threshold) {
                currentIndex = (currentIndex + 1) % total;
                updateCoverflow();
            } else if (touchEndX - touchStartX > threshold) {
                currentIndex = (currentIndex - 1 + total) % total;
                updateCoverflow();
            }
        }, { passive: true });

        // Inicializar 3D Coverflow
        updateCoverflow();
        window.addEventListener('resize', updateCoverflow);
    }

    // Inicialización general
    initBeforeAfterSliders();
    initCoverFlowCarousel();
});
