const configs = require("./../configs");

const sendSms = async (
  phone,
  parameters,
  templateId = configs.sms.sms_patern
) => {
  try {
    let requestData = JSON.stringify({
      mobile: phone,
      templateId: templateId,
      parameters: parameters,
    });

    const response = await fetch(configs.sms.sms_base_url, {
      method: "POST",
      headers: {
        "x-api-key": configs.sms.sms_api_key,
        "Content-Type": "application/json",
      },
      body: requestData,
    });
    const data = await response.json();
    return data;
  } catch (err) {
    return err;
  }
};

module.exports = { sendSms };
