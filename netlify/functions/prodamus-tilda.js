const axios = require("axios");
const qs = require("querystring");

exports.handler = async function(event, context) {
  try {
    console.log("Received event:", event.body);

    // 1️⃣ Получаем данные от Prodamus
    const body = JSON.parse(event.body);
    const { name, email, rate, data } = body;

    if (!name || !email || !rate || !data) {
      console.error("Missing required fields:", body);
      return { statusCode: 400, body: "Missing required fields" };
    }

    // 2️⃣ Вычисляем срок доступа
    const days = rate === 350 ? 30 : rate === 3000 ? 365 : null;
    if (!days) {
      console.error("Invalid rate:", rate);
      return { statusCode: 400, body: "Invalid rate" };
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    const expirationStr = expirationDate.toISOString().split("T")[0];

    console.log("Calculated expiration date:", expirationStr);

    // 3️⃣ Добавляем пользователя в Tilda
    const TILDA_PUBLIC_KEY = "gpesp7k6wvdz3iced0lu";
    const TILDA_SECRET_KEY = "3db1e83f29703b9778db";
    const PROJECT_ID = 420986;
    const GROUP_ID = 1349921;

    console.log("Posting to Tilda:", { email, name, expirationStr });

    const tildaResponse = await axios.post(
      "https://api.tilda.cc/v1/members/add",
      qs.stringify({
        publickey: TILDA_PUBLIC_KEY,
        secretkey: TILDA_SECRET_KEY,
        projectid: PROJECT_ID,
        groupid: GROUP_ID,
        email,
        name,
        expiration: expirationStr
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("Tilda response:", tildaResponse.data);

    // 4️⃣ Записываем данные в Google Sheet (Sheet.best)
    const SHEET_BEST_URL = "https://api.sheet.best/sheets/5d3aa812-9621-4f76-9bc8-fa0583813ede";
    const SHEET_BEST_KEY = "qABz_WB-ZPrZTaqdXqEyhY7e0S$_gekFQZN6El0qc6P7B$7YPKmb_VZHDrmfzcvh";

    const sheetResponse = await axios.post(
      SHEET_BEST_URL,
      { name, "e-mail": email, data, rate },
      { headers: { "X-Api-Key": SHEET_BEST_KEY } }
    );

    console.log("Sheet.best response:", sheetResponse.data);

    // ✅ Всё прошло успешно
    return { statusCode: 200, body: "Success" };

  } catch (err) {
    console.error("Error caught in handler:", err.message, err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
