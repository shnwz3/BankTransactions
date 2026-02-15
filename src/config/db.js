const moongoose = require('mongoose');

const connectDb = async () => {
    try {
        await moongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDb;