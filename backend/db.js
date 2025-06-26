const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://imrantech:Billion%4025@cluster0.pdu9x.mongodb.net/Paytm-mini');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
});

const User = mongoose.model('User', userSchema);

module.exports = {
    User
};