// Импорт необходимых модулей
const axios = require('axios');
const querystring = require('querystring'); // Добавьте эту строку

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // --- ЭТО ИСПРАВЛЕННАЯ СТРОКА ---
  const prodamusData = querystring.parse(event.body); 
  // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

  // Обратите внимание: данные из URL-кодированного формата всегда являются строками.
  // Преобразуем сумму в число для правильного сравнения.
  const userEmail = prodamusData.customer_email || prodamusData.payer_email;
  const userName = prodamusData.customer_name || prodamusData.payer_name || prodamusData.client_name;
  
  const paymentAmount = Number(prodamusData.amount || prodamusData.price); 

  let groupId;

  // Проверяем точную сумму платежа
  if (paymentAmount === 350) {
    groupId = '1349921';
  } else if (paymentAmount === 3000) {
    groupId = '1360885';
  } else {
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

    console.log('Tilda API response:', response.data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" })
    };
  } catch (error) {
    console.error('Error with Tilda API:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};
