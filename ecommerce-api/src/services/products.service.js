// products.service.js
// Business logic for product operations

const db = require('../config/database');

class ProductsService {
  async getAllProducts({ page = 1, limit = 10, category = null }) {
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products';
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const products = await db.query(query, params);
    return products.rows;
  }

  async getProductById(id) {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createProduct(data) {
    const { name, description, price, stock, category } = data;
    const query = `
      INSERT INTO products (name, description, price, stock, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [name, description, price, stock, category]);
    return result.rows[0];
  }

  // 🐛 INTENTIONAL VULNERABILITY: SQL Injection
  async searchProducts(searchQuery) {
    // BAD: String concatenation in SQL query
    // This is vulnerable to SQL injection attacks
    const sql = `SELECT * FROM products WHERE name LIKE '%${searchQuery}%' OR description LIKE '%${searchQuery}%'`;

    const result = await db.raw(sql);
    return result.rows;
  }

  // FIX (for reference, don't use in workshop):
  /*
  async searchProducts(searchQuery) {
    const sql = `
      SELECT * FROM products
      WHERE name ILIKE $1 OR description ILIKE $1
    `;
    const result = await db.query(sql, [`%${searchQuery}%`]);
    return result.rows;
  }
  */

  async updateProduct(id, data) {
    const { name, description, price, stock, category } = data;
    const query = `
      UPDATE products
      SET name = $1, description = $2, price = $3, stock = $4, category = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const result = await db.query(query, [name, description, price, stock, category, id]);
    return result.rows[0];
  }

  async deleteProduct(id) {
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    return { success: true };
  }
}

module.exports = new ProductsService();
