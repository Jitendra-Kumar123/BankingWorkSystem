const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required for creating account"],
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'invalid email address'],
        unique: [true, "email already exists"],
        lowercase: true
    },
    user: {
        type: String,
        required: [true, "user is required for creating account"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, 'password should be at least 6 character long']
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }

    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
    return next();

})
