import express from "express";

import routes from "./routes/Auth.routes";

const app = express();

app.use(express.json());

app.use('/auth',routes)

export default app;
