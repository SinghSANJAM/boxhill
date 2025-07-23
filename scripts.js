document.addEventListener('DOMContentLoaded', () => {
    // Preloader Logic
    if (sessionStorage.getItem('preloaderShown') !== 'true') {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
        document.body.classList.add('preloading');
        document.querySelectorAll('.site-header, .hero-slider, section, footer').forEach((el) => {
          el.style.display = 'none';
        });
  
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            preloader.style.opacity = '0';
            setTimeout(() => {
              preloader.style.display = 'none';
              document.body.classList.remove('preloading');
              document.querySelectorAll('.site-header, .hero-slider, section, footer').forEach((el) => {
                el.style.display = '';
              });
              sessionStorage.setItem('preloaderShown', 'true');
            }, 300);
          }
        }, 50);
      }
    } else {
      const preloader = document.querySelector('.preloader');
      if (preloader) {
        preloader.style.display = 'none';
      }
      document.body.classList.remove('preloading');
      document.querySelectorAll('.site-header, .hero-slider, section, footer').forEach((el) => {
        el.style.display = '';
      });
    }
  
    // Constants
    const SLIDE_INTERVAL = 8000;
    const DEBOUNCE_DELAY = 200;
  
    // Utility: Debounce
    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), delay);
      };
    };
  
    // Preload Images
    const preloadImages = (slides) => {
      slides.forEach(slide => {
        const img = slide.querySelector('img');
        if (img) {
          const preloadImg = new Image();
          preloadImg.src = img.src;
          preloadImg.onerror = () => {
            console.warn(`Failed to preload image: ${img.src}`);
            img.src = 'images/fallback.jpg'; // Ensure fallback image exists
          };
        }
      });
    };
  
    // Hero Slider
    const initSlider = () => {
      const slides = document.querySelectorAll('.hero-slider .slide');
      const dots = document.querySelectorAll('.slider-dots .dot');
      const prevButton = document.querySelector('.prev-slide');
      const nextButton = document.querySelector('.next-slide');
      const sliderContainer = document.querySelector('.slider-container');
      let currentSlide = 0;
      let slideInterval;
  
      if (!slides.length || !dots.length || !prevButton || !nextButton || !sliderContainer) {
        console.error('Slider elements missing:', {
          slides: slides.length,
          dots: dots.length,
          prevButton,
          nextButton,
          sliderContainer,
        });
        return;
      }
  
      preloadImages(slides);
  
      const resetSlides = () => {
        slides.forEach(slide => {
          slide.classList.remove('active');
          slide.style.display = 'none';
          const img = slide.querySelector('img');
          if (img) {
            img.style.transition = 'none';
            img.style.transform = 'scale(1.2)';
          }
        });
        dots.forEach(dot => dot.classList.remove('active'));
      };
  
      const showSlide = (index) => {
        clearInterval(slideInterval);
        currentSlide = (index + slides.length) % slides.length;
        resetSlides();
  
        const newSlide = slides[currentSlide];
        newSlide.classList.add('active');
        newSlide.style.display = 'block';
        dots[currentSlide].classList.add('active');
  
        const img = newSlide.querySelector('img');
        if (img) {
          img.offsetHeight;
          requestAnimationFrame(() => {
            img.style.transition = 'transform 2s ease-in-out';
            img.style.transform = 'scale(1)';
          });
        }
  
        slideInterval = setInterval(nextSlide, SLIDE_INTERVAL);
      };
  
      const nextSlide = () => showSlide(currentSlide + 1);
      const prevSlide = () => showSlide(currentSlide - 1);
  
      prevButton.addEventListener('click', debounce(prevSlide, DEBOUNCE_DELAY));
      nextButton.addEventListener('click', debounce(nextSlide, DEBOUNCE_DELAY));
  
      dots.forEach((dot, i) => {
        dot.addEventListener('click', debounce(() => {
          if (i !== currentSlide) showSlide(i);
        }, DEBOUNCE_DELAY));
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (i !== currentSlide) showSlide(i);
          }
        });
      });
  
      sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchMoved = false;
      });
      sliderContainer.addEventListener('touchmove', () => {
        touchMoved = true;
      });
      sliderContainer.addEventListener('touchend', (e) => {
        if (touchMoved) {
          const touchEndX = e.changedTouches[0].clientX;
          const deltaX = touchEndX - touchStartX;
          if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) nextSlide();
            else prevSlide();
          }
        }
      });
  
      showSlide(0);
      slideInterval = setInterval(nextSlide, SLIDE_INTERVAL);
    };
  
    // Magazine Section Carousels
    const initCarousels = () => {
      const carousels = document.querySelectorAll('.magazine-carousel');
      carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const dots = carousel.querySelectorAll('.carousel-dots .carousel-dot');
        const prevButton = carousel.querySelector('.carousel-prev');
        const nextButton = carousel.querySelector('.carousel-next');
        let currentIndex = 0;
        let slideInterval;
  
        if (slides.length === 0 || dots.length === 0) {
          console.warn('Carousel initialization skipped: missing slides or dots', carousel);
          return;
        }
  
        preloadImages(slides);
  
        const showCarouselSlide = (index) => {
          currentIndex = (index + slides.length) % slides.length;
  
          slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === currentIndex);
            slide.style.display = i === currentIndex ? 'block' : 'none';
            slide.setAttribute('aria-hidden', i !== currentIndex);
          });
  
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
            dot.setAttribute('aria-selected', i === currentIndex);
          });
  
          clearInterval(slideInterval);
          slideInterval = setInterval(nextCarouselSlide, 5000);
        };
  
        const nextCarouselSlide = () => showCarouselSlide(currentIndex + 1);
        const prevCarouselSlide = () => showCarouselSlide(currentIndex - 1);
  
        carousel.addEventListener('mouseenter', () => clearInterval(slideInterval));
        carousel.addEventListener('mouseleave', () => {
          slideInterval = setInterval(nextCarouselSlide, 5000);
        });
  
        if (nextButton && prevButton) {
          nextButton.addEventListener('click', debounce(nextCarouselSlide, DEBOUNCE_DELAY));
          prevButton.addEventListener('click', debounce(prevCarouselSlide, DEBOUNCE_DELAY));
        }
  
        dots.forEach((dot, i) => {
          dot.addEventListener('click', debounce(() => showCarouselSlide(i), DEBOUNCE_DELAY));
          dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              showCarouselSlide(i);
            }
          });
        });
  
        showCarouselSlide(0);
        slideInterval = setInterval(nextCarouselSlide, 5000);
      });
    };
  
    // Gallery Modal
    const initGallery = () => {
      const galleryItems = document.querySelectorAll('.gallery-item');
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <img src="" alt="">
          <p></p>
          <button aria-label="Close Modal">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
      const modalImg = modal.querySelector('img');
      const modalCaption = modal.querySelector('p');
      const closeButton = modal.querySelector('button');
  
      galleryItems.forEach((item) => {
        item.addEventListener('click', () => {
          const img = item.querySelector('img');
          const caption = item.querySelector('.gallery-caption');
          modalImg.src = img.src;
          modalImg.alt = img.alt;
          modalCaption.textContent = caption.textContent;
          modal.classList.add('active');
        });
      });
  
      closeButton.addEventListener('click', () => modal.classList.remove('active'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    };
  
    // Mobile Menu and Dropdown Accessibility
    const initMobileMenu = () => {
      const toggle = document.querySelector('.mobile-menu-toggle');
      const nav = document.querySelector('.nav-container');
      const dropdowns = document.querySelectorAll('.has-dropdown');
  
      if (!toggle || !nav) return;
  
      toggle.addEventListener('click', () => {
        const isActive = nav.classList.toggle('active');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isActive);
      });
  
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isActive = nav.classList.toggle('active');
          toggle.classList.toggle('active');
          toggle.setAttribute('aria-expanded', isActive);
        }
      });
  
      dropdowns.forEach((dropdown) => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (!link || !menu) return;
  
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            const isExpanded = menu.style.display === 'block';
            menu.style.display = isExpanded ? 'none' : 'block';
            link.setAttribute('aria-expanded', !isExpanded);
          }
        });
  
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const isExpanded = menu.style.display === 'block';
            menu.style.display = isExpanded ? 'none' : 'block';
            link.setAttribute('aria-expanded', !isExpanded);
          }
        });
      });
    };
  
    // Initialize Functions
    initSlider();
    initCarousels();
    initGallery();
    initMobileMenu();
  });