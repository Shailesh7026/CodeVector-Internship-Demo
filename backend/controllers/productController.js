import fs from "fs";
import CustomError from "../utils/CustomError.js";
import pool from "../config/db.js";

export const getProducts = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 20;
        const categories = req.query.categories;
        const search = req.query.search || "";
        const minPrice = req.query.minPrice
            ? parseInt(req.query.minPrice)
            : null;
        const maxPrice = req.query.maxPrice
            ? parseInt(req.query.maxPrice)
            : null;
        let cursor = null;
        if (req.query.cursor) {
            try {
                cursor = JSON.parse(
                    Buffer.from(req.query.cursor, "base64").toString()
                );
            } catch (err) {
                return next(new CustomError("Invalid cursor", 400));
            }
        }

        let baseWhere = [];
        let baseValues = [];
        let values = [];
        let idx = 1;

        if (categories) {
            const categoryArray = categories.split(",");

            baseWhere.push(`category = ANY($${idx++}::text[])`);
            baseValues.push(categoryArray);
        }

        if (search) {
            baseWhere.push(`name ILIKE $${idx++}`);
            baseValues.push(`%${search}%`);
        }

        if (minPrice !== null && maxPrice !== null) {
            baseWhere.push(`price >= $${idx++} AND price <= $${idx++}`);
            baseValues.push(minPrice, maxPrice);
        } else if (minPrice !== null) {
            baseWhere.push(`price >= $${idx++}`);
            baseValues.push(minPrice);
        } else if (maxPrice !== null) {
            baseWhere.push(`price <= $${idx++}`);
            baseValues.push(maxPrice);
        }

        const where = [...baseWhere];
        values = [...baseValues];

        if (cursor) {
            where.push(`(updated_at, id) < ($${idx++}::timestamp, $${idx++})`);
            values.push(cursor.updated_at, cursor.id);
        }

        const whereClause = where.length
            ? `WHERE ${where.join(" AND ")}`
            : "";

        const countWhereClause = baseWhere.length
            ? `WHERE ${baseWhere.join(" AND ")}`
            : "";

        const countValues = [...baseValues];

        const query = `
            SELECT *
            FROM products
            ${whereClause}
            ORDER BY updated_at DESC, id DESC
            LIMIT $${idx}
        `;

        values.push(limit);


        const result = await pool.query(query, values);

        const countQuery = `
            SELECT COUNT(*) 
            FROM products
            ${countWhereClause}
        `;

        // console.log("count query:", countQuery);
        // console.log("values:", countValues);

        const countResult = await pool.query(countQuery, countValues);
        const totalProducts = Number(countResult.rows[0].count);

        let nextCursor = null;

        if (result.rows.length > 0) {
            const last = result.rows[result.rows.length - 1];

            nextCursor = Buffer.from(
                JSON.stringify({
                    updated_at: last.updated_at,
                    id: last.id,
                })
            ).toString("base64");
        }

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products: result.rows,
            length: result.rows.length,
            pagination: {
                total: totalProducts,
                totalPages: Math.ceil(totalProducts / limit),
                nextCursor,
            },
            hasMoreProducts: result.rows.length === limit,
        });

    } catch (error) {
        console.error("FULL ERROR:", error);
        console.error("MESSAGE:", error.message);
        console.error("STACK:", error.stack);

        return next(new CustomError(error.message || "Error fetching products", 500));
    }
};

export const addProduct = async (req, res, next) => {
    try {
        const { name, price, category } = req.body;

        const savedProduct = await pool.query(
            "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
            [name, price, category]
        );

        res.status(201).json(
            {
                success: true,
                message: "Product added successfully",
                product: savedProduct.rows[0]
            }
        );

    } catch (error) {
        console.error(error);
        const customError = new CustomError("Error adding products", 500);
        return next(customError);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.id;

        const deletedProduct = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

        if (!deletedProduct.rows[0]) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error(error);
        const customError = new CustomError("Error deleting product", 500);
        return next(customError);
    }
};


