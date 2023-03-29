const connectToMongo=require("./db")
const express = require('express')
const cors=require("cors")

connectToMongo();
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//Available Routes
app.use("/api/auth",require("./Routes/auth"))
app.use("/api/notes",require("./Routes/notes"))

app.listen(PORT, () => {
  console.log(`cloudnote backend listening on port ${PORT}`)
}) 