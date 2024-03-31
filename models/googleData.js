const { Schema, model } = require("mongoose");

const googleUserSchema = new Schema({
    googleId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false 
    }
})

module.exports = model("GoogleUser", googleUserSchema);