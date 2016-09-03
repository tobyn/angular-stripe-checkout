(function() {
/* global StripeCheckout */
'use strict';

var MODULE_NAME = 'stripe.checkout';
var STRIPE_CHECKOUT_URL = 'https://checkout.stripe.com/checkout.js';

var OPTIONS = {
  address:         ['data-address', 'boolean'],
  alipay:          ['data-alipay', 'boolean-or-auto'],
  alipayReusable:  ['data-alipay-reusable', 'boolean'],
  allowRememberMe: ['data-allow-remember-me', 'boolean'],
  amount:          ['data-amount', 'number'],
  billingAddress:  ['data-billing-address', 'boolean'],
  bitcoin:         ['data-bitcoin', 'boolean'],
  currency:        ['data-currency', 'string'],
  description:     ['data-description', 'string'],
  email:           ['data-email', 'string'],
  image:           ['data-image', 'string'],
  key:             ['data-key', 'string'],
  label:           ['data-label', 'string'],
  locale:          ['data-locale', 'string'],
  name:            ['data-name', 'string'],
  color:           ['data-color', 'string'],
  panelLabel:      ['data-panel-label', 'string'],
  shippingAddress: ['data-shipping-address', 'boolean'],
  zipCode:         ['data-zip-code', 'boolean']
};


var angular;

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
  angular = require('angular');
  module.exports = MODULE_NAME;
} else {
  angular = window.angular;
}

var extend = angular.extend;

angular.module(MODULE_NAME,[])
  .directive('stripeCheckout',StripeCheckoutDirective)
  .provider('StripeCheckout',StripeCheckoutProvider);


StripeCheckoutDirective.$inject = ['$parse', 'StripeCheckout'];

function StripeCheckoutDirective($parse, StripeCheckout) {
  return { link: link };

  function link(scope, el, attrs) {
    var handler;

    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure(getOptions(el));
      });

    el.on('click',function() {
      if (handler)
        handler.open(getOptions(el)).then(function(result) {
          var callback = $parse(attrs.stripeCheckout)(scope);
          if (typeof callback === 'function')
            callback.apply(null,result);
        });
    });
  }
}


function StripeCheckoutProvider() {
  var defaults = {};

  this.defaults = function(options) {
    extend(defaults,options);
  };


  this.load = function(StripeCheckout) {
    return StripeCheckout.load();
  };

  this.load.$inject = ['StripeCheckout'];


  this.$get = function($document, $q) {
    return new StripeCheckoutService($document,$q,defaults);
  };

  this.$get.$inject = ['$document', '$q'];
}


function StripeCheckoutService($document, $q, providerDefaults) {
  var defaults = {};
  var promise;

  this.configure = function(options) {
    return new StripeHandlerWrapper($q,extend({},
      providerDefaults,
      defaults,
      options
    ));
  };

  this.load = function() {
    if (!promise)
      promise = loadLibrary($document,$q);

    return promise;
  };

  this.defaults = function(options) {
    extend(defaults,options);
  };
}


function StripeHandlerWrapper($q, options) {
  var deferred, success;

  var handler = StripeCheckout.configure(extend({},options,{
    token: function(token, args) {
      if (options.token) options.token(token,args);

      success = true;
      deferred.resolve([token, args]);
    },

    closed: function() {
      if (options.closed) options.closed();
      if (!success) deferred.reject();
    }
  }));

  this.open = function(openOptions) {
    deferred = $q.defer();
    success = false;

    handler.open(openOptions);

    return deferred.promise;
  };

  this.close = function() {
    success = false;

    handler.close();

    if (options.closed) options.closed();
    if (deferred) deferred.reject();
  };
}


function getOptions(el) {
  var opt, def, val, options = {};

  for (opt in OPTIONS) {
    if (!OPTIONS.hasOwnProperty(opt))
      continue;

    def = OPTIONS[opt];
    val = parseValue(el.attr(def[0]),def[1]);

    if (val != null)
      options[opt] = val;
  }

  return options;
}

function loadLibrary($document, $q) {
  var deferred = $q.defer();

  var doc = $document[0];
  var script = doc.createElement('script');
  script.src = STRIPE_CHECKOUT_URL;

  script.onload = function () {
    deferred.resolve();
  };

  script.onreadystatechange = function () {
    var rs = this.readyState;
    if (rs === 'loaded' || rs === 'complete')
      deferred.resolve();
  };

  script.onerror = function () {
    deferred.reject(new Error('Unable to load checkout.js'));
  };

  var container = doc.getElementsByTagName('head')[0];
  container.appendChild(script);

  return deferred.promise;
}

function parseValue(value, type) {
  if (type === 'boolean') {
    return value && value !== 'false';
  } else if (type === 'number') {
    return value && Number(value);
  } else if (type === 'boolean-or-auto') {
    if (value === 'auto')
      return value;
    else
      return parseValue(value,'boolean');
  } else {
    return value;
  }
}

})();
