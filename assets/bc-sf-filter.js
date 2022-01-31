
var onSale = false;
var soldOut = false;
var priceVaries = false;
var images = [];
var firstVariant = {};
// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: bcSfFilterConfig.custom.products_per_page,
        /* Optional */
        loadProductFirst: true,
        numberFilterTree: 2,
    },
};
// Declare Templates
var bcSfFilterTemplate = {
    // Grid Template
    'productGridItemHtml': '<div class="Grid__Cell 1/'+ bcSfFilterConfig.custom.mobile_row + '--phone 1/' + bcSfFilterConfig.custom.tablet_row + '--tablet-and-up 1/' + bcSfFilterConfig.custom.desktop_row + '--' + buildClass() +'">'+
                              '<div class="ProductItem '+ buildClassHiz() +'">'+
                                '<div class="ProductItem__Wrapper">'+
                                  '{{itemImages}}' +
                                  '{{itemLabels}}'+
                                  '{{itemInfo}}'+
                                '</div>'+
                                buildButtonSecond() +
                              '</div>'+
                            '</div>',

    // Pagination Template
    'previousActiveHtml': '<a class="Pagination__NavItem Link Link--primary" rel="prev" href="{{itemUrl}}"><svg class="{{ icon_class }}" role="presentation" viewBox="0 0 11 18"><path d="M9.5 1.5L1.5 9l8 7.5" stroke-width="2" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square"></path></svg></a>',
    'previousDisabledHtml': '',
    'nextActiveHtml': '<a class="Pagination__NavItem Link Link--primary" rel="next" href="{{itemUrl}}"><svg class="{{ icon_class }}" role="presentation" viewBox="0 0 11 18"><path d="M1.5 1.5l8 7.5-8 7.5" stroke-width="2" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="square"></path> </svg></a>',
    'nextDisabledHtml': '',
    'pageItemHtml': '<a class="Pagination__NavItem Link Link--primary" href="{{itemUrl}}">{{itemTitle}}</a>',
    'pageItemSelectedHtml': '<span class="Pagination__NavItem is-active">{{itemTitle}}</span>',
    'pageItemRemainHtml': '<span class="Pagination__NavItem">{{itemTitle}}</span>',
    'paginateHtml': ' <div class="Pagination Text--subdued"><div class="Pagination__Nav">{{previous}}{{pageItems}}{{next}}</div></div>',
    // Sorting Template
    'sortingHtml': '{{sortingItems}}',

};
/************************** CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
function prepareShopifyData(data) {
  // Displaying price base on the policy of Shopify, have to multiple by 100
  soldOut = !data.available; // Check a product is out of stock
  onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
  priceVaries = data.price_min != data.price_max; // Check a product has many prices
  // Convert images to array
  images = data.images_info;
  // Get First Variant (selected_or_first_available_variant)
  var firstVariant = data['variants'][0];
  if (getParam('variant') !== null && getParam('variant') != '') {
    var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
    if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
  } else {
    for (var i = 0; i < data['variants'].length; i++) {
      if (data['variants'][i].available) {
        firstVariant = data['variants'][i];
        break;
      }
    }
  }
  return data;
}
/************************** END CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
/************************** BUILD PRODUCT LIST **************************/
// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
  // Get Template
  var itemHtml = bcSfFilterTemplate.productGridItemHtml;
  // Customize API data to get the Shopify data
  data = prepareShopifyData(data);
  // Add Custom class
  var soldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
  var saleClass = onSale ? bcSfFilterTemplate.saleClass : '';
  // Add Label
  itemHtml = itemHtml.replace(/{{itemLabels}}/g, buildLabels(data));

  // Add Images
  itemHtml = itemHtml.replace(/{{itemImages}}/g, buildImage(data, images));

  // Add main attribute (Always put at the end of this function)
  itemHtml = itemHtml.replace(/{{itemInfo}}/g, buildInfo(data, index));
  itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));
  return itemHtml;
};

/************************** END BUILD PRODUCT LIST **************************/
/************************** BUILD PRODUCT ITEM ELEMENTS **************************/
function buildClass() {
  return bcSfFilterConfig.custom.filter_position == 'drawer' ? 'lap-and-up' : 'desk';
}

function buildClassHiz() {
  return bcSfFilterConfig.custom.use_horizontal ? 'ProductItem--horizontal' : '';
}

function buildButtonSecond() {
  return bcSfFilterConfig.custom.use_horizontal ? '<a href="{{itemUrl}}" class="ProductItem__ViewButton Button Button--secondary hidden-pocket">' + bcSfFilterConfig.label.view_product + '</a>' : '';
}

function buildImage(data, images) {
  var htmlImg = '';
  if (!images) images = [];
  if (images.length == 0){
    images.push({
    	src: bcSfFilterConfig.general.no_image_url,
      	id: data.id,
      	width: 480,
      	height: 480
    });
  }
  if (images.length > 0) {
    htmlImg += '<a href="{{itemUrl}}" class="ProductItem__ImageWrapper ';
    var use_natural_size = false;
    var has_alternate_image = false;
    if (bcSfFilterConfig.custom.product_image_size == 'natural' || bcSfFilterConfig.custom.use_horizontal)
      use_natural_size = true;
    if (bcSfFilterConfig.custom.product_show_secondary_image && images.length > 1 && !bcSfFilterConfig.custom.use_horizontal)
      has_alternate_image = true;
    if (has_alternate_image)
      htmlImg += 'ProductItem__ImageWrapper--withAlternateImage';
    htmlImg += '">';
    var max_width = images[0].width;
    if (bcSfFilterConfig.custom.use_horizontal)
      max_width = 125;
    var withCall = use_natural_size ? 'withFallback' : bcSfFilterConfig.custom.product_image_size;
    htmlImg += '<div class="AspectRatio AspectRatio--' + withCall + '" style="max-width: ' + max_width + 'px;';
    var aspect_ratio = images[0].width / images[0].height;
    if (use_natural_size) {
      htmlImg += 'padding-bottom: ' + (100 / aspect_ratio) + '%;';
    }
    htmlImg += ' --aspect-ratio: ' + aspect_ratio + '">';
    if (has_alternate_image && images.length > 1) {
      var sizes = '200,300,400,600,800,900,1000,1200';
      var support_size = imageSize(sizes, images[1]);
      var thumbUrl = bcsffilter.optimizeImage(images[1]['src'], '{width}x');
      htmlImg += '<img class="ProductItem__Image ProductItem__Image--alternate Image--lazyLoad Image--fadeIn" data-src="' + thumbUrl + '" data-widths="[' + support_size + ']" data-sizes="auto" alt="' + data.title + '" data-image-id="' + images[1].id + '">';
    }

    var sizes_main = '200,400,600,700,800,900,1000,1200';
    var support_size = imageSize(sizes_main, images[0]);
    var thumbUrl_main = images.length > 0 ? bcsffilter.optimizeImage(images[0]['src'], '{width}x') : bcSfFilterConfig.general.no_image_url;
    htmlImg += '<img class="ProductItem__Image Image--lazyLoad Image--fadeIn" data-src="' + thumbUrl_main + '" data-widths="[' + support_size + ']" data-sizes="auto" alt="' + data.title + '" data-image-id="' + images[0].id + '">';
    htmlImg += '<span class="Image__Loader"></span>';
    htmlImg += '<noscript>';
    htmlImg += '<img class="ProductItem__Image ProductItem__Image--alternate" src="' + bcsffilter.optimizeImage(images[0]['src'], '600x') + '" alt="' + data.title + '">';
    htmlImg += '<img class="ProductItem__Image" src="' + bcsffilter.optimizeImage(images[0]['src'], '600x') + '" alt="' + data.title + '">';
    htmlImg += '</noscript>';
    htmlImg += '</div>';
    htmlImg += '</a>';
  }
  return htmlImg;
}

function imageSize(sizes, image) {
  if (image) {
    var desired_sizes = sizes.split(',');
    var supported_sizes = '';
    for (var k = 0; k < desired_sizes.length; k++) {
      var size = desired_sizes[k];
      var size_as_int = size * 1;
      if (image.width < size_as_int) { break; }
      supported_sizes = supported_sizes + size + ',';
    }
    
    if (supported_sizes == '')
      supported_sizes = image.width;

    if(!jQ.isNumeric(supported_sizes)) {
      supported_sizes = supported_sizes.split(',').join(',');
      supported_sizes = supported_sizes.substring(0,supported_sizes.lastIndexOf(','));
    }
    return supported_sizes;
    
  } else {
    return '';
  }
}

function buildPrice(data) {
  var html = '';
  var show_price_on_hover = bcSfFilterConfig.custom.product_show_price_on_hover;
  var classPriceHover = show_price_on_hover ? 'ProductItem__PriceList--showOnHover' : '';
  html += '<div class="ProductItem__PriceList ' + classPriceHover + ' Heading">';
  if (onSale) {
    html += '<span class="ProductItem__Price Price Price--highlight Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(data.price_min) + '</span> ';
    html += '<span class="ProductItem__Price Price Price--compareAt Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(data.compare_at_price_min) + '</span>';
  } else {
    if (priceVaries) {
      html += '<span class="ProductItem__Price Price Text--subdued">' + bcSfFilterConfig.label.from.replace(/{{min_price}}/g, bcsffilter.formatMoney(data.price_min)) + '</span>';
    } else {
      html += '<span class="ProductItem__Price Price Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(data.price_min) + '</span>';
    }
  }
  html += '</div>';
  return html;
}

function buildLabels(data) {
  var product_labels = ''
  if (bcSfFilterConfig.custom.show_labels) {
    product_labels = '';
    var tags = data.tags;
    for (var k = 0; k < tags.length; k++) {
      var tag = tags[k];
      if (tag.indexOf('__label') != -1) {
        product_labels += '<span class="ProductItem__Label Heading Text--subdued">' + tag.split('__label:')[1] + '</span>';
        break;
      }
    }
    if (!soldOut) {
      if (onSale)
        product_labels += '<span class="ProductItem__Label Heading Text--subdued">' + bcSfFilterConfig.label.sale + '</span>';
    } else {
      product_labels += ' <span class="ProductItem__Label Heading Text--subdued">' + bcSfFilterConfig.label.sold_out + '</span>';
    }
    var html = '';
    if (product_labels != '') {
      html += '<div class="ProductItem__LabelList">';
      html += product_labels;
      html += '</div>';
    }
  }
  return html;
}

function buildInfo(data, indx) {
  var html = '';
  if (bcSfFilterConfig.custom.show_product_info) {
    var infoClass = (!bcSfFilterConfig.custom.use_horizontal) ? 'ProductItem__Info--' + bcSfFilterConfig.custom.product_info_alignment : '';
    html += '<div class="ProductItem__Info ' + infoClass + ' ">';
    if (bcSfFilterConfig.custom.show_vendor) {
      html += '<p class="ProductItem__Vendor Heading">' + data.vendor + '</p>'
    }
    html += '<h2 class="ProductItem__Title Heading">';
    html += '<a href="{{itemUrl}}">' + data.title + '</a>';
    html += '</h2>';        
    html += buildPrice(data);
    if (bcSfFilterConfig.custom.show_color_swatch) {
      html += buildSwatch(data, bcsffilter, indx);	
    }
    html += '</div>';
  }
  return html;
}

function buildSwatch(data, ob, indx) {
  var _this = ob;
  var itemSwatchHtml = '';
  if (bcSfFilterConfig.custom.show_color_swatch) {
    var color_name = bcSfFilterConfig.custom.section_id + '-' + data.id + '-' + indx;
    data.options_with_values.forEach(function (option, index) {
      var option_name = option.name.toLowerCase();
      if (option_name.indexOf('color') != -1 || option_name.indexOf('colour') != -1 || option_name.indexOf('couleur') != -1) {
        var values = '';
        itemSwatchHtml += '<div class="ProductItem__ColorSwatchList">';
        var i = 0;
        data.variants.forEach(function (variant) {
          var temp = variant.merged_options.filter(function (obj) {
            obj = obj.toLowerCase();
            if (obj.indexOf('color') != -1 || obj.indexOf('colour') != -1)
              return obj;
          });
          temp = temp[0].split(':');

          var value = temp[1].toLowerCase();
          if (values.indexOf(value) == -1) {
            values = values + ',' + value;
            values = values.split(',');
            var size = '200,400,600,700,800,900,1000,1200';
            var supported_sizes = imageSize(size, variant.image);
            var color_image = _this.optimizeImage(variant.image);
            var name_color = bcsffilter.slugify(value) + '.png';
            var checked = (i == 0) ? 'checked=checked' : '';
            var imageInfo = null;
            var image_aspect_ratio = 1;
            imageInfo = data.images_info.find(function (imageOb) {
              if (imageOb.src == variant.image){
              	image_aspect_ratio = imageOb.width / imageOb.height;
                return imageOb;
              } 
            });
            if (!imageInfo){
              if (data.images_info.length > 0){
              	imageInfo = data.images_info[0];
              } else {
              	imageInfo = {
                	src: bcSfFilterConfig.general.no_image_url,
                  	id: variant.id,
                  	width: 480,
                  	height: 480
              	}
              }
              
            }
            var dataImg = (imageInfo != null) ? '" data-image-url="' + imageInfo.src + '" data-image-widths="[' + supported_sizes + ']" data-image-aspect-ratio="1" data-image-id="' + imageInfo.id + '"' : '';
            var color_input_id = color_name + "-" + values.length;
            var variant_price = variant.price ? variant.price : 0;
            var variant_compare_at_price = variant.compare_at_price ? variant.compare_at_price : 0;
            var url_color = bcSfFilterMainConfig.general.asset_url.replace('bc-sf-filter.js', name_color);
            itemSwatchHtml += '<div class="ProductItem__ColorSwatchItem">';
            itemSwatchHtml += '<input class="ColorSwatch__Radio" type="radio" ' + checked + ' name="' + color_name + '" id="' + color_input_id + '" value="' + value + '" data-image-aspect-ratio="' + image_aspect_ratio + '" data-variant-price="' + variant_price + '" data-variant-compare-at-price="' + variant_compare_at_price + '" data-variant-url="' + _this.buildProductItemUrl(data) + '?variant=' + variant.id + '#Image' +  imageInfo.id + '"' + dataImg + '  aria-hidden="true">';
            itemSwatchHtml += '<label class="ColorSwatch ColorSwatch--small" for="' + color_input_id + '" style="background-color: ' + value.replace(' ', '').toLowerCase() + '; background-image: url(' + url_color + ')" title="' + value + '" data-tooltip="' + value + '"></label>';
            itemSwatchHtml += '</div>';
            i++;
          }
        });
        itemSwatchHtml += '</div>';
      }
    });
  }
  return itemSwatchHtml;
}
/************************** END BUILD PRODUCT ITEM ELEMENTS **************************/
/************************** BUILD TOOLBAR **************************/
// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
  // Get page info
  var currentPage = parseInt(this.queryParams.page);
  var totalPage = Math.ceil(totalProduct / this.queryParams.limit);
  // If it has only one page, clear Pagination
  if (totalPage == 1) {
    jQ(this.selector.pagination).html('');
    return false;
  }
  if (this.getSettingValue('general.paginationType') == 'default') {
    var paginationHtml = bcSfFilterTemplate.paginateHtml;
    // Build Previous
    var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
    previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
    paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);
    // Build Next
    var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml : bcSfFilterTemplate.nextDisabledHtml;
    nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
    paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);
    // Create page items array
    var beforeCurrentPageArr = [];
    for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
      beforeCurrentPageArr.unshift(iBefore);
    }
    if (currentPage - 4 > 0) {
      beforeCurrentPageArr.unshift('...');
    }
    if (currentPage - 4 >= 0) {
      beforeCurrentPageArr.unshift(1);
    }
    beforeCurrentPageArr.push(currentPage);
    var afterCurrentPageArr = [];
    for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
      afterCurrentPageArr.push(iAfter);
    }
    if (currentPage + 3 < totalPage) {
      afterCurrentPageArr.push('...');
    }
    if (currentPage + 3 <= totalPage) {
      afterCurrentPageArr.push(totalPage);
    }
    // Build page items
    var pageItemsHtml = '';
    var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
    for (var iPage = 0; iPage < pageArr.length; iPage++) {
      if (pageArr[iPage] == '...') {
        pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
      } else {
        pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
      }
      pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
      pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
    }
    paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
    paginationHtml = jQ.parseHTML(paginationHtml);
    jQ(this.selector.pagination).html(paginationHtml);
  }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
  if (bcSfFilterConfig.custom.show_sorting && bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
    jQ(this.selector.topSorting).html('');
    var sortingArr = this.getSortingList();
    if (sortingArr) {
      // Build content
      var sortingItemsHtml = '';
      for (var k in sortingArr) {
        var classActive = (this.queryParams.sort == k) ? 'is-selected' : '';
        sortingItemsHtml += '<button class="Popover__Value ' + classActive + ' Heading Link Link--primary u-h6" data-value="' + k + '">' + sortingArr[k] + '</button>';
      }
      var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
      html = jQ.parseHTML(html);
      jQ(this.selector.topSorting).html(html);
    }
  }
};

// Build Sorting event
BCSfFilter.prototype.buildSortingEvent = function() {
  var _this = this;
  var topSortingSelector = jQ(this.selector.topSorting);
  topSortingSelector.find('.Popover__Value').click(function(e) {
    onInteractWithToolbar(e, 'sort', _this.queryParams.sort, jQ(this).data('value'));
    jQ('.CollectionToolbar__Item--sort').trigger('click');
  })
};

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {
  /**
   *  Call theme function 
   *  1. Add var bcPrestigeSections; var bcPrestigeSectionContainer; to assets/theme.min.js
   *  2. In assets/theme.min.js, find var YYY=new XXX.SectionContainer; For example: var e=new o.SectionContainer;
   *  3. Replace var e=new o.SectionContainer; by var e=new o.SectionContainer; var YYY = new XXX.SectionContainer;  bcPrestigeSections = YYY; bcPrestigeSectionContainer = XXX;
  
  if(typeof bcPrestigeSectionContainer != 'undefined' && typeof bcPrestigeSections != 'undefined'){
    bcPrestigeSections.register("collection", bcPrestigeSectionContainer.CollectionSection);
    bcPrestigeSections.register("search", bcPrestigeSectionContainer.SearchSection);
  }  
  */

  // Fix image not load on Instagram browser - initialize swatch image
  jQ(".ProductItem__Info .ProductItem__ColorSwatchList .ProductItem__ColorSwatchItem label.ColorSwatch").click(function(){
    jQ(this).parent().parent().find('label.ColorSwatch').removeClass('active');
    jQ(this).addClass('active');
    var parent = jQ(this).parent();
    var productImage = jQ(this).parent().parent().parent().parent().find('a.ProductItem__ImageWrapper');
    var variantInfo = parent.find('input.ColorSwatch__Radio');
    productImage.find('.AspectRatio .bc-sf-product-swatch-img').remove();
    productImage.find('.AspectRatio').prepend(jQ.parseHTML('<img class="bc-sf-product-swatch-img" src="' + variantInfo.data('image-url') + '" />'));
    productImage.find('img.ProductItem__Image').hide();
    productImage.attr('href', variantInfo.data('variant-url'));
    var variantPrice = '';
    if (variantInfo.data('variant-compare-at-price') > variantInfo.data('variant-price')){
      variantPrice += '<span class="ProductItem__Price Price Price--highlight Text--subdued" data-money-convertible="">' + bcsffilter.formatMoney(variantInfo.data('variant-price')) + '</span>'
      variantPrice += '<span class="ProductItem__Price Price Price--compareAt Text--subdued" data-money-convertible="">' + bcsffilter.formatMoney(variantInfo.data('variant-compare-at-price')) + '</span>';
    } else {
      variantPrice += '<span class="ProductItem__Price Price Text--subdued" data-money-convertible>' + bcsffilter.formatMoney(variantInfo.data('variant-price')) + '</span>';
    }
    variantPrice = jQ.parseHTML(variantPrice);
    jQ(this).closest('.ProductItem__Wrapper').find('.ProductItem__PriceList').html(variantPrice);
  })
};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {
  // Build product count on search page
  if (bcsffilter.queryParams && bcsffilter.queryParams.q){
    var productCountText = '';		
    switch (data.total_product){
      case 0:
          productCountText = bcSfFilterConfig.label.search_results_zero;
          break;
      case 1:
          productCountText = bcSfFilterConfig.label.search_results_one;
          break; 
      default:
          productCountText = bcSfFilterConfig.label.search_results_other;
          break; 
    }

    var searchTerm = bcsffilter.queryParams.q.replace('*', '');
    productCountText = productCountText.replace(/{{terms}}/, searchTerm);
    productCountText = productCountText.replace(/{{count}}/, data.total_product);
	  jQ("#bc-sf-product-count").html(productCountText);
  } else {
    jQ("#bc-sf-product-count").html(data.total_product + (data.total_product === 1 ? ' item' : ' items'));
  }
};

// Build Default layout
BCSfFilter.prototype.buildDefaultElements=function(){var isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,isSafari=/Safari/.test(navigator.userAgent),isBackButton=window.performance&&window.performance.navigation&&2==window.performance.navigation.type;if(!(isiOS&&isSafari&&isBackButton)){var self=this,url=window.location.href.split("?")[0],searchQuery=self.isSearchPage()&&self.queryParams.hasOwnProperty("q")?"&q="+self.queryParams.q:"";window.location.replace(url+"?view=bc-original"+searchQuery)}};

function customizeJsonProductData(data) {for (var i = 0; i < data.variants.length; i++) {var variant = data.variants[i];var featureImage = data.images.filter(function(e) {return e.src == variant.image;});if (featureImage.length > 0) {variant.featured_image = {"id": featureImage[0]['id'],"product_id": data.id,"position": featureImage[0]['position'],"created_at": "","updated_at": "","alt": null,"width": featureImage[0]['width'], "height": featureImage[0]['height'], "src": featureImage[0]['src'], "variant_ids": [variant.id]}} else {variant.featured_image = '';};};var self = bcsffilter;var itemJson = {"id": data.id,"title": data.title,"handle": data.handle,"vendor": data.vendor,"variants": data.variants,"url": self.buildProductItemUrl(data),"options_with_values": data.options_with_values,"images": data.images,"images_info": data.images_info,"available": data.available,"price_min": data.price_min,"price_max": data.price_max,"compare_at_price_min": data.compare_at_price_min,"compare_at_price_max": data.compare_at_price_max};return itemJson;};
BCSfFilter.prototype.prepareProductData = function(data) {var countData = data.length;for (var k = 0; k < countData; k++) {data[k]['images'] = data[k]['images_info'];if (data[k]['images'].length > 0) {data[k]['featured_image'] = data[k]['images'][0]} else {data[k]['featured_image'] = {src: bcSfFilterConfig.general.no_image_url,width: '',height: '',aspect_ratio: 0}}data[k]['url'] = '/products/' + data[k].handle;var optionsArr = [];var countOptionsWithValues = data[k]['options_with_values'].length;for (var i = 0; i < countOptionsWithValues; i++) {optionsArr.push(data[k]['options_with_values'][i]['name'])}data[k]['options'] = optionsArr;if (typeof bcSfFilterConfig.general.currencies != 'undefined' && bcSfFilterConfig.general.currencies.length > 1) {var currentCurrency = bcSfFilterConfig.general.current_currency.toLowerCase().trim();function updateMultiCurrencyPrice(oldPrice, newPrice) {if (typeof newPrice != 'undefined') {return newPrice;}return oldPrice;}data[k].price_min = updateMultiCurrencyPrice(data[k].price_min, data[k]['price_min_' + currentCurrency]);data[k].price_max = updateMultiCurrencyPrice(data[k].price_max, data[k]['price_max_' + currentCurrency]);data[k].compare_at_price_min = updateMultiCurrencyPrice(data[k].compare_at_price_min, data[k]['compare_at_price_min_' + currentCurrency]);data[k].compare_at_price_max = updateMultiCurrencyPrice(data[k].compare_at_price_max, data[k]['compare_at_price_max_' + currentCurrency]);}data[k]['price_min'] *= 100, data[k]['price_max'] *= 100, data[k]['compare_at_price_min'] *= 100, data[k]['compare_at_price_max'] *= 100;data[k]['price'] = data[k]['price_min'];data[k]['compare_at_price'] = data[k]['compare_at_price_min'];data[k]['price_varies'] = data[k]['price_min'] != data[k]['price_max'];var firstVariant = data[k]['variants'][0];if (getParam('variant') !== null && getParam('variant') != '') {var paramVariant = data[k]['variants'].filter(function(e) {return e.id == getParam('variant')});if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0]} else {var countVariants = data[k]['variants'].length;for (var i = 0; i < countVariants; i++) {if (data[k]['variants'][i].available) {firstVariant = data[k]['variants'][i];break}}}data[k]['selected_or_first_available_variant'] = firstVariant;var countVariants = data[k]['variants'].length;for (var i = 0; i < countVariants; i++) {var variantOptionArr = [];var count = 1;var variant = data[k]['variants'][i];var variantOptions = variant['merged_options'];if (Array.isArray(variantOptions)) {var countVariantOptions = variantOptions.length;for (var j = 0; j < countVariantOptions; j++) {var temp = variantOptions[j].split(':');data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];data[k]['variants'][i]['option_' + temp[0]] = temp[1];variantOptionArr.push(temp[1])}data[k]['variants'][i]['options'] = variantOptionArr}data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100}data[k]['description'] = data[k]['content'] = data[k]['body_html'];if (data[k].hasOwnProperty('original_tags') && data[k]['original_tags'].length > 0) {data[k]['tags'] = data[k]['original_tags'].slice(0);}data[k]['json'] = customizeJsonProductData(data[k]);}return data;};

/* Begin patch boost-010 run 2 */
BCSfFilter.prototype.initFilter=function(){return this.isBadUrl()?void(window.location.href=window.location.pathname):(this.updateApiParams(!1),void this.getFilterData("init"))},BCSfFilter.prototype.isBadUrl=function(){try{var t=decodeURIComponent(window.location.search).split("&"),e=!1;if(t.length>0)for(var i=0;i<t.length;i++){var n=t[i],a=(n.match(/</g)||[]).length,r=(n.match(/>/g)||[]).length,o=(n.match(/alert\(/g)||[]).length,h=(n.match(/execCommand/g)||[]).length;if(a>0&&r>0||a>1||r>1||o||h){e=!0;break}}return e}catch(l){return!0}};
/* End patch boost-010 run 2 */
