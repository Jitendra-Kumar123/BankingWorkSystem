const mongoose = require('mongoose');

async function ConnectToDB(){
    await mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("server is connected to db")
    })
    .catch((err)=>{
        console.log("error occur connecting to db", err);
    })
}

module.exports = ConnectToDB;