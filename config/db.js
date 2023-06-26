import mongoose from "mongoose";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

async function connect() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_CONNECTION_URL, options);
    console.log("Connected to the database server");
  } catch (err) {
    console.log(err.stack);
  }
}

const val = 5;

export default connect;
