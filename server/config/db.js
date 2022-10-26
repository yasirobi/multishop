const mongoose = require("mongoose");


const connect = async () => {
  try {
    await mongoose.connect(process.env.URI, {
      useNewUrlParser: true,
      
      useUnifiedTopology: true
    });
    console.log("connection created");
  } catch (error) {
    console.log(error,'no connection');
  }
};

module.exports = connect
