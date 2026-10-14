const { randomUUID } = require("node:crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const sns = new SNSClient({});

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
  "Content-Type": "application/json",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event?.httpMethod === "OPTIONS" || event?.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const topicArn = process.env.SNS_TOPIC_ARN;
  if (!topicArn) {
    console.error("Missing required environment variable: SNS_TOPIC_ARN");
    return response(500, { message: "Error interno del servidor." });
  }

  let body;
  try {
    if (typeof event?.body === "string") {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
      body = JSON.parse(rawBody);
    } else {
      body = event?.body;
    }
  } catch (error) {
    console.warn("Request body is not valid JSON.", error);
    return response(400, { message: "El cuerpo de la solicitud debe ser JSON válido." });
  }

  const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!nombre || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response(400, {
      message: "Se requieren un nombre y un email válido.",
    });
  }

  const registro = {
    id: randomUUID(),
    nombre,
    email,
    timestamp: new Date().toISOString(),
  };

  try {
    await dynamoDb.send(new PutCommand({
      TableName: "ContactosFormulario",
      Item: registro,
    }));

    await sns.send(new PublishCommand({
      TopicArn: topicArn,
      Subject: "Nuevo registro de contacto",
      Message: JSON.stringify({
        mensaje: "Se ha recibido un nuevo registro de contacto.",
        nombre: registro.nombre,
        email: registro.email,
      }),
    }));

    return response(200, {
      message: "Registro recibido correctamente.",
      id: registro.id,
      timestamp: registro.timestamp,
    });
  } catch (error) {
    console.error("Failed to process contact submission.", error);
    return response(500, { message: "No se pudo procesar la solicitud." });
  }
};
