const express = require("express");
const routes = express.Router()
const registerModel = require('../../register.js')
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const JWT = require('jsonwebtoken')
const {Login, Register}= require('../../controller/index-controller.js')



routes.post("/login" , Login);
  routes.post("/register" , Register);

  module.exports = routes