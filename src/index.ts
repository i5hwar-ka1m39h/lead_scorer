import express, { type Request, type Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import dotenv from "dotenv";

import allRoutes from "./route/allRoutes.js"
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Lead Scoring API",
    version: "1.0.0",
    description: "API documentation for lead scoring and AI classification system",
  },
  servers: [{ url: "v1" }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/route/*.ts"], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/v1", allRoutes)


app.listen(port, ()=>{
    console.log(`listening on port ${port}`);
    
})
