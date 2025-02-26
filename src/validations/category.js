const yup = require("yup");

const categoryFiltersSchema = yup.object().shape({
  name: yup.string().required("Category filter name is required").trim(),
  slug: yup
    .string()
    .required("Category slug is required")
    .trim()
    .matches(
      /^[a-z0-9_-]+$/,
      "Slug can only contain lowercase letters(a-z), numbers(0-9),underscore (_), and hyphens (-)"
    )
    .max(255, "Category slug cannot exceed 255 characters"),
  description: yup.string().trim(),
  type: yup
    .string()
    .required("Category Filter type is required")
    .oneOf(["radio", "selectbox", "range"]),
  required: yup.boolean().default(false),
  options: yup.array().when("type", {
    is: (typeName) => ["radio", "selectbox"].includes(typeName),
    then: () =>
      yup
        .array()
        .required("selectbox and radio fields need an options array")
        .min(1, "selectbox and radio fields need at least one option")
        .of(yup.string()),
  }),
  min: yup.number().when("type", {
    is: "range",
    then: () => yup.number().required("Number field requires a minimum value"),
  }),
  max: yup.number().when("type", {
    is: "range",
    then: () => yup.number().required("Number field requires a maximum value"),
  }),
});

const subCategoryValidator = yup.object({
  title: yup
    .string()
    .required("Category title is required")
    .trim()
    .max(255, "Category title cannot exceed 255 characters"),
  slug: yup
    .string()
    .required("Category slug is required")
    .trim()
    .matches(
      /^[a-z0-9_-]+$/,
      "Slug can only contain lowercase letters(a-z), numbers(0-9),underscore (_), and hyphens (-)"
    )
    .max(255, "Category slug cannot exceed 255 characters"),
  parent: yup
    .string()
    .required("Parent ID is required")
    .matches(/^[0-9a-f]{24}$/, "Invalid parent category ID format"),
  filters: yup.array().of(categoryFiltersSchema),
});

const categoryValidator = yup.object({
  title: yup
    .string()
    .required("Category title is required")
    .trim()
    .max(255, "Category title cannot exceed 255 characters"),
  slug: yup
    .string()
    .required("Category slug is required")
    .trim()
    .matches(
      /^[a-z0-9_-]+$/,
      "Slug can only contain lowercase letters(a-z), numbers(0-9),underscore (_), and hyphens (-)"
    )
    .max(255, "Category slug cannot exceed 255 characters"),
  parent: yup
    .string()
    .optional("category parent is required")
    .matches(/^[0-9a-f]{24}$/, "Invalid parent category ID format"),
  filters: yup.array().of(categoryFiltersSchema),
});

const categoryEditValidator = yup.object({
  title: yup
    .string()
    .trim()
    .max(255, "Category title cannot exceed 255 characters"),
  slug: yup
    .string()
    .trim()
    .matches(
      /^[a-z0-9_-]+$/,
      "Slug can only contain lowercase letters(a-z), numbers(0-9),underscore (_), and hyphens (-)"
    )
    .max(255, "Category slug cannot exceed 255 characters"),
  parent: yup
    .string()
    .matches(/^[0-9a-f]{24}$/, "Invalid parent category ID format"),
  filters: yup.array().of(categoryFiltersSchema),
});

module.exports = {
  subCategoryValidator,
  categoryValidator,
  categoryEditValidator,
};
