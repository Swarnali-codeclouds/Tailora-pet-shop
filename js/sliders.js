// ===========================================
// JQUERY SLIDERS AND PLUGINS
// ===========================================
$(document).ready(function () {
  // Enhanced slider initialization with error handling
  function initializeSlider(selector, options) {
    try {
      const $slider = $(selector);
      if ($slider.length > 0) {
        if ($slider.hasClass('slick-initialized')) {
          $slider.slick('unslick');
        }
        $slider.slick(options);
      }
    } catch (error) {
      console.error(`❌ Error initializing slider ${selector}:`, error);
    }
  }

  // Category Slider
  initializeSlider('.category-slider', {
    slidesToShow: 6,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    speed: 500,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1400, settings: { slidesToShow: 5, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 1 } }
    ]
  });

  // Product Slider
  initializeSlider('.productSliderOne', {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    speed: 500,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } }
    ]
  });
  // Product Slider
  initializeSlider('.productSliderDeal', {
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    speed: 500,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  });
  // Testimonial Slider
  initializeSlider('.testimonial-sliders', {
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    speed: 500,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 1, slidesToScroll: 1 , dots: false} }
    ]
  });

  //product related Slider
  initializeSlider('.product-related-slider', {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    speed: 500,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'ease-in-out',
  });

  // Hero/Banner Slider
  initializeSlider('.hero-slider, .banner-slider', {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    speed: 600,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: 'ease-in-out'
  });
  $("#toggle-password").on('click', function () {
            try {
                const $this = $(this);
                const $input = $($this.attr("toggle"));
                if ($input.length > 0) {
                    const isPassword = $input.attr("type") === "password";
                    $input.attr("type", isPassword ? "text" : "password");
                    $this.toggleClass("fa-eye fa-eye-slash");
                }
            } catch (error) {
                console.error("Error toggling password:", error);
            }
        });

  // Enhanced form validation (skip on login.html)
  if (!window.location.pathname.endsWith('login.html')) {
    $('form').on('submit', function(e) {
      if ($(this).attr('id') !== 'paymentForm' && !$(this).closest('.checkoutAddress').length) { 
        const $form = $(this);
        const $requiredFields = $form.find('[required]');
        let hasErrors = false;
        $requiredFields.each(function() {
          const $field = $(this);
          if (!$field.val().trim()) {
            $field.addClass('is-invalid');
            hasErrors = true;
          } else {
            $field.removeClass('is-invalid');
          }
        });
        if (hasErrors) {
          e.preventDefault();
          alert('Please fill in all required fields.');
        }
      }
    });
  }
});
