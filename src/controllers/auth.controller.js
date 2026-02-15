const useModel = require('../models/user.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { sendRegistrationEmail } = require('../services/gmail');


/*
user register controllers
Post api/auth/register
usermodel.create
*/
const userResgisterController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(422).json({ message: "User already exists", status: "failed" });
        }
        const user = await userModel.create({ name, email, password })
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' })
        res.cookie("token", token)
        await sendRegistrationEmail(email, name);
        return res.status(201).json({ message: "User registered successfully", id: user._id, name: user.name, email: user.email })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }
}

/*
user login controllers
Post api/auth/login
usermodel.findOne
*/
const userLoginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "User not found", status: "failed" })
        }
        const isPasswordMatched = await user.comparePassword(password)
        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid credentials", status: "failed" })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' })
        res.cookie("token", token)
        return res.status(200).json({ message: "User logged in successfully", id: user._id, name: user.name, email: user.email })


    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message })
    }

}



module.exports = { userResgisterController, userLoginController };
