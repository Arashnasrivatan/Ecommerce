const yup = require("yup");

const iranBounds = {
  latMin: 25.0,
  latMax: 39.5,
  lngMin: 44.0,
  lngMax: 63.5,
};

const profileSchema = yup
  .object()
  .shape({
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
  })
  .test(
    "at-least-one-field",
    "Either fullname or username is required",
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

const addAddressSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  postalCode: yup
    .string()
    .required("Postal code is required")
    .length(10, "Postal code must be exactly 10 digits")
    .matches(
      /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/,
      "please enter a valid postal code"
    ), // IRAN Postal Code Length
  location: yup.object().shape({
    lat: yup
      .number()
      .required("Latitude is required")
      .min(iranBounds.latMin, `Latitude must be at least ${iranBounds.latMin}`)
      .max(iranBounds.latMax, `Latitude must be at most ${iranBounds.latMax}`),
    lng: yup
      .number()
      .required("Longitude is required")
      .min(iranBounds.lngMin, `Longitude must be at least ${iranBounds.lngMin}`)
      .max(iranBounds.lngMax, `Longitude must be at most ${iranBounds.lngMax}`),
  }),
  address: yup.string().required("Address is required"),
});

const updateAddressSchema = yup.object().shape({
  name: yup.string().optional("Name is required"),
  postalCode: yup
    .string()
    .optional("Postal code is required")
    .matches(
      /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/,
      "Postal code must be exactly 10 digits"
    ), // IRAN Postal Code Length
  location: yup.object().shape({
    lat: yup
      .number()
      .optional("Latitude is required")
      .min(iranBounds.latMin, `Latitude must be at least ${iranBounds.latMin}`)
      .max(iranBounds.latMax, `Latitude must be at most ${iranBounds.latMax}`),
    lng: yup
      .number()
      .optional("Longitude is required")
      .min(iranBounds.lngMin, `Longitude must be at least ${iranBounds.lngMin}`)
      .max(iranBounds.lngMax, `Longitude must be at most ${iranBounds.lngMax}`),
  }),
  address: yup.string().optional("Address is required"),
});

module.exports = {
  profileSchema,
  changeSchema,
  banSchema,
  addAddressSchema,
  updateAddressSchema,
};
