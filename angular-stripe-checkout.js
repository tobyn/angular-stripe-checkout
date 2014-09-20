(function() {

var STRIPE_CHECKOUT_URL = "https://checkout.stripe.com/checkout.js";

var OPTION_ATTRIBUTE_MAP = {
  key: "data-key",
  image: "data-image",
  name: "data-name",
  description: "data-description",
  amount: "data-amount",
  currency: "data-currency",
  panelLabel: "data-panel-label",
  zipCode: "data-zip-code",
  email: "data-email",
  label: "data-label",
  allowRememberMe: "data-allow-remember-me"
};

angular.module("stripe.checkout",[])
  .directive("stripeCheckout",StripeCheckoutDirective)
  .provider("StripeCheckout",StripeCheckoutProvider);


StripeCheckoutDirective.$inject = ["$parse", "StripeCheckout"];

function StripeCheckoutDirective($parse, StripeCheckout) {
  return { link: link };

  function link(scope, el, attrs) {
    var handler,
        callback = $parse(attrs.stripeCheckout);

    StripeCheckout.load()
      .then(function() {
        handler = StripeCheckout.configure(getOptions(el));
      });

    el.on("click",function() {
      if (handler) handler.open().then(callback(scope));
    });
  }

  function getOptions(el) {
    var opt, val,
        options = {};

    for (opt in OPTION_ATTRIBUTE_MAP) {
      val = el.attr(OPTION_ATTRIBUTE_MAP[opt]);
      if (typeof val !== "undefined")
        options[opt] = val;
    }

    return options;
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

  this.load.$inject = ["StripeCheckout"];


  this.$get = function($document, $q) {
    return new StripeCheckoutService($document,$q,defaults);
  };

  this.$get.$inject = ["$document", "$q"];
}


function StripeCheckoutService($document, $q, providerDefaults) {
  var defaults = {},
      promise;

  this.configure = function(options) {
    return new StripeHandlerProxy($q,extend({},
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


function StripeHandlerProxy($q, options) {
  var deferred, handler, success,
      closedCallback = options.closed,
      tokenCallback = options.token;

  options.token = function(token) {
    if (tokenCallback) tokenCallback(token);

    deferred.resolve(token);
    setup();
  };

  options.closed = function() {
    if (closedCallback) closedCallback();

    if (!success) {
      deferred.reject();
      setup();
    }
  };

  setup();

  this.open = function(openOptions) {
    handler.open(openOptions);
    return deferred.promise;
  };

  function setup() {
    deferred = $q.defer();
    handler = StripeCheckout.configure(options);
    success = false;
  }
}


function extend(dest/*, src... */) {
  var key, src,
      i = 1,
      len = arguments.length;

  for (; i < len; i++) {
    src = arguments[i];
    for (key in src) {
      if (src.hasOwnProperty(key))
        dest[key] = src[key];
    }
  }

  return dest;
}

function loadLibrary($document, $q) {
  return $q(function(resolve, reject) {
    var doc = $document[0],
        script = doc.createElement("script");
    script.src = STRIPE_CHECKOUT_URL;

    script.onload = function() {
      resolve();
    }
    
    script.onreadystatechange = function() {
      var rs = this.readyState;
      if (rs === "loaded" || rs === "complete")
        resolve();
    };

    script.onerror = function() {
      reject(new Error("Unable to load checkout.js"));
    };

    var container = doc.getElementsByTagName("head")[0];
    container.appendChild(script);
  });
}

})();
