
const mongoose = require("mongoose");

(async () => {
  try {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}` +
      `@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_NAME}` +
      `?retryWrites=true&w=majority`;
    await mongoose.connect(uri);

    // Ping ultra-léger (crée une vraie activité côté Atlas)
    await mongoose.connection.db.admin().command({ ping: 1 });

    console.log("Health DB OK");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Health DB FAILED:", err.message);
    process.exit(1);
  }
})();
