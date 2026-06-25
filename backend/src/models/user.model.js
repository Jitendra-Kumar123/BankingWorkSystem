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
    userName: {
        type: String,
        required: [true, "user is required for creating account"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, 'password should be at least 6 character long']
    },
    systemUser: {
        type: Boolean,
        default: false,
        // immutable: true,
        select: false
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return 
    }

    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
    return 

})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;