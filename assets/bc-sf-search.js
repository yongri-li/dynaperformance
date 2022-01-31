// Override Settings
var bcSfSearchSettings = {
	search: {
		suggestionStyle: 'style2',
		suggestionStyle2MainContainerSelector: '#shopify-section-header',
		suggestionMobileStyle: 'style2',
	}
};

// Customize style of Suggestion box
BCSfFilter.prototype.customizeSuggestion = function (suggestionElement, searchElement, searchBoxId) {
};

BCSfFilter.prototype.beforeBuildSearchBox = function (id) {

	removeThemeSearchEvent();
	recallThemeOnPageShowEvent();

	var self = this;
	if (self.checkIsFullWidthSuggestionMobile(id)) {
		jQ(id).removeAttr('autofocus');
		if (jQ(id).is(':focus')) {
			jQ(id).blur();
		}
	}
};

function removeThemeSearchEvent() {
	// Remove all events
	if (jQ('[name="q"]').length > 0) {
		var cloneSearchBar = jQ('[name="q"]:first').clone();
		jQ(cloneSearchBar).removeClass('Form__Input').addClass('Search__Input Heading');
		jQ('[name="q"]:first').replaceWith(cloneSearchBar);
		if (jQ('#Search').length > 0) {
			if (jQ('#Search').hasClass('Modal--fullScreen')) {
				jQ('#Search').attr("style", "height: 0px !important");
			}
			jQ('#Search .Search__Results').attr("style", "display: none !important");
		}

		// Rebuild click search icon event
		if (jQ('[data-action="toggle-search"]').length > 0) {
			jQ('[data-action="toggle-search"]').on('click', function () {
				setTimeout(function () {
					jQ('[name="q"]:first').focus();
				}, 500);
			})
		}
	}
	// disable page transition
	if (window.theme && window.theme.showPageTransition) {
		window.theme.showPageTransition = false;
	}
}

function recallThemeOnPageShowEvent() {
	// disable page transition
	var pageTransition = document.querySelector('.PageTransition');
	if (pageTransition) {
		pageTransition.style.visibility = 'visible';
		pageTransition.style.opacity = '0';
	}
	// refresh cart
	document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
		bubbles: true
	}));
}