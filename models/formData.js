const { Schema, model } = require("mongoose");

const formDataSchema = new Schema({
    fname: {
        type: String,
        required: true
    },

    lname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    dob: {
        type: Date,
        required: true
    },
    
    address: {
        type: String,  
        required: true
    },

    phone: {
        type: Number,
        required: true
    },

    havePets: {
        type: String,
        required: false
    },
    
    haveChildren: {
        type: String,
        required: false
    },
    userId : {
        type: Schema.Types.ObjectId,
        required: true
    },
    petId : {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "petData"
    }
});

module.exports = model("FormData", formDataSchema);
