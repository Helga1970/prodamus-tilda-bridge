// Импорт необходимых модулей
const axios = require('axios');
const querystring = require('querystring');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let prodamusData;
  try {
    // Пытаемся распарсить как JSON
    prodamusData = JSON.parse(event.body);
  } catch (e) {
    // Если не JSON, парсим как URL-кодированные данные
    prodamusData = querystring.parse(event.body);
  }

  // Проверяем статус платежа. Используем payment_status
  if (prodamusData.payment_status !== 'success') {
    console.log('Статус платежа не "success", прекращаем работу.');
    return { statusCode: 200, body: 'Payment not successful, no action taken' };
  }
  
  const userEmail = prodamusData.customer_email || prodamusData.payer_email;
  const userName = prodamusData.customer_name || prodamusData.payer_name || prodamusData.client_name;
  
  // Используем поле 'sum' и преобразуем его в число
  const paymentAmount = Number(prodamusData.sum); 

  let groupId;

  // Проверяем сумму платежа и выбираем нужную группу
  if (paymentAmount === 350) {
    groupId = '1349921'; // ВОССТАНОВЛЕННЫЙ ID ГРУППЫ
  } else if (paymentAmount === 3000) {
    groupId = '1360885';
  } else {
    console.log('Сумма платежа не соответствует ни одному тарифу.');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Unknown payment amount, no action taken" })
    };
  }

  const tildaApiUrl = `https://api.tildacdn.info/v1/updateuser/`; 
  const tildaApiKey = process.env.TILDA_API_KEY;

  try {
    const response = await axios.post(tildaApiUrl, {
      publickey: 'gpesp7k6wvdz3iced0lu',
      secretkey: tildaApiKey,
      projectid: '420986',
      groupid: groupId, 
      email: userEmail,
      name: userName
    });

    console.log('Ответ от Tilda API:', response.data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" })
    };
  } catch (error) {
    console.error('Ошибка при обращении к Tilda API:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};
