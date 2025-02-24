const express = require("express");
const router = express.Router();

let productos = [
  { id: 1, nombre: "Laptop", precio: 1200 },
  { id: 2, nombre: "Mouse", precio: 25 },
  {id: 3, nombre: "mesa de Mirtha Legrand" , precio: 99999999999},
  { id: 4, nombre: "Monitor", precio: 200 }, 
];

router.get("/", (req, res) => {
  res.render("home", { productos });
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { productos });
});

module.exports = router;
