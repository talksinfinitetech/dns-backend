import express from "express";
import cors from "cors";
import dnsRoutes from "./routes/domain";
import userRoutes from "./routes/user";
import dnsRecordsRoutes from "./routes/dns-records";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 7002;
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://dns-frontend1.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


app.use("/api", dnsRoutes);
app.use("/api", dnsRecordsRoutes);
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
