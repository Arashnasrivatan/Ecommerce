const yup = require("yup");

const profileSchema = yup.object().shape({
  fullname: yup
    .string()
    .optional()
    .min(3, "Fullname must be at least 3 characters long")
    .max(50, "Fullname cannot be longer than 50 characters"),
  username: yup
    .string()
    .optional()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot be longer than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
}).test(
  'at-least-one-field',
  'Either fullname or username is required',
  function (value) {
    const { fullname, username } = value;
    return !!(fullname || username);
  }
);

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

const banSchema = yup.object().shape({
  banReason: yup.string().required("ban Reason is required").min(5).max(100),
});

const addAddressSchema = yup.object().shape({});

const updateAddressSchema = yup.object().shape({});

module.exports = {
  profileSchema,
  changeSchema,
  banSchema,
  addAddressSchema,
  updateAddressSchema,
};
