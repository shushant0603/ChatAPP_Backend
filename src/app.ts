import express from "express";
import cors from "cors";

import routes from "./routes/Auth.routes";
import userRoutes from "./routes/User.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth',routes);
app.use('/auth/user',userRoutes);
app.use('/auth/chat',chatRoutes);

export default app;
