require("dotenv").config()
require("./config/database").connect()
const express = require("express")
const user = require("./model/user")
const User = require("./model/user")
const auth = require("./middleware/auth")

const app = express()

app.use(express.json())

//defining routes
app.post("/register",async (req, res) => {

    try {
        const {first_name,last_name, email, password} = req.body;

        //validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required")
        }

        //check if user already exists
        // validate if user exists in our database
        const oldUser = await User.findOne({ email })

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login")
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10)

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
            email: email.toLowerCase(),
            password: encryptedPassword,
        })

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        )

        //save user token
        user.token = token

        //return new user
        res.status(201).json(user)
    } catch (err) {
        console.log(err)
    }
})

app.post("/login", async (req, res) => {

    try {
        //get user input
        const { email, password} = req.body
        
        //validate user input
        if (!(email && password)) {
            res.status(400).send("All input is required")
        }

        //validate if user already exists in our database
        const user = await User.findOne({ email })

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign (
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            )

            //save user token
            user.token = token

            //user
            res.status(200).json(user)
        }
        res.status(400).send("Invalid Credentials")
    } catch (err) {
        console.log(err)
    }

})

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome!")
})


module.exports = app