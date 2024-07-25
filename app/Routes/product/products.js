const Item= require('../../Item')
const mongoose = require('mongoose')
const express = require("express");
const routes = express.Router()
const JWT = require("jsonwebtoken");
require("dotenv").config();


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


routes.get('/get-products', AuthenticateToken, async (req, res) => {
  try {
    const products = await Item.find(); // Ensure Item model is correctly defined and connected
    res.status(200).json(products);
    
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json("Error fetching products");
  }
})
// Create
routes.post("/create-products", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    console.log(req.body);
    await newItem.save();
    res.status(201).send(newItem);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send("Error creating product");
  }
});

  
  // Read
  routes.get("/read-products", async (req, res) => {
    const items = await Item.find();
    res.send(items);
  });
  
  routes.get("/read-products/:id", async (req, res) => {
      //check to confirm its a valid mongodb id
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.json({ message: 'invalid id' })
      }
  
      const item = await Item.findById(req.params.id);
      if (!item){
          return res.json({ message: 'item not found' });
      }
      res.send(item);
  });
  
  // Update
  routes.put("/update-products/:id", async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.json({ message: 'invalid id' })
      }
  
      if (!item){
          res.json({ message: 'item not found' });
      }
  
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updatedItem) {
        return res.status(404).send({ message: "item update not successful" });
      }
      res.send(updatedItem);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete
  routes.delete("/delete-products/:id", async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.send({ message: "Item deleted" });
  });

  module.exports = routes