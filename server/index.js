// Express Application // API Routes // Init Function
const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const {
  client,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  deleteFavorite,
} = require("./db");

// POST // Create
app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        user_id: req.params.id,
        product_id: req.body.product_id,
      })
    );
  } catch (error) {
    next(error);
  }
});
// GET // Read // Users
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (ex) {
    next(ex);
  }
});
// GET // Read // Products
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    next(error);
  }
});
// GET // Read // User - Favorites
app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});
// Delete
app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
  try {
    await deleteFavorite({
      user_id: req.params.userId,
      product_id: req.params.productId,
    });
    res.sendStatus(204); // No Content, successful deletion
  } catch (ex) {
    next(ex);
  }
});

// Init Function
const init = async () => {
  // get client by req from db.js and connect
  await client.connect();
  console.log("connected");

  await createTables();
  console.log("tables created");

  // Users and Passwords // desctructured
  await Promise.all([
    createUser({ username: "Steve", password: "stevestevesteve" }), // user 0
    createUser({ username: "Tim", password: "nottimcook" }), // user 1
    createUser({ username: "Jimmy", password: "itsjimmyyyy" }), // user 2

    // Products Available
    createProduct("MacBook Pro"), // 0
    createProduct("Samsung 4K TV"), // 1
    createProduct("Vaccum"), // 2
    createProduct("Toothbrush"), // 3
  ]);

  console.log("data seeded");

  // Fetch users and products
  const users = await fetchUsers();
  const products = await fetchProducts();

  const steve = users.find((user) => user.username === "Steve");
  const tim = users.find((user) => user.username === "Tim");
  const jimmy = users.find((user) => user.username === "Jimmy");

  // Create User Skills
  await Promise.all([
    createFavorite({ user_id: steve.id, product_id: products[0].id }),
    createFavorite({ user_id: steve.id, product_id: products[1].id }),

    createFavorite({ user_id: tim.id, product_id: products[1].id }),
    createFavorite({ user_id: tim.id, product_id: products[2].id }),

    createFavorite({ user_id: jimmy.id, product_id: products[2].id }),
    createFavorite({ user_id: jimmy.id, product_id: products[3].id }),
  ]);

  console.log("User Favorites seeded");

  const userFavorites = await fetchFavorites(steve.id);
  console.log("User Favorites: ", userFavorites);

  //   await deleteFavorite(userFavorites[0].id);

  //   const userFavoritesAfterDelete = await fetchFavorites(steve.id);
  //   console.log({ userFavoritesAfterDelete });

  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
