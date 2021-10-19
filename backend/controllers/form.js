"use strict";
const nodemailer = require("nodemailer");
const validator = require("validator");
const path = require("path");
const mjmlUtils = require("mjml-utils");

const emailTemplatePath = path.join(__dirname, "../assets/emails/contact-email.html");

const { emailConfig, oAuth2Client } = require("../config/email");

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
          greetingText = "Estimedex";
          break;
      }

      let questionText;
      let answerText;
      switch (contactData.question) {
        case "1":
          questionText = "¿Te salió la Raiden Shogun?";
          answerText = "Sí, aunque por alguna extraña razón es de tipo Anemo.";
          break;
        case "2":
          questionText = "¿Te gustan las canciones del Faraón Love Shady?";
          answerText = "¡Claro que sí, OHHH ME BINGOO oyendo Harley Quinn!";
          break;
        case "3":
          questionText = "¿Ganaste un auto con un mes de trading?";
          answerText = "Tras un mes de trading, me compré 17 autos de lujo y 6 mansiones, pronto te los enseñaré.";
          break;
        case "4":
          questionText = "¿Cuántos bitcoins costaría el cumpleaños de Aliasandria?";
          answerText = "¡Aproximadamente 0,0023 bitcoins, así que aprovecha y celébralo!";
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
      secure: true, // true for 465, false for other ports like 587 */
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
