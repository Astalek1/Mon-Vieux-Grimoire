
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Health DB OK");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Health DB FAILED:", err.message);
    process.exit(1);
  }
})();
