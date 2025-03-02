const response = require("./../utils/response");
const Category = require("./../models/Category");
const SubCategory = require("./../models/SubCategory");
const slugify = require("slugify");
const { isValidObjectId } = require("mongoose");

exports.fetchAllCategories = async (req, res, next) => {
  try {
    const fetchSubcategoriesRecursively = async (parentId = null) => {
      const subCategories = await SubCategory.find({ parent: parentId });
      const parentSubCategories = await Category.find({
        parent: parentId,
      }).lean();

      const fetchedParentSubCategories = [];

      for (const category of parentSubCategories) {
        category.subCategories = await fetchSubcategoriesRecursively(
          category._id
        );

        fetchedParentSubCategories.push(category);
      }

      return [...fetchedParentSubCategories, ...subCategories];
    };

    const categories = await fetchSubcategoriesRecursively(null);

    return response(res, 200, "Categories fetched successfully !!", {
      categories,
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    let { title, slug, parent, filters } = req.body;

    if (parent) {
      if (!isValidObjectId(parent)) {
        return response(res, 400, "Invalid parent category ID");
      }

      const parentCategory = await Category.findOne({
        _id: parent,
        parent: null,
      });
      if (!parentCategory) {
        return response(res, 404, "Parent category not found");
      }
    }

    const duplicateTitle = await Category.findOne({ title });
    if (duplicateTitle) {
      return response(res, 400, "Category title already exists");
    }

    const duplicateSlug = await Category.findOne({ slug });
    if (duplicateSlug) {
      return response(res, 400, "Category slug already exists");
    }

    const newCategory = await Category.create({
      title,
      slug: slugify(slug, { lower: true }),
      parent,
      filters,
    });

    return response(res, 201, "Category created successfully !!", {
      category: newCategory,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    if (!isValidObjectId(categoryId)) {
      return response(res, 400, "Category ID is not valid !!");
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return response(res, 404, "Category not found !!");
    }

    let deletedSubcategories = null;
    let deletedSubSubCategories = null;

    if (!category.parent) {
      deletedSubcategories = await Category.find({ parent: categoryId });
      await Category.deleteMany({ parent: categoryId });

      const subCategoryIds = deletedSubcategories.map((sub) => sub._id);

      deletedSubSubCategories = await SubCategory.deleteMany({
        parent: { $in: subCategoryIds },
      });
    } else {
      deletedSubSubCategories = await SubCategory.deleteMany({
        parent: categoryId,
      });
    }

    return response(
      res,
      200,
      "Category and its subcategories deleted successfully",
      {
        category,
        deletedSubcategories,
        deletedSubSubCategories,
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.editCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    if (!isValidObjectId(categoryId)) {
      return response(res, 400, "Category ID is not valid !!");
    }

    let { title, slug, parent, filters } = req.body;

    if (parent) {
      if (!isValidObjectId(parent)) {
        return response(res, 400, "Invalid parent category ID");
      }

      const parentCategory = await Category.findOne({
        _id: parent,
        parent: null,
      });
      if (!parentCategory) {
        return response(res, 404, "Parent category not found");
      }
    }

    if (title) {
      const duplicateTitle = await Category.findOne({
        title,
        _id: { $ne: categoryId },
      });

      if (duplicateTitle) {
        return response(res, 400, "Title already exists !!");
      }
    }

    let newSlug;
    if (slug) {
      const duplicateSlug = await Category.findOne({
        slug,
        _id: { $ne: categoryId },
      });

      if (duplicateSlug) {
        return response(res, 400, "Slug already exists !!");
      }
      newSlug = slugify(slug.toString(), { lower: true })
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        title,
        slug: newSlug,
        parent,
        filters,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return response(res, 404, "Category not found !!");
    }

    return response(res, 200, "Category updated successfully !!", {
      category: updatedCategory,
    });
  } catch (err) {
    next(err);
  }
};
