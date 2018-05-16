const skygearCloud = require('skygear/cloud');
const skygear = require ('skygear');
const stripeKey = process.env.STRIPE_KEY || 'NO_KEY';
const stripe = require("stripe")(stripeKey);

skygearCloud.afterSave('charge', function(record, original, pool, options) {
  console.log(record);
  // Send notification email
}, {
    async: false
});


skygearCloud.afterSave('subscription', function(record, original, pool, options) {
  console.log(record);
  // Send notification email
}, {
    async: false
});

skygearCloud.op('payment', function (param, options) {
  const {
    context
  } = options;
  console.log(param['args']);

  return new Promise(function(resolve, reject){
    stripe.charges.create({
      amount: param['args'].price,
      currency: "usd",
      source: param['args'].token, 
      description: param['args'].description
    }, function(err, charge) {
      if (err) {
        console.log("Error" + JSON.stringify(err))
        reject('err');
      }
      // asynchronously called
      // Skygear save a charge

      resolve(charge);
    });
  });
}, {
  userRequired: false
});


skygearCloud.op('subscribe', function (param, options) {
  const {
    context
  } = options;
  console.log(param['args']);

  let args = param['args'];
  let plan = args.plan
  let token = args.token

  return new Promise((resolve, reject) => {
    stripe.customers.create({
      email: token.email,
      source: token.id,
    }, function(err, customer) {
  // asynchronously called
      console.log("created customer!");
      if (err) {
        console.log(err);
        reject({status: "failed"});
      }
      console.log(customer);
      stripe.subscriptions.create({
        customer: customer.id,
        items: [{plan: plan}],
        billing: 'send_invoice',
        days_until_due: 10,
        }, function(err, subscription) {
          console.log(err);
          console.log(subscription);
          resolve({status: "succeeded"});
        });
    });
  });
}, {
  userRequired: false
});