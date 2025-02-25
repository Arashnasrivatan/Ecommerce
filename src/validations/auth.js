const yup = require("yup");

const sentSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^09[0-9]{9}$/,
      "Phone number must start with 09 and be 11 digits long"
    ),
});

const verifySchema = yup.object().shape({
  fullname: yup.string().required("fullname is required").min(3).max(50),
  
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot be longer than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(24, "Password must be less than 24 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%_*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^09[0-9]{9}$/,
      "Phone number must start with 09 and be 11 digits long"
    ),
  otp: yup
    .string()
    .required("OTP code is required")
    .length(4, "OTP code must be exactly 4 characters long"),
});

const loginSchema = yup.object().shape({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username cannot be longer than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*_?&])[A-Za-z\d@$!%*_?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const forgotSchema = yup.object().shape({
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^09[0-9]{9}$/,
      "Phone number must start with 09 and be 11 digits long"
    ),
});

const resetSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required("Please enter a password")
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

module.exports = {
  sentSchema,
  verifySchema,
  loginSchema,
  forgotSchema,
  resetSchema,
};
