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

  return {status: "succeeded"};

  // return new Promise(function(resolve, reject){
  //   stripe.charges.create({
  //     amount: param['args'].price,
  //     currency: "usd",
  //     source: param['args'].token, 
  //     description: param['args'].description
  //   }, function(err, charge) {
  //     if (err) {
  //       console.log("Error" + JSON.stringify(err))
  //       reject('err');
  //     }
  //     // asynchronously called
  //     resolve(charge);
  //   });
  // });
}, {
  userRequired: false
});