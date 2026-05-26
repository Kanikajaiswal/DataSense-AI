const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const { data } = req.body;

    const prompt = `
Analyze this sales dataset and provide business insights:

${JSON.stringify(data).slice(0, 1500)}
`;

    const response = await axios.post(

      "https://openrouter.ai/api/v1/chat/completions",

      {
        model: "deepseek/deepseek-chat-v3-0324:free",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },

      {
        headers: {
          Authorization:
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type": "application/json",
        },
      }
    );

    const insight =
      response.data.choices[0].message.content;

    res.json({
      insight,
    });

  } catch (error) {

    console.log(error.response?.data);

    res.status(500).json({
      error: "AI failed",
    });
  }
});

module.exports = router;