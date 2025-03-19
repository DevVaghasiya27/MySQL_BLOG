import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';

const Write = () => {
    const { id: postId } = useParams(); // Get post ID from URL if editing
    const navigate = useNavigate();

    // State variables
    const [title, setTitle] = useState("");
    const [value, setValue] = useState("");
    const [file, setFile] = useState(null);
    const [cat, setCat] = useState("");
    const [imgUrl, setImgUrl] = useState("");

    // Fetch existing post details if editing
    useEffect(() => {
        if (postId) {
            const fetchPost = async () => {
                try {
                    const res = await axios.get(`/posts/${postId}`);
                    setTitle(res.data.title);
                    setValue(res.data.desc);
                    setCat(res.data.cat);
                    setImgUrl(res.data.img);
                } catch (err) {
                    console.error("Error fetching post:", err);
                }
            };
            fetchPost();
        }
    }, [postId]);

    // Upload image function
    const upload = async () => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post("/upload", formData);
            return res.data;
        } catch (err) {
            console.error("Upload Error:", err);
            return null;
        }
    };

    // Handle form submission (create or update post)
    const handleClick = async (e) => {
        e.preventDefault();

        let newImgUrl = imgUrl;
        if (file) {
            newImgUrl = await upload();
            if (!newImgUrl) {
                console.error("File upload failed");
                return;
            }
        }

        try {
            if (postId) {
                // Update post
                await axios.put(`/posts/${postId}`, {
                    title,
                    desc: value,
                    cat,
                    img: newImgUrl,
                });
                console.log("Post updated successfully");
            } else {
                // Create new post
                await axios.post("/posts", {
                    title,
                    desc: value,
                    cat,
                    img: newImgUrl,
                    date: moment().format("YYYY-MM-DD HH:mm:ss"),
                });
                console.log("New post created");
            }
            navigate("/");
        } catch (err) {
            console.error("Error in post submission:", err.response?.data || err);
        }
    };

    return (
        <div className="add">
            <div className="content">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div className="editorContainer">
                    <ReactQuill
                        className="editor"
                        theme="snow"
                        value={value}
                        onChange={setValue}
                    />
                </div>
            </div>
            <div className="menu">
                <div className="item">
                    <h1>Publish</h1>
                    <span><b>Status: </b> Draft</span>
                    <span><b>Visibility: </b> Public</span>
                    <input
                        style={{ display: "none" }}
                        type="file"
                        id="file"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label className="file" htmlFor="file">Upload Image</label>
                    <div className="buttons">
                        <button>Save as a draft</button>
                        <button onClick={handleClick}>{postId ? "Update" : "Publish"}</button>
                    </div>
                </div>
                <div className="item">
                    <h1>Category</h1>
                    {["art", "science", "technology", "cinema", "design", "food"].map(category => (
                        <div className="cat" key={category}>
                            <input
                                type="radio"
                                checked={cat === category}
                                name="cat"
                                value={category}
                                id={category}
                                onChange={(e) => setCat(e.target.value)}
                            />
                            <label htmlFor={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Write;
