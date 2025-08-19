const axios = require("axios");

exports.handler = async function(event, context) {
  try {
    // 1. Получаем данные от Prodamus
    const body = JSON.parse(event.body);
    const { name, email, rate, data } = body;

    // Вычисляем срок доступа
    const days = rate === 350 ? 30 : 365;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    const expirationStr = expirationDate.toISOString().split("T")[0];

    // 2. Добавляем пользователя в Tilda
    const TILDA_PUBLIC_KEY = "gpesp7k6wvdz3iced0lu";
    const TILDA_SECRET_KEY = "3db1e83f29703b9778db";
    const PROJECT_ID = 420986;
    const GROUP_ID = 1349921;

    await axios.post("https://api.tilda.cc/v1/members/add", null, {
      params: {
        publickey: TILDA_PUBLIC_KEY,
        secretkey: TILDA_SECRET_KEY,
        projectid: PROJECT_ID,
        groupid: GROUP_ID,
        email,
        name,
        expiration: expirationStr
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    // 3. Записываем данные в Google Sheet (Sheet.best)
    const SHEET_BEST_URL = "https://api.sheet.best/sheets/5d3aa812-9621-4f76-9bc8-fa0583813ede";
    const SHEET_BEST_KEY = "qABz_WB-ZPrZTaqdXqEyhY7e0S$_gekFQZN6El0qc6P7B$7YPKmb_VZHDrmfzcvh";

    await axios.post(
      SHEET_BEST_URL,
      { name, "e-mail": email, data, rate },
      { headers: { "X-Api-Key": SHEET_BEST_KEY } }
    );

    return { statusCode: 200, body: "Success" };

  } catch (err) {
    // Если что-то упало, возвращаем ошибку для повторной попытки
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
