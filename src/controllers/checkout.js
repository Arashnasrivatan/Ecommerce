const response = require("./../utils/response");
const { createPayment, verifyPayment } = require("./../services/zarinpal");
const Cart = require("./../models/Cart");
const Checkout = require("./../models/Checkout");
const User = require("./../models/User");
const Order = require("./../models/Order");
const Product = require("./../models/Product");
const { isValidObjectId } = require("mongoose");
const { updateCartPrices } = require("./../utils/cartHelper");

exports.createCheckout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return response(res, 404, "User not found");
    }
    const { shippingAddress } = req.body;

    if (!isValidObjectId(shippingAddress)) {
      return response(res, 400, "Invalid shipping address");
    }

    const selectedAddress = user.addresses.find(
      (addr) => {return addr._id.toString() === shippingAddress}
    );

    if (!selectedAddress) {
      return response(res, 400, "Shipping address not found in user addresses");
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart?.items?.length) {
      return response(res, 400, "Cart is empty or not found !!");
    }

    cart = await updateCartPrices(cart);

    const insufficientStockItems = [];
    for (let item of cart.items) {
      if (item.quantity > item.product.stock) {
        insufficientStockItems.push({
          name: item.product.name,
          availableStock: item.product.stock,
        });
      }
    }

    if (insufficientStockItems.length > 0) {
      return response(res, 400, "Some items have insufficient stock", {
        insufficientStockItems,
      });
    }

    if (cart.totalPrice > 2000000000) {
      return response(res, 400, "Total price is more than 2,000,000,000 Rial");
    }

    const checkoutItems = cart.items.map((item) => {return {
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.priceInRial,
    }});

    const newCheckout = await Checkout.create({
      user: user._id,
      items: checkoutItems,
      shippingAddress,
    });

    const payment = await createPayment({
      amountInRial: newCheckout.totalPrice,
      description: `سفارش با شناسه ${newCheckout._id}`,
      mobile: req.user.phone,
    });

    if (!payment || !payment.authority || !payment.PaymentUrl) {
      await newCheckout.deleteOne();
      return response(res, 500, "Payment creation failed !!");
    }

    newCheckout.authority = payment.authority;
    await newCheckout.save();

    const checkout = await Checkout.findById(newCheckout._id).populate(
      "items.product",
      "name images stock priceInRial"
    );

    return response(res, 201, "Checkout created successfully :))", {
      checkout: checkout,
      paymentUrl: payment.PaymentUrl,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyCheckOut = async (req, res, next) => {
  try {
    const { Authority: authority } = req.query;

    const alreadyCreatedOrder = await Order.findOne({ authority });
    if (alreadyCreatedOrder) {
      return response(res, 400, "Payment already verified !!");
    }

    const checkout = await Checkout.findOne({ authority });
    if (!checkout) {
      return response(res, 404, "Checkout not found !!");
    }

    const payment = await verifyPayment({
      amountInRial: checkout.totalPrice,
      authority,
    });

    if (![100, 101].includes(payment.code)) {
      await Checkout.deleteOne({ _id: checkout._id });
      return response(res, 400, "Payment not verified !!");
    }

    const order = await Order.create({
      user: checkout.user,
      authority: checkout.authority,
      items: checkout.items,
      shippingAddress: checkout.shippingAddress,
      postTrackingCode: null
    });

    await order.save();

    for (const item of checkout.items) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    await Cart.findOneAndUpdate({ user: checkout.user }, { items: [] });
    await Checkout.deleteOne({ _id: checkout._id });

    const orderDetails = await Order.findById(order._id)
      .populate("items.product", "name images stock priceInRial")
      .select("-user -shippingAddress")
      .lean();

    const user = await User.findById(order.user);

    if (!user) {
      return response(res, 404, "User not found !!");
    }

    const selectedAddress = user.addresses.find(
      (addr) => {return addr._id.toString() === order.shippingAddress.toString()}
    );

    orderDetails.shippingAddress = selectedAddress;

    return response(res, 200, "Payment verified successfully !!", {
      order: orderDetails,
      totalPrice: order.totalPrice,
    });
  } catch (err) {
    next(err);
  }
};
