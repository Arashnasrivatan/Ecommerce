const configs = require("./../configs");

exports.createPayment = async ({ amountInRial, description, mobile }) => {
  try {
    const response = await fetch(
      `${configs.zarinpal.ZARINPAL_API_BASE_URL}request.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: configs.zarinpal.ZARINPAL_MERCHANT,
          callback_url: configs.zarinpal.ZARINPAL_CALLBACK_URL,
          amount: amountInRial,
          description,
          metaData: mobile,
        }),
      }
    );

    const data = await response.json();
    
    return {
      authority: data.data.authority,
      PaymentUrl: configs.zarinpal.ZARINPAL_PAYMENT_BASE_URL + data.data.authority,
    };
  } catch (error) {
    throw new Error(error.response ? error.response.data : error.message);
  }
};

exports.verifyPayment = async function ({ amountInRial, authority }) {
  try {
    const response = await fetch(
      `${configs.zarinpal.ZARINPAL_API_BASE_URL}verify.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: configs.zarinpal.ZARINPAL_MERCHANT,
          amount: amountInRial,
          authority,
        }),
      }
    );

    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err);
  }
};
