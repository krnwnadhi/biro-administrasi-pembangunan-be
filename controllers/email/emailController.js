const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const EmailMsg = require("../../models/email/Email");
const Filter = require("bad-words");

const emailController = expressAsyncHandler(async (req, res) => {
    const { to, subject, message } = req.body;

    //get the message
    const emailMessage = subject + " " + message;
    const filter = new Filter();

    const isProfane = filter.isProfane(emailMessage);
    if (isProfane) throw new Error("Email sent Failed because of bad words");

    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_ADDRESS_PASSWORD,
            },
            port: 587,
            secure: false, // true for 465, false for other ports
            tls: { rejectUnauthorized: false },
        });

        let msg = {
            to,
            subject,
            text: message,
            from: "adhikurniawan2108@gmail.com",
        };

        //sent email message
        await transporter.sendMail(msg);

        //save to db
        await EmailMsg.create({
            sentBy: req?.user?._id,
            from: req?.user?.email,
            to,
            message,
            subject,
        });

        res.json("Mail Sent");
    } catch (error) {
        res.json(error);
    }
});

module.exports = emailController;
