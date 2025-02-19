const pool = require("../database")

async function getCommentsByInventoryId(inv_id) {
    let sql = `SELECT c.comment_id, c.comment_content, a.account_firstname
                FROM comment c
                JOIN account a ON c.account_id = a.account_id
                WHERE c.inv_id = $1
                ORDER BY c.comment_id DESC`
    try {
        const result = await pool.query(sql, [inv_id])
        return result.rows
    } catch (error) {
        console.error("getCommentsByInventoryId Error:", error);
        return []
    }
}

async function addComment(account_id, inv_id, comment_content) {
    const sql = "INSERT INTO comment (account_id, inv_id, comment_content) VALUES ($1, $2, $3)"
    try {
        const result = await pool.query(sql, [account_id, inv_id, comment_content])
        return result.rows
    } catch (error) {
        console.error("Error adding comment", error)
        throw error
    }
}

async function deleteComment(comment_id) {
    const sql = "DELETE comment WHERE comment_id = $1"
    try {
        const result = await pool.query(sql, [comment_id])
        return result.rows
    } catch (error) {
        console.error("Error deleting comment:", error)
        throw error
    }
}

module.exports = {getCommentsByInventoryId, addComment}