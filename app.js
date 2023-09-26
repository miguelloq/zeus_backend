const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

async function connect() {
  if (global.db) return global.db;
  const conn = await MongoClient.connect(
    "mongodb+srv://miguelloq:Y23uGP0LBhtKn3mH@zeus-cluster.8byefwj.mongodb.net/"
  );
  if (!conn) return new Error("ERRO de Conexao");
  global.db = await conn.db("zeusdb");
  return global.db;
}

function checkProductType(str) {
  if (
    str == "racao" ||
    str == "remedio" ||
    str == "brinquedo" ||
    str == "outro"
  ) {
    return str;
  } else {
    throw Error(`${str} gerou erro, pois não é de nenhum tipo conhecido.`);
  }
}

function checkIsoDate(str) {
  const d = new Date(str);
  if (!(d instanceof Date)) {
    throw Error(`${str} gerou erro, pois não é uma data`);
  }
  return str;
}

function checkIntDouble(input) {
  if (/^-?[0-9]+([.][0-9]+)?$/.test(input)) {
    return input;
  } else {
    throw new Error(`${input} gerou erro ao checar numeros e ponto`);
  }
}

const app = express();
const port = 3001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/produtos/:id?", async (req, res, next) => {
  try {
    const db = await connect();
    if (req.params.id) {
      res.json(
        await db
          .collection("produtos")
          .findOne({ _id: new ObjectId(req.params.id) })
      );
    } else {
      res.json(await db.collection("produtos").find().toArray());
    }
  } catch (error) {
    res.status(400).json({ error: `${error}` });
  }
});

app.post("/produtos", async (req, res, next) => {
  try {
    const db = await connect();
    const body = req.body;

    const newProduct = {
      name: body.name,
      type: checkProductType(body.type),
      price: parseFloat(checkIntDouble(body.price)),
      quantity: parseFloat(checkIntDouble(body.quantity)),
      purchaseTime: checkIsoDate(body.purchaseTime),
      createdAt: new Date(),
      lastEditTime: "",
    };
    console.log(newProduct);
    res.json(await db.collection("produtos").insertOne(newProduct));
  } catch (error) {
    res.status(400).json({ error: `${error}` });
  }
});

app.put("/produtos/:id", async (req, res, next) => {
  console.log("ndjasndasndian eentrada no puit dianidnasidnaidnsan");
  try {
    const db = await connect();
    const produtoModificado = req.body;
    let currentDate = new Date();
    produtoModificado.lastEditTime = currentDate.toISOString();
    console.log("Produto modificado abaixo");
    console.log(produtoModificado);
    res.json(
      await db
        .collection("produtos")
        .updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: produtoModificado }
        )
    );
  } catch (error) {
    res.status(400).json({ error: `${error}` });
  }
});

app.delete("/produtos/:id", async (req, res, next) => {
  try {
    const db = await connect();
    res.json(
      await db
        .collection("produtos")
        .deleteOne({ _id: new ObjectId(req.params.id) })
    );
  } catch (error) {
    res.status(400).json({ erro: `${error}` });
  }
});

app.listen(port);
console.log("ok");
