import mongoose from "mongoose";
const CONNECTION_URL = "mongodb+srv://osama:osama@ags@ags.xxcirog.mongodb.net/ags?retryWrites=true&w=majority";

// const CONNECTION_URL = "mongodb+srv://osama:osamad12345@clusterags.l4fftvt.mongodb.net/ags?retryWrites=true&w=majority";
//const CONNECTION_URL = "mongodb+srv://osama:12345@cluster0.t3bbjxg.mongodb.net/?retryWrites=true&w=majority";
// Options for the database connection
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

async function connect() {
  try {
    // Connect to the database
    await mongoose.connect(CONNECTION_URL, options);
    console.log("Connected to the database server");
  } catch (err) {
    console.log(err.stack);
  }
}

const val = 5;

export default connect;
