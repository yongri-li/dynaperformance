 
$(document).ready(function () {
  hulkProductOption.init();
});
 
var hulkProductOption = {
  init: function () {
    //     call function here
  },
 
  hulkAjaxCart: function () {
    function start() {
      var checkout_selectors = "input[name='checkout']:not(.hulkapps-ignore), input[value='Checkout']:not(.hulkapps-ignore), button[name='checkout']:not(.hulkapps-ignore), [href$='checkout']:not(.hulkapps-ignore), button[value='Checkout']:not(.hulkapps-ignore), input[name='goto_pp'], button[name='goto_pp'], input[name='goto_gc'], button[name='goto_gc'],.hulkapps_checkout"
      window.loadScript = function (url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        // If the browser is Internet Explorer
        if (script.readyState) {
          script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
              script.onreadystatechange = null;
              callback();
            }
          };
          // For any other browser
        } else {
          script.onload = function () {
            callback();
          };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
      };
      window.commonJS = function ($) {
        window.hulkappsDoActionsAjax = function (data) {
          if (data) {
            if (data.discounts.discount_show) {
              $(".discount_code_box").css("display", "block");
            }
            if (data.discounts.plan) {
              $(".edit_ajax_cart_option").css("display", "block");
            }
            if (typeof data.discounts == "object" && typeof data.discounts.cart == "object" && typeof data.discounts.cart.items == "object") {
              hulkappsShowCartDiscountsAjax(data.discounts);
            }
            if (data.discounts.is_draft_order) {
              jQuery(document).on('click', checkout_selectors, function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                if (typeof hulkappsCheckout != "function") {
                  window.location = "/checkout";
                }
                // Order Delivery Date App Code for validation issue
                if (typeof hulkappsCheckoutClick === 'undefined') {
                  hulkappsCheckout();
                } else {
                  var result = hulkappsCheckoutClick();
                  if (result == true) {
                    hulkappsCheckout();
                  } else if (result != false) {
                    hulkappsCheckout();
                  }
                }
              });
            }
          }
        }
        window.hulkappsShowCartDiscountsAjax = function (discounts) {
          window.hulkapps.discounts = discounts;
          var flag = 0;
          discounts.cart.items.forEach(function (item) {
            if (item.cart_discount_away_msg_html) {
              jQuery(".hulkapps-reminder[data-key='" + item.key + "']").html(item.cart_discount_away_msg_html);
            }
            if (item.discounted_price < item.original_price) {
              flag = 1;
              jQuery(".hulkapps-cart-item-price[data-key='" + item.key + "']").html("<span class='original_price' style='text-decoration:line-through;'>" + item.original_price_format + "</span><br/>" + "<span class='discounted_price'>" + item.discounted_price_format + "</span>");
              jQuery(".hulkapps-cart-item-line-price[data-key='" + item.key + "']").html("<span class='original_price' style='text-decoration:line-through;'>" + item.original_line_price_format + "</span><br/>" + "<span class='discounted_price'>" + item.discounted_line_price_format + "</span>")
            } else {
              jQuery(".hulkapps-cart-item-price[data-key='" + item.key + "']").html("<span class='original_price'>" + item.original_price_format + "</span>");
              jQuery(".hulkapps-cart-item-line-price[data-key='" + item.key + "']").html("<span class='original_price'>" + item.original_line_price_format + "</span>")
            }
          });
          if (flag == 1) {
            jQuery(".hulkapps-cart-original-total").html(discounts.original_price_total).css("text-decoration", "line-through");
            jQuery('.hulkapps-cart-total').remove();
            if (discounts.final_with_discounted_price == null) {
              jQuery("<span class='hulkapps-cart-total'>" + discounts.discounted_price_total + "</span>").insertAfter('.hulkapps-cart-original-total');
            } else {
              jQuery("<span class='hulkapps-cart-total'>" + discounts.final_with_discounted_price + "</span>").insertAfter('.hulkapps-cart-original-total');
            }
            if (jQuery(".hulkapps-discount-bar").length > 0) {
              jQuery(".hulkapps-discount-bar").html(discounts.cart_discount_msg_html)
            } else {
              $('form[action="/cart"]').prepend(discounts.cart_discount_msg_html)
            }
          }
          jQuery('.hulkapps_summary').remove();
          if (discounts.discount_code && discounts.discount_error == 1) {
            jQuery(".hulkapps-cart-original-total").html(discounts.original_price_total);
            jQuery(".hulkapps_discount_hide").after("<span class='hulkapps_summary'>Discount code does not match</span>");
            localStorage.removeItem('discount_code');
          } else if (discounts.is_free_shipping) {
            jQuery(".hulkapps-cart-original-total").html(discounts.original_price_total);
            jQuery(".hulkapps-summary-line-discount-code, .after_discount_price").remove();
            jQuery(".hulkapps_discount_hide").after("<span class='hulkapps-summary-line-discount-code'><span class='discount-tag'>" + discounts.discount_code + "<span class='close-ajax-tag'></span></span>Free Shipping");
          } else if (discounts.discount_code && $('.discount_code_box').is(":visible")) {
            jQuery('.hulkapps-summary-line-discount-code,.after_discount_price').remove();
            jQuery(".hulkapps_discount_hide").after("<span class='hulkapps-summary-line-discount-code'><span class='discount-tag'>" + discounts.discount_code + "<span class='close-ajax-tag'></span></span><span class='hulkapps_with_discount'>" + " -" + discounts.with_discount + "</span></span><span class='after_discount_price'><span class='final-total'>Total</span>" + discounts.final_with_discounted_price + "</span>");
            if (flag == 1) {
              jQuery(".hulkapps-cart-original-total").html(discounts.discounted_price_total).css("text-decoration", "line-through");
            } else {
              jQuery(".hulkapps-cart-original-total").html(discounts.original_price_total).css("text-decoration", "line-through");
              jQuery('.Drawer .hulkapps-cart-original-total').text(discounts.final_with_discounted_price).css("text-decoration", "none");;
            }
            jQuery(".hulkapps-cart-total").remove();
          } else {
            jQuery(".hulkapps-cart-original-total").html(discounts.original_price_total).css("text-decoration", "none");
            jQuery(".hulkapps-cart-original-total").html(discounts.original_price_total);
          }
        }
        window.hulkappsCheckout = function () {
          for (var i = 0; i < window.hulkapps.cart.items.length; i++) {
            var item = window.hulkapps.cart.items[i];
            var el = document.querySelectorAll("[id='updates_" + item.key + "']");
            if (el.length != 1) {
              el = document.querySelectorAll("[id='updates_" + item.variant_id + "']")
            }
            if (el.length == 1) {
              window.hulkapps.cart.items[i].quantity = el[0].value
            }
          }
          var pv_draft_url = '';
          if (window.hulkapps.is_volume_discount) {
            pv_draft_url = window.hulkapps.vd_url + "/shop/create_draft_order";
          } else if (window.hulkapps.is_product_option) {
            pv_draft_url = window.hulkapps.po_url + "/store/create_draft_order";
          }
          var storage_code = localStorage.getItem('discount_code');
          var ctags = window.hulkapps.customer ? window.hulkapps.customer.tags : ''
          $.ajax({
            type: "POST",
            url: pv_draft_url,
            data: { cart_json: window.hulkapps, store_id: window.hulkapps.store_id, discount_code: storage_code, cart_collections: JSON.stringify(window.hulkapps.cart_collections), ctags: ctags },
            crossDomain: true,
            success: function (res) {
              if (typeof res == "string") {
                window.location.href = res
              } else {
                window.location.href = "/checkout"
              }
              localStorage.removeItem('discount_code');
            }
          });
        }
        window.hulkappsStart = function () {
          window.hulkappsc = {};
          jQuery.getJSON('/cart.js', function (cart) {
            window.hulkapps.cart = cart;
            if (window.hulkapps.cart.items.length > 0) {
              getCartDetails();
              $('body').on('click', '.edit_ajax_cart_option', function (e) {
                e.stopImmediatePropagation();
                e.preventDefault();
                $('body').addClass('body_fixed');
                var key = $(this).data("key");
                var cart_json = {};
                $.ajax({
                  url: "/cart.js",
                  async: false,
                  dataType: 'json',
                  success: function (state) {
                    cart_json = state;
                  }
                });
                // var cart = window.hulkapps.cart;
                var cart = cart_json;
                var store_id = window.hulkapps.store_id;
                var pid = $(this).data("product_id");
                var variant_id = $(this).data("variant_id");
                $("[name^='properties']").each(function () {
                  if ($(this).val() == '') {
                    $(this).attr('disabled', true);
                  }
                });
                if (window.hulkapps.page_type == "product") {
                  $("div[id^='hulkapps_option_list_']").remove();
                }
                $.ajax({
                  type: 'POST',
                  url: window.hulkapps.po_url + '/store/edit_cart',
                  data: { cart_data: cart, item_key: key, store_id: store_id, variant_id: variant_id },
                  cache: false,
                  crossDomain: true,
                  success: function (data) {
                    $('.Drawer__Close').click();
                    if (data == 'ok') {
                      location.reload();
                    } else {
                      $('#edit_cart_popup').html(data);
                      $('.edit_popup').show();
                      function productPrice(number) {
                        var parts = number.toString().split(".");
                        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        return parts.join(".");
                      }
                      var old_price = $("#hulkapp_popupOverlay .hulkapp_popup-heading").text().split('( ');
                      var price = parseFloat(old_price[1].replace(')', '').replace('$ ', '')).toFixed(2);
                      var final_price = productPrice(price);
                      $("#hulkapp_popupOverlay .hulkapp_popup-heading").text(old_price[0] + '( $ ' + final_price + ')');
 
                      $(".hulkapp_save").addClass("hulkapp_ajax_save").removeClass("hulkapp_save");
                      if (window.hulkapps.page_type == "product") {
                        _closePOProp($);
                      }
                      calc_options_total(pid);
                      conditional_rules(pid);
                    }
                  }
                });
              });
            }
          });
          window.getCartDetails = function () {
            var pv_cart_url = '';
            if (window.hulkapps.is_volume_discount) {
              pv_cart_url = window.hulkapps.vd_url + "/shop/get_cart_details";
            } else if (window.hulkapps.is_product_option) {
              pv_cart_url = window.hulkapps.po_url + "/store/get_cart_details";
            }
            if (pv_cart_url != '') {
              var storage_code = localStorage.getItem('discount_code');
              var ctags = window.hulkapps.customer ? window.hulkapps.customer.tags : ''
              if (storage_code != '') {
                $('.hulkapps_discount_code').val(storage_code);
                var get_cart_data = { cart_data: window.hulkapps, store_id: window.hulkapps.store_id, discount_code: storage_code, cart_collections: JSON.stringify(window.hulkapps.cart_collections), ctags: ctags }
              } else {
                var get_cart_data = { cart_data: window.hulkapps, store_id: window.hulkapps.store_id, cid: cust_id }
              }
              $(checkout_selectors).attr('disabled', true);
              $.ajax({
                type: "POST",
                url: pv_cart_url,
                data: get_cart_data,
                crossDomain: true,
                success: function (data) {
                  $(checkout_selectors).attr('disabled', false);
                  data.discounts.cart.items.forEach(function (item, index) {
                    setTimeout(function () {
                      $('[data-cart-item]').each(function (index, value) {
                        if (item.variant_id == $(this).data("variant_id")) {
                          $(this).find('.hulkapps-cart-item-line-price').data("cart-item-key", item.key);
                          $(this).find('.hulkapps-cart-item-line-price .original_price').text(item.original_line_price_format);
                        }
                      });
                    }, 500);
                  });
                  hulkappsDoActionsAjax(data);
                }
              });
            }
          }
          window.getRelationships = function ($) {
            if (window.hulkapps.page_type == "product") {
              $.ajax({
                type: "GET",
                url: window.hulkapps.po_url + "/store/get_all_relationships",
                data: { pid: window.hulkapps.product_id, store_id: window.hulkapps.store_id },
                sync: false,
                crossDomain: true,
                success: function (data) {
                  $("#hulkapps_custom_options_" + window.hulkapps.product_id).html(data);
                  setTimeout(function () {
                    conditional_rules(parseInt(window.hulkapps.product_id));
                    $('#hulkapps_options_' + window.hulkapps.product_id).closest("form").find(':submit').addClass('hulkapps_submit_cart');
                  }, 500);
                }
              });
            }
          }
          window._closePOProp = function ($) {
            $('body').on('click touchstart', '.hulkapp_close', function (e) {
              e.preventDefault();
              e.stopImmediatePropagation();
              $('.edit_popup').hide();
              $('body').removeClass('body_fixed');
              $(".edit_popup #edit_cart_popup").empty();
              getRelationships($);
            });
          }
        }
        if (window.hulkapps.is_product_option || window.hulkapps.is_volume_discount) {
          hulkappsStart();
        }
      }
      window.cartPageJS = function ($) {
        // When user enter the phone_number.
        $('body').on('keypress', '.hulkapps_discount_code', function (e) {
          if (e.which == 13) {
            $(".hulkapps_discount_ajax_button").click();
          }
          if (e.which === 32) {
            return false;
          }
        });
        // Button click for Apply Discount.  
        $('body').on('click', '.hulkapps_discount_ajax_button', function (e) {
          e.preventDefault();
          var code = $(this).parent(".hulkapps_discount_hide").find(".hulkapps_discount_code").val();
          if (code == '') {
            $('.hulkapps_discount_code').addClass('discount_error');
          } else {
            localStorage.setItem('discount_code', code);
            $('.hulkapps_discount_code').removeClass('discount_error');
            getCartDetails();
          }
        });
        $('body').on('click', '.close-ajax-tag', function (e) {
          localStorage.removeItem('discount_code');
          $('.hulkapps-summary-line-discount-code, after_discount_price, .hulkapps_summary, .after_discount_price').remove();
          getCartDetails();
        });
        // When user click on edit_cart save popup.
        $('body').on('click', '.hulkapp_ajax_save', function (e) {
          e.stopImmediatePropagation();
          e.preventDefault();
          var line_product_id = $(this).data('product_id');
          if (validate_options(line_product_id)) {
            var line = parseInt($(this).parents('.hulkapp_popupBox').find('.hulkapp_mainContent').find('.h_index').val()) + 1;
            var itemIndex = $(this).parents('.hulkapp_popupBox').find('.hulkapp_mainContent').find('.h_index').val()
            var qty = $('[data-cart-item]').eq($(this).parents('.hulkapp_popupBox').find('.hulkapp_mainContent').find('.h_index').val()).attr('data-cart-item-quantity');
            var line_variant_id = $('[data-cart-item]').eq($(this).parents('.hulkapp_popupBox').find('.hulkapp_mainContent').find('.h_index').val()).attr('data-variant_id');
            var proprtyHTML = '';
            if ($('.upload_cls').val() != '') {
              $('.upload_h_cls').remove();
            } else {
              $('.upload_cls').remove();
            }
            $('#edit_cart_popup .conditional').each(function (index, element) {
              $(this).find('.hulkapps_option_value input[type="hidden"]').val('');
            });
            let properties = {};
            $("#edit_cart_popup [name^='properties']").each(function (index, el) {
              if ($(this).val() == '') {
                $(this).remove();
              }
              let name;
              if (this.type == "radio") {
                if (this.checked) {
                  name = this.name.replace('properties[', '').replace(']', '');
                  if ($.trim(this.value).length > 0) {
                    properties[name] = this.value;
                    proprtyHTML += '<div class="cart-property" data-cart-item-property><span class="property_name" data-cart-item-property-name>' + name + ': </span><span class="property_value" data-cart-item-property-value>' + this.value + '</span></div>';
                  }
                }
              } else {
                name = this.name.replace('properties[', '').replace(']', '');
                if ($.trim(this.value).length > 0) {
                  properties[name] = this.value;
                  proprtyHTML += '<div class="cart-property" data-cart-item-property><span class="property_name" data-cart-item-property-name>' + name + ': </span><span class="property_value" data-cart-item-property-value>' + this.value + '</span></div>';
                }
              }
            });
 
            if ($.isEmptyObject(properties)) {
              $.ajax({
                type: 'POST',
                url: '/cart/change.js',
                data: {
                  quantity: 0,
                  line: line
                },
                dataType: 'json',
                success: function (cart) {
                  if ($('.upload_cls').val() != '') {
                    $('.upload_h_cls').remove();
                  } else {
                    $('.upload_cls').remove();
                  }
                  $('#edit_cart_popup .conditional').each(function (index, element) {
                    $(this).find('.hulkapps_option_value input[type="hidden"]').val('');
                  });
                  $("[name^='properties']").each(function (index, el) {
                    if ($(this).val() == '') {
                      $(this).remove();
                    }
                  });
                  $.ajax({
                    type: 'POST',
                    url: '/cart/add.js',
                    data: {
                      quantity: qty,
                      id: line_variant_id
                    },
                    dataType: 'json',
                    success: function (cart_item) {
                      $(".edit_popup #edit_cart_popup").empty();
                      $('.edit_popup').hide();
                      $('body').removeClass('body_fixed');
                      $.getJSON('/cart.js').then(function (cart) {
                        var selectedItemRow = $("[data-cart-item]").eq(itemIndex);
                        $(selectedItemRow).find("#edit_" + line_product_id).data("key", cart.items[itemIndex].key);
                        $('body').find("#edit_" + line_product_id).attr("data-cart-item-quantity", qty);
                        $(selectedItemRow).find('[data-cart-item-property]').detach();
                        $(selectedItemRow).find('[data-cart-item-details]').append(proprtyHTML);
                        $(selectedItemRow).find(".hulkapps-cart-item-line-price").attr('data-key', cart.items[itemIndex].key);
                        $(selectedItemRow).attr('data-cart-item-key', cart.items[itemIndex].key);
                        window.hulkapps.cart = cart;
                        getCartDetails();
                        getRelationships($);
                        if (window.hulkapps.page_type != 'cart') {
                          $(".Header__Icon[aria-label='Open cart']")[0].click();
                        }
                        setTimeout(function () {
                          $.each(cart.items, function (index, item) {
                            if (item.properties == null || $.isEmptyObject(item.properties)) {
                              $("[data-cart-item]").eq(index).find(".edit_ajax_cart_option").hide();
                            }
                          });
                        }, 1500);
                      });
                    }
                  });
                }
              });
            } else {
              $.ajax({
                type: 'POST',
                url: '/cart/change.js',
                data: {
                  quantity: qty,
                  line: line,
                  properties: properties
                },
                dataType: 'json',
                success: function (cart) {
                  $(".edit_popup #edit_cart_popup").empty();
                  $(".edit_popup").hide();
                  $('body').removeClass('body_fixed');
                  var selectedItemRow = $("[data-cart-item]").eq(itemIndex);
                  $(selectedItemRow).find("#edit_" + line_product_id).data("key", cart.items[itemIndex].key);
                  $('body').find("#edit_" + line_product_id).attr("data-cart-item-quantity", qty);
                  $(selectedItemRow).find('[data-cart-item-property]').detach();
                  $(selectedItemRow).find('[data-cart-item-details]').append(proprtyHTML);
                  $(selectedItemRow).find(".hulkapps-cart-item-line-price").attr('data-key', cart.items[itemIndex].key);
                  $(selectedItemRow).attr('data-cart-item-key', cart.items[itemIndex].key);
                  window.hulkapps.cart = cart;
                  getCartDetails();
                  getRelationships($);
                  if (window.hulkapps.page_type != 'cart') {
                    $(".Header__Icon[aria-label='Open cart']")[0].click();
                  }
                  setTimeout(function () {
                    $.each(cart.items, function (index, item) {
                      if (item.properties == null || $.isEmptyObject(item.properties)) {
                        $("[data-cart-item]").eq(index).find(".edit_ajax_cart_option").hide();
                      }
                    });
                  }, 800);
                }
              });
            }
          }
        });
        // When edit_cart popup is closed.
        $('body').on('click touchstart', '.hulkapp_close', function (e) {
          $('.edit_popup').hide();
          $('body').removeClass('body_fixed');
        });
      }
    }
 
    start();
    loadScript('//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', function () {
      var jQuery321 = jQuery.noConflict(true);
      window.hulkapps.is_volume_discount = false
      window.hulkapps.is_product_option = true
      commonJS(jQuery321);
      cartPageJS(jQuery321);
    });
  }
}
