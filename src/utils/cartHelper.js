const Cart = require("./../models/Cart");
const Product = require("./../models/Product");

exports.updateCartPrices = async (cart) => {
  let updated = false;

  for (let item of cart.items) {
    const product = await Product.findById(item.product);
    if (product && product.priceInRial !== item.price) {
      item.price = product.priceInRial;
      updated = true;
    }
  }

  if (updated) {
    await cart.save();
  }

  return cart.populate("items.product", "name images stock priceInRial");
};
