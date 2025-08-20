// Импорт необходимых модулей
const axios = require('axios');

exports.handler = async (event) => {
  // Проверка метода запроса
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Парсинг данных из вебхука Продамуса
  const prodamusData = JSON.parse(event.body);

  // Проверка статуса платежа
  if (prodamusData.status !== 'success') {
    return { statusCode: 200, body: 'Payment not successful, no action taken' };
  }

  // Извлечение данных пользователя (email и имя)
  // Названия полей (customer_email, customer_name) должны соответствовать тому,
  // как их отправляет Продамус.
  const userEmail = prodamusData.customer_email;
  const userName = prodamusData.customer_name;

  // --- Запрос к API Тильды ---
  const tildaApiUrl = `https://api.tildacdn.info/v1/updateuser/`; 
  const tildaApiKey = process.env.TILDA_API_KEY;

  try {
    const response = await axios.post(tildaApiUrl, {
      publickey: 'gpesp7k6wvdz3iced0lu',
      secretkey: tildaApiKey,
      projectid: '420986', // ID вашего проекта
      groupid: '1349921',  // ID вашей группы
      email: userEmail,
      name: userName // Передача имени пользователя
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
