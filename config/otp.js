const AccountSID = process.env.AccountSID;
const ServiceSID = process.env.ServiceSID;
const AuthToken = process.env.AuthToken;

const client = require("twilio")(AccountSID, AuthToken);

client.verify.v2.services.create({ friendlyName: "G E" }).then(() => console.log("OTP Ready"));

function sendotp(mobile) {
    client.verify.v2
        .services(ServiceSID)
        .verifications.create({ to: `+91${mobile}`, channel: "sms" })
        .then((verification) => console.log(verification.status));
    console.log("send otp function");
    console.log(mobile);
}

function verifyotp(mobile, otp) {
    return new Promise((resolve, reject) => {
        client.verify.v2
            .services(ServiceSID)
            .verificationChecks.create({ to: `+91 ${mobile}`, code: otp })
            .then((verification_check) => {
                console.log(verification_check.status);
                resolve(verification_check);
            });
    });
}

module.exports = {
    sendotp,
    verifyotp,
};

// const client = require("twilio")(AccountSID, AuthToken);
// exports.otpCalling = (number) => {
//     console.log(number);
//     client.verify.services(ServiceSID).verifications.create({
//         to: `+91${number}`,
//         channel: "sms",
//     });
// };
// exports.otpVeryfication = (otp, userNumber) => {
//     console.log(otp);
//     return new Promise((resolve, reject) => {
//         client.verify.v2
//             .services(ServiceSID)
//             .verificationChecks.create({ to: `+91${userNumber}`, code: otp })
//             .then((response) => {
//                 if (response.valid) resolve(true);
//                 else resolve(false);
//             });
//     });
// };

// const sid = process.env.SID;
// const token = process.env.AUTH_TOKEN;
// const serviceid = process.env.SSID;
