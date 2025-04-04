const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

module.exports = {
  swaggerUi,
  specs: swaggerDocument,
};
