"use strict";
const { google } = require("googleapis");

const emailConfig = {
  USER: "darkboxper@gmail.com",
  PASSWORD: "darboxper1996",
  CLIENT_ID: "369164485640-01ip963rhd8mrolasda3lqm8v0tfutlq.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REDIRECT_URI: "https://developers.google.com/oauthplayground",
  REFRESH_TOKEN:
    "1//04tCrzqwFfW1FCgYIARAAGAQSNwF-L9IrEMWudIKJBmDkAa7g0_YVYfI2cZ30o4N12IWYfydmdZUbnZm63JP6ioyc2XiNDs78Ruc",
};

const oAuth2Client = new google.auth.OAuth2(emailConfig.CLIENT_ID, emailConfig.CLIENT_SECRET, emailConfig.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: emailConfig.REFRESH_TOKEN });

module.exports = { emailConfig, oAuth2Client };
