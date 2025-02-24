const yup = require("yup");

const changeSchema = yup.object().shape({
  oldPassword: yup
    .string()
    .required("Please enter your current password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  newPassword: yup
    .string()
    .required("Please enter your new password")
    .min(8, "Password cannot be less than 8 characters")
    .max(24, "Password cannot be more than 24 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("newPassword"), null],
      "Confirm password does not match the new password"
    )
    .required("Please confirm your password")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const profileSchema = yup.object().shape({});

const addAddressSchema = yup.object().shape({});

const updateAddressSchema = yup.object().shape({});

module.exports = {
  changeSchema,
  profileSchema,
  addAddressSchema,
  updateAddressSchema,
};
