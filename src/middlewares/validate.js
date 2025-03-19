const response = require("../utils/response");

module.exports =
  (validator, needsBody = false) =>
  {return async (req, res, next) => {
    try {
      const validatedBody = await validator.validate(req.body, {
        abortEarly: false,
      });
      if (needsBody) {
        req.validatedBody = validatedBody;
      }
      next();
    } catch (err) {
      return response(res, 400, err.errors);
    }
  }};
