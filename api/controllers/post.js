import { db } from "../db.js"
import jwt from 'jsonwebtoken';

export const getPosts = (req, res) => {
    const q = req.query.cat ? "SELECT * FROM posts WHERE cat = ?" : "SELECT * FROM posts"

    db.query(q, [req.query.cat], (err, data) => {
        if (err) return res.status(500).send(err);
        return res.status(200).json(data);
    });
}
export const getPost = (req, res) => {
    const q = "SELECT `username`, `title`, `desc`, p.`img`, u.`img` AS userImg, `date`, `cat` FROM users u JOIN posts p ON u.id = p.userId WHERE p.id = ? "
    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.send(err);
        return res.status(200).json(data[0]);
    });
}
export const addPost = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q =
            "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`,`userId`) VALUES (?)";

        const values = [
            req.body.title,
            req.body.desc,
            req.body.img,
            req.body.cat,
            req.body.date,
            userInfo.id,
        ];

        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.json("Post has been created.");
        });
    });
};
export const deletePost = (req, res) => {
    const token = req.cookies.access_token
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, "jwtkey", (err, user) => {
        if (err) return res.status(403).json({ message: "Token is not Valid!" });

        const postId = req.params.id
        const q = "DELETE FROM posts WHERE `id` = ? AND `userID` = ? "

        db.query(q, [postId, user.id], (err, data) => {
            if (err) return res.send(err);
            return res.status(200).json("Post has been deleted.");
        });
    })
}
export const updatePost = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        console.log("User Info:", userInfo);

        const postId = req.params.id;
        const q =
            "UPDATE posts SET `title`=?,`desc`=?,`img`=?,`cat`=? WHERE `id` = ? AND `userId` = ?";

        const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];

        // db.query(q, [...values, postId, userInfo.id], (err, data) => {
        //     if (err) return res.status(500).json(err);
        //     return res.json("Post has been updated.");
        // });

        db.query(q, [...values, postId, userInfo.id], (err, data) => {
            if (err) {
                console.error("SQL Error:", err);
                return res.status(500).json(err);
            }
            console.log("Update result:", data);
            if (data.affectedRows === 0) {
                return res.status(404).json("Post not found or unauthorized.");
            }
            return res.json("Post has been updated.");
        });
    });
};