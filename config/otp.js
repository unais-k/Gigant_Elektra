// const AccountSID = process.env.AccountSID;
// const ServiceSID = process.env.ServiceSID;
// const AuthToken = process.env.AuthToken;

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
