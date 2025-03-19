const response = require("../utils/response");

exports.errorHandler = async (err, req, res) => {
  try {
    if (err.name === "ValidationError") {
      const errors = Object.keys(err.errors).reduce((acc, key) => {
        acc.push({
          field: key,
          message: err.errors[key].message,
          type: err.errors[key].name,
          value: err.errors[key].value,
          path: err.errors[key].path,
        });

        return acc;
      }, []);

      console.error(err);
      return response(res, 400, "Validation Error", errors);
    }

    let errors;
    let message = err.message || "Internal Server Error";
    let status = err.status || 500;

    if (err.name === "SyntaxError") {
      status = 400;
      message = "Syntax Error";
    }

    console.error(err);
    return response(res, status, `ErrorHandler: ${message}`, errors);
  } catch (error) {
    console.error(error);
  }

};

