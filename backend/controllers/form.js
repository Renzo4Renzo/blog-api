"use strict";
const nodemailer = require("nodemailer");
const validator = require("validator");
const path = require("path");
const mjmlUtils = require("mjml-utils");

const emailTemplatePath = path.join(__dirname, "../assets/emails/contact-email.html");

const { emailConfig } = require("../config/email");
const globalConfig = require("../config/global");

const { google } = require("googleapis");
const oAuth2Client = new google.auth.OAuth2(emailConfig.CLIENT_ID, emailConfig.CLIENT_SECRET, emailConfig.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: emailConfig.REFRESH_TOKEN });

let formController = {
  sendContactEmail: (request, response) => {
    let contactData = request.body;

    try {
      var nameValid = !validator.isEmpty(contactData.name);
      var emailValid = validator.isEmail(contactData.email);
      var genderValid = false;
      if (contactData.gender == "male" || contactData.gender == "female" || contactData.gender == "other") {
        genderValid = true;
      }
      var questionValid = false;
      if (contactData.question >= 1 && contactData.question <= 4) {
        questionValid = true;
      }
      var descriptionValid = !validator.isEmpty(contactData.description);
    } catch (error) {
      return response.status(400).send({
        status: "Error",
        message: "¡No se enviaron todos los campos requeridos!",
      });
    }

    if (!nameValid) {
      return response.status(400).send({
        status: "Error",
        message: "¡El valor del campo 'name' no es válido!",
      });
    } else if (!emailValid) {
      return response.status(400).send({
        status: "Error",
        message: "¡El valor del campo 'email' no es válido!",
      });
    } else if (!genderValid) {
      return response.status(400).send({
        status: "Error",
        message: "¡El valor del campo 'gender' no es válido!",
      });
    } else if (!questionValid) {
      return response.status(400).send({
        status: "Error",
        message: "¡El valor del campo 'question' no es válido!",
      });
    } else if (!descriptionValid) {
      return response.status(400).send({
        status: "Error",
        message: "¡El valor del campo 'description' no es válido!",
      });
    } else {
      let greetingText;
      switch (contactData.gender) {
        case "male":
          greetingText = "Estimado";
          break;
        case "female":
          greetingText = "Estimada";
          break;
        case "other":
          greetingText = "Hola";
          break;
      }

      let questionText;
      let answerText;
      switch (contactData.question) {
        case "1":
          questionText = "¿Qué requisitos necesito para escribir artículos?";
          answerText =
            "No te preocupes, no buscamos escritores profesionales. Estaremos felices de publicar tus artículos siempre que demuestres pasión por el tema que escribes.";
          break;
        case "2":
          questionText = "¿De qué temas puedo escribir artículos?";
          answerText =
            "No hay restricción de temas, siempre que presentes tus puntos de vista con respeto y estos no busquen denigrar a nadie.";
          break;
        case "3":
          questionText = "¿Cúanto tiempo debo esperar para que aprueben mi artículo?";
          answerText =
            "Tu artículo se publicará de inmediato. Sin embargo, si algún moderador detecta que este no es apropiado, procederá a eliminarlo.";
          break;
        case "4":
          questionText = "¿Cuántos artículos puedo publicar?";
          answerText = "¡No hay límite, así que aprovecha y crea tantos como puedas!";
          break;
      }

      let emailData = {
        name: contactData.name,
        email: contactData.email,
        greeting: greetingText,
        question: questionText,
        answer: answerText,
        description: contactData.description,
      };

      mjmlUtils
        .inject(emailTemplatePath, {
          name: contactData.name,
          greeting: greetingText,
          question: questionText,
          answer: answerText,
          path: globalConfig.BASE_URL_IMG,
        })
        .then((emailTemplate) => {
          doSending(
            emailTemplate,
            emailData,
            (info) => {
              if (info.accepted) {
                return response.status(200).send({
                  status: "Ok",
                  message: `¡Correo Enviado exitosamente con el ID ${info.messageId}!`,
                });
              } else if (info.rejected) {
                return response.status(500).send({
                  status: "Error",
                  message: `¡No se pudo enviar la respuesta al correo ${contactData.email}!`,
                });
              } else console.log(info);
            },
            (error) => {
              if (error.code == "EENVELOPE") {
                return response.status(500).send({
                  status: "Error",
                  message: `¡El servicio de envío de correo no logra procesar el destinatario del correo!`,
                });
              } else if (error.code == "EAUTH") {
                return response.status(500).send({
                  status: "Error",
                  message: `¡Las credenciales de autenticación usadas para el envío de correo son erróneas!`,
                });
              } else console.log(error);
            }
          );
        })
        .catch((error) => {
          if (error.code == "ENOENT") {
            return response.status(500).send({
              status: "Error",
              message: `¡No se encontró la ruta de la plantilla del correo electrónico!`,
            });
          } else console.log(error);
        });
    }
  },
};

async function doSending(emailTemplate, emailData, callbackOk, callbackError) {
  try {
    let accessToken = await oAuth2Client.getAccessToken();
    let transporter = nodemailer.createTransport({
      /* host: "smtp.gmail.com",
      port: 465,
      secure: true, */ // true for 465, false for other ports like 587
      /* auth: {
        user: emailConfig.USER,
        pass: emailConfig.PASSWORD,
      }, */
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: emailConfig.USER,
        clientId: emailConfig.CLIENT_ID,
        clientSecret: emailConfig.CLIENT_SECRET,
        refreshToken: emailConfig.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    let sendInfo = await transporter.sendMail({
      from: "Squish Company <customerservice@squish.com>",
      to: emailData.email,
      subject: "Respuesta: " + emailData.question,
      text: "¡Oh no! ¡El correo no se puede mostrar en este cliente de correo electrónico!",
      html: emailTemplate,
    });
    callbackOk(sendInfo);
  } catch (error) {
    callbackError(error);
  }
}

module.exports = formController;
