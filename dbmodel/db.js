const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');


try{
  
 const connection = mongoose.createConnection('mongodb+srv://ciriktazumo:iwYUCXCu3sm1bQuE@joshua.gs3va5s.mongodb.net/?retryWrites=true&w=majority');

// Initialize mongoose-auto-increment with the Mongoose connection
autoIncrement.initialize(connection);

// Create the user schema
const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  user_name: String,
  bank_accounts: [String],
  name: String,
  accounts: {
    bank: String,
    branch: String,
    address: String,
    city: String,
    district: String,
    state: String,
    bank_code: String,
    weather: {
      temp: Number,
      humidity: Number
    }
  }
});





// Create the User model
const UserModel = connection.model('User', userSchema);
console.log("connected");

// Export the User model
module.exports = {UserModel};

}catch(error){
  console.log("error in db.js",error.message);
}
