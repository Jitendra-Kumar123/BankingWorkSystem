require('dotenv').config();
const ConnectToDB = require("./src/config/db.js");
const app = require("./src/app.js");

const port = 3000 || process.env.port;
ConnectToDB();


app.listen(port, ()=>{
    console.log("server is running on port 3000");
})