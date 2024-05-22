// Data Layer
const pg = require("pg");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const client = new pg.Client(
  process.env.DATABASE_URL || { database: "the_acme_store" }
);

const createTables = () => {
  const SQL = `
          DROP TABLE IF EXISTS favorite;
          DROP TABLE IF EXISTS product;
          DROP TABLE IF EXISTS "user";
  
          CREATE TABLE "user" (
              id UUID PRIMARY KEY,
              username VARCHAR(100) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL
          );
          CREATE TABLE product (
              id UUID PRIMARY KEY,
              name VARCHAR(100) NOT NULL
          );
          CREATE TABLE favorite (
              id UUID PRIMARY KEY,
              product_id UUID REFERENCES product(id) NOT NULL,
              user_id UUID REFERENCES "user"(id) NOT NULL,
              CONSTRAINT user_fav_product UNIQUE (user_id, product_id)
              )
          `;
  return client.query(SQL);
};

// username and password are being desctructured
const createUser = async ({ username, password }) => {
  password = await bcrypt.hash(password, 5); // hash : method

  const SQL = `
          INSERT INTO "user" (id, username, password)
          VALUES ($1, $2, $3) 
          RETURNING *
      `;
  return client.query(SQL, [uuidv4(), username, password]);
};

const createProduct = async (name) => {
  const SQL = `
          INSERT INTO product (id, name)
          VALUES ($1, $2) 
          RETURNING *
      `;
  return client.query(SQL, [uuidv4(), name]);
};

const createFavorite = async ({ user_id, product_id }) => {
  const SQL = `
          INSERT INTO favorite (id, user_id, product_id)
          VALUES ($1, $2, $3) 
          RETURNING *
      `;
  return client.query(SQL, [uuidv4(), user_id, product_id]);
};

const fetchUsers = async () => {
  const SQL = `
    SELECT id, username FROM "user"
    `;

  const results = await client.query(SQL);
  return results.rows;
};

const fetchProducts = async () => {
  const SQL = `
    SELECT * FROM product
    `;

  const results = await client.query(SQL);
  return results.rows;
};

// need to figure out join better
const fetchFavorites = async (userId) => {
  const SQL = `
    SELECT 
        favorite.id AS favorite_id,
        user_id,
        username,
        product_id,
        name AS product_name
    FROM favorite
    JOIN "user" ON favorite.user_id = "user".id
    JOIN product ON favorite.product_id = product.id
    WHERE user_id = $1;
`;
  const results = await client.query(SQL, [userId]);
  return results.rows;
};

const deleteFavorite = async ({ userId, productId }) => {
  console.log({ userId, productId });

  const SQL = ` 
    DELETE 
    FROM favorite
    WHERE user_id = $1 AND product_id = $2`;

  return client.query(SQL, [userId, productId]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  deleteFavorite,
};
