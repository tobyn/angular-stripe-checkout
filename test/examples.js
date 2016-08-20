/* global after, browser, describe, it */
var assert = require('assert');

var GOT_TOKEN = /Got Stripe token: \S+/;

describe('The simple example',function() {
  it('returns a Stripe token',function() {
    browser.url('/examples/simple.html');

    browser.waitForExist('.stripe_checkout_app');
    browser.click('button');

    browser.frame('stripe_checkout_app');
    browser.waitForVisible('h1');

    assert.equal(browser.getText('h1'),'Simple Example');
    assert.equal(browser.getText('h2'),'Five dollahs!');
    assert.equal(browser.getText('#submitButton'),'Pay $5.00');

    fillStripeCheckout();

    browser.frameParent();

    waitForTokenAlert();
  });

  after(function() {
    browser.alertAccept();
  });
});

describe('The custom example',function() {
  it('returns a Stripe token',function() {
    browser.url('/examples/custom.html');

    browser.waitForExist('h1');
    assert.equal(browser.getText('h1'),'No Stripe Checkout here');
    browser.click('a');

    browser.waitForExist('button');
    assert.equal(browser.getText('h1'),'Stripe Checkout has been loaded');
    browser.click('button');

    browser.frame('stripe_checkout_app');
    browser.waitForVisible('h1');

    assert.equal(browser.getText('h1'),'Custom Example');
    assert.equal(browser.getText('h2'),'Ten dollahs!');
    assert.equal(browser.getText('#submitButton'),'Pay $10.00');

    fillStripeCheckout();

    browser.frameParent();

    waitForTokenAlert();
  });

  after(function() {
    browser.alertAccept();
  });
});


function fillStripeCheckout() {
  browser.setValue('#email','test@example.com');

  browser.addValue('#card_number','4242');
  browser.addValue('#card_number','4242');
  browser.addValue('#card_number','4242');
  browser.addValue('#card_number','4242');

  browser.addValue('#cc-exp','12');
  browser.addValue('#cc-exp','60');

  browser.setValue('#cc-csc','123');

  browser.click('#submitButton');
}

function waitForTokenAlert() {
  browser.waitUntil(function() {
    try {
      return GOT_TOKEN.test(browser.alertText());
    } catch (e) {
      return false;
    }
  },10000,'Expected an alert with the Stripe token');
}
