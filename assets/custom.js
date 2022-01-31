/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */

$('.pro_main_slider').slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  infinite:false,
  asNavFor: '.pro_thumnail',
  responsive: [{
    breakpoint: 768,
    settings: {
      dots: false,
      adaptiveHeight: true
    }
  }]
});

$('.pro_thumnail').slick({
  slidesToShow: 5,
  slidesToScroll: 1,
  arrows: true,
  infinite:false,
  asNavFor: '.pro_main_slider',
  focusOnSelect: true,
  vertical: true,
  responsive: [{
    breakpoint: 768,
    settings: {
      vertical: false,

    }
  }]
});

$("#pro-accordion .accordion-box .title").click(function () {
  $('#pro-accordion').find('.panel').not($(this).next()).slideUp(300);
  $('.active').not(this).removeClass('active');

  $(this).toggleClass('active');
  $(this).next().slideToggle(300);
});

var selectCarMakeOptions = $('.carMake option');
var selectCarModelOptions = $('.carModel option');
var selectCarYearOptions = $('.carYear option');

$('.carMake').on('change', function(){
  var handle = $(this).find(':selected').data('handle');
  selectCarModelOptions.detach();
  selectCarModelOptions.removeClass('hide');
  $(selectCarModelOptions).each(function(index, element){
    var link = $(element).data('link');
    if(typeof $(element).data('default') !== 'undefined'){
  	} else if(handle != link){
      $(element).addClass('hide');
    }
  });
  $(selectCarModelOptions).not(".hide").appendTo($('.carModel'));
  $('.carModel').val("").trigger('change');
});

$('.carModel').on('change', function(){
  var handle = $(this).find(':selected').data('handle');
  selectCarYearOptions.detach();
  selectCarYearOptions.removeClass('hide');
  $(selectCarYearOptions).each(function(index, element){
    var link = $(element).data('link');
    if(typeof $(element).data('default') !== 'undefined'){
    } else if(handle != link){
      $(element).addClass('hide');
    }  
  });
  $(selectCarYearOptions).not(".hide").appendTo($('.carYear'));
  $('.carYear').val("").trigger('change');
});

$('.carYear').on('change', function(){
  var value = $(this).val();
  if(value){
    if($('.template-collection').length){
      $('.show-results-btn').trigger('click');
    }
  }
});

$('.show-results-btn').on('click', function(){
  var link = $('.carYear').val();
  window.location.href = link;
});

$('.popup-youtube').magnificPopup({
  type: 'iframe'
});