const axios = require("axios");
const qs = require("querystring");

exports.handler = async function(event, context) {
  console.log("=== Function invoked ===");
  console.log("Received event body:", event.body);

  try {
    // 1️⃣ Получаем данные от Prodamus
    if (!event.body) {
      console.error("No body in request");
      return { statusCode: 400, body: "Missing request body" };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message);
      return { statusCode: 400, body: "Invalid JSON" };
    }

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

    // ✅ Здесь можно вставлять вызовы Tilda и Sheet.best
    return { statusCode: 200, body: JSON.stringify({ message: "Function works!" }) };

  } catch (err) {
    console.error("Error caught in handler:", err.message, err.stack);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
