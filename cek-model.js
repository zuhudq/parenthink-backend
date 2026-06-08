require("dotenv").config();

fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
)
  .then((res) => res.json())
  .then((data) => {
    if (data.error) {
      console.error("❌ Error API:", data.error.message);
      return;
    }
    const validModels = data.models
      .filter(
        (m) =>
          m.supportedGenerationMethods.includes("generateContent") &&
          m.name.includes("gemini"),
      )
      .map((m) => m.name.replace("models/", "")); // Menghapus awalan 'models/' agar bersih

    console.log("✅ NAMA MODEL YANG TERSEDIA UNTUK API KEY KAMU:");
    console.log(validModels);
  })
  .catch((err) => console.error("Error jaringan:", err));
