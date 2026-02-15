require('dotenv').config();
const app = require('./src/app.js')

const connectDb = require('./src/config/db.js');
connectDb();

const Port = process.env.PORT;

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});