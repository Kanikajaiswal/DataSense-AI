const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      console.log(results);

      res.json({
        message: "CSV Uploaded Successfully",
        data: results,
      });
    });
});

module.exports = router;