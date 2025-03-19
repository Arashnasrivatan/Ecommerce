const response = require("./../utils/response");
const SubCategory = require("./../models/SubCategory");
const ParentCategory = require("./../models/Category");
const { isValidObjectId } = require("mongoose");

exports.getAllSubCategories = async (req, res, next) => {
  try {
    const subCategories = await SubCategory.find({}).populate("parent");

    if (!subCategories) {
      return response(res, 404, "SubCategories not found !!");
    }

    return response(res, 200, "SubCategories fetched successfully", {
      subCategories,
    });
  } catch (err) {
    next(err);
  }
};

exports.createSubCategory = async (req, res, next) => {
  try {
    let { title, slug, parent, filters } = req.body;

    const parentCheck = await ParentCategory.findOne({
      _id: parent,
      parent: { $ne: null },
    });
    if (!parentCheck) {
      return response(
        res,
        400,
        "Parent ID or its a main category is not correct !!"
      );
    }

    const duplicateTitle = await SubCategory.findOne({ title });
    if (duplicateTitle) {
      return response(res, 400, "Title already exists for this category !!");
    }
    const duplicateSlug = await SubCategory.findOne({ slug });
    if (duplicateSlug) {
      return response(res, 400, "Slug already exists for this category !!");
    }

    const category = await SubCategory.create({
      title,
      slug,
      parent,
      filters,
    });

    return response(res, 201, "SubCategory created successfully", {
      category,
    });
  } catch (err) {
    next(err);
  }
};

exports.getSubCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    if (!isValidObjectId(categoryId)) {
      return response(res, 400, "Invalid Category ID !!");
    }
    const subCategory = await SubCategory.findById(categoryId);
    if (!subCategory) {
      return response(res, 404, "SubCategory not found !!");
    }
    return response(res, 200, "SubCategory fetched successfully ", {
      subCategory,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    if (!isValidObjectId(categoryId)) {
      return response(res, 400, "Invalid Category ID !!");
    }

    const subCategory = await SubCategory.findByIdAndDelete(categoryId);

    if (!subCategory) {
      return response(res, 404, "SubCategory not found !!");
    }

    return response(res, 200, "SubCategory deleted successfully", {
      subCategory,
    });
  } catch (err) {
    next(err);
  }
};

exports.editSubCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { title, slug, parent, filters } = req.body;

    if (parent) {
      const parentCheck = await ParentCategory.findOne({
        _id: parent,
        parent: { $ne: null },
      });
      if (!parentCheck) {
        return response(
          res,
          400,
          "Parent ID or its a main category is not correct !!"
        );
      }
    }

    const duplicateTitle = await SubCategory.findOne({ title });
    if (duplicateTitle) {
      return response(res, 400, "Title already exists for this category !!");
    }
    const duplicateSlug = await SubCategory.findOne({ slug });
    if (duplicateSlug) {
      return response(res, 400, "Slug already exists for this category !!");
    }

    if (!isValidObjectId(categoryId)) {
      return response(res, 400, "Invalid Category ID !!");
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      categoryId,
      title,
      slug,
      parent,
      filters
    );

    if (!subCategory) {
      return response(res, 404, "SubCategory not found !!");
    }

    return response(res, 200, "SubCategory updated successfully", {
      subCategory,
    });
  } catch (err) {
    next(err);
  }
};
