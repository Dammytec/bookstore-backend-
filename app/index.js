const express = require("express");
const app = express();
const cors = require("cors");
const port = 4000;
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
require("dotenv").config();
const Cart = require("./cart");
const Order = require("./order");
const Item = require("./Item");
const registerModel = require("./register.js");

const authRoutes = require("./Routes/auth/index");
const productRoutes = require("./Routes/product/products.js");
/*const  = ('./product')*/
/*const  = ('./user')*/
//const { signAccessToken } = require("./jwt_helper");

app.use(express.json());
app.use(cors()); // Enable CORS

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/product", productRoutes);

function AuthenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1]; // split the token with a space
  console.log(token);
  if (token === null) return res.status(401).json({ msg: 'unauthorized' });
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.status(403).json({ msg: err.message });
    req.user = user;
    next();
  });
}

app.get("/cart/read/user", (req, res) => {
  res.send("dashboard opened successfully");
});

// Create

// Read
app.listen(port, () => {
  console.log("server running on port 400");
});

const getUsersSortedByFirstnameAsc = async () => {
  try {
    const admin = await registerModel.find().sort({ firstname: 1 });
    console.log(admin);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

// Add to Cart
app.post("/cart", AuthenticateToken, async (req, res) => {
  const user = req.user;
  const userId = user.id;
  console.log(userId)
  console.log(user);
  const {productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json("Field empty");
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log(`No cart found for userId: ${userId}. Creating a new cart.`);
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      console.log(
        `Product found in cart. Updating quantity for productId: ${productId}`
      );
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      console.log(
        `Product not found in cart. Adding new product with productId: ${productId}`
      );
      cart.items.push({ productId, quantity: Number(quantity) });
    }

    const updatedCart = await cart.save();
    console.log("Cart updated successfully:", updatedCart);
    return res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    return res.status(500).json("Error adding to cart");
  }
});

app.get("/cart/read", AuthenticateToken, async (req, res) => {
  const user = req.user;
  try {
    console.log("Fetching all carts"); // Log action for debugging

    // Find all carts
    const carts = await Cart.findOne({ userId: user.id }).populate("items.productId");

    if (!carts || carts.length === 0) {
      console.log("No carts found");
      return res.status(404).json("No carts found");
    }

    console.log("Carts found:", carts); // Log the fetched carts for debugging
    return res.status(200).json(carts);
  } catch (err) {
    console.error("Error reading carts:", err);
    return res.status(500).json("Error reading carts");
  }
});

// read cart
app.get("/cart/read/:userId", async (req, res) => {
  const { userId } = req.params;
  //c
  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(404).json("Cart not found");
    }
    return res.status(200).json(cart);
  } catch (err) {
    console.error("Error reading cart:", err);
    return res.status(500).json("Error reading cart");
  }
});
//update cart
app.put("/cart/update/:userId", async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log(`Cart not found for userId: ${userId}`);
      return res.status(404).json("Cart not found");
    }

    console.log("Cart items:", cart.items);

    // Ensure productId is a string
    const productIdStr = productId.toString();

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productIdStr
    );
    console.log(`Item index for productId ${productIdStr}:`, itemIndex);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
    } else {
      console.log(`Item with productId: ${productId} not found in cart`);
      return res.status(404).json("Item not found in cart");
    }

    const updatedCart = await cart.save();
    return res.status(200).json(updatedCart);
  } catch (err) {
    console.error("Error updating cart:", err);
    return res.status(500).json("Error updating cart");
  }
});

// Delete Cart Item

app.delete("/cart/delete/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;

  try {
    // Find the cart associated with the userId
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json("Cart not found");
    }

    // Check if the item exists in the cart
    const itemExists = cart.items.some(
      (item) => item.productId.toString() === productId
    );
    if (!itemExists) {
      return res.status(404).json("Item not found in cart");
    }

    // Filter out the item with the given productId
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    // Save the updated cart
    await cart.save();

    return res
      .status(200)
      .json({ message: "Item successfully deleted from cart" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    return res.status(500).json("Error deleting cart item");
  }
});

//create order
app.post("/orders", async (req, res) => {
  const {
    name,
    email,
    number,
    paymentMethod,
    addressLine1,
    addressLine2,
    city,
    country,
    state,
    pinCode,
  } = req.body;

  // Log the received body for debugging
  console.log("Request body:", req.body);

  if (
    !name ||
    !email ||
    !number ||
    !paymentMethod ||
    !addressLine1 ||
    !city ||
    !country ||
    !state ||
    !pinCode
  ) {
    console.log("Field empty:", {
      name,
      email,
      number,
      paymentMethod,
      addressLine1,
      addressLine2,
      city,
      country,
      state,
      pinCode,
    });
    return res.status(400).json("Field empty");
  }

  try {
    const newOrder = new Order({
      name,
      email,
      number,
      paymentMethod,
      addressLine1,
      addressLine2,
      city,
      country,
      state,
      pinCode,
    });

    const savedOrder = await newOrder.save();
    return res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json("Error creating order");
  }
});
// Read Orders
app.get("/read/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json(orders);
  } catch (err) {
    console.error("Error reading orders:", err);
    return res.status(500).json("Error reading orders");
  }
});
// Update Order
app.put("/orders/update/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    number,
    paymentMethod,
    addressLine1,
    addressLine2,
    city,
    country,
    state,
    pinCode,
  } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json("Order not found");
    }

    order.name = name || order.name;
    order.email = email || order.email;
    order.number = number || order.number;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.addressLine1 = addressLine1 || order.addressLine1;
    order.addressLine2 = addressLine2 || order.addressLine2;
    order.city = city || order.city;
    order.country = country || order.country;
    order.state = state || order.state;
    order.pinCode = pinCode || order.pinCode;

    const updatedOrder = await order.save();
    return res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Error updating order:", err);
    return res.status(500).json("Error updating order");
  }
});
// Delete Order
app.delete("/orders/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json("Order not found");
    }
    return res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    console.error("Error deleting order:", err);
    return res.status(500).json("Error deleting order");
  }
});

mongoose
  .connect(
    "mongodb+srv://ola2:GLO09052166037glo@cluster.qq2b6xn.mongodb.net/?retryWrites=true&w=majority&appName=Clusters"
  )
  .then(() => {
    console.log("SERVER RUNNING");
    getUsersSortedByFirstnameAsc();
  });
