const mongoose = require("mongoose");

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI non défini !");
    }

    await mongoose.connect(uri);
    await mongoose.connection.db.admin().command({ ping: 1 });

    console.log("Health DB OK");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Health DB FAILED:", err.message);
    process.exit(1);
  }
})();

