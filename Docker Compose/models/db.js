import express from express
import {mysql2} from mysql2/promise
import "dotenv/config";

const pool = mysql2.createPool = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};