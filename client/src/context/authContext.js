import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    // create auth state and methods
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

    const login = async (inputs) => {
        const res = await axios.post("/auth/login", inputs)
        setCurrentUser(res.data)
    }

    const logout = async () => {
        await axios.post("/auth/logout");
        setCurrentUser(null);
        localStorage.removeItem("user"); // Clear local storage immediately
    };

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(currentUser))
    }, [currentUser])

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>
    )
}