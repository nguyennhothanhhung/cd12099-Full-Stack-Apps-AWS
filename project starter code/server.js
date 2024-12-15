import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util.js";
import { query, validationResult } from "express-validator";

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

/**************************************************************************** */

//! END @TODO1

app.get(
  "/filteredimage",
  query("image_url")
    .notEmpty()
    .isURL({ protocols: ["http", "https", "ftp"] }),
  async (req, res) => {
    //    1. validate the image_url query
    const validateRes = validationResult(req);
    if (!validateRes.isEmpty()) {
      return res
        .status(400)
        .send(`image_url param is not valid: ${validateRes.errors[0].msg}`);
    }

    //    2. call filterImageFromURL(image_url) to filter the image
    filterImageFromURL(req.query.image_url)
      //    3. send the resulting file in the response
      .then((resolve) => {
        return res.status(200).sendFile(resolve);
      })
      .catch((err) => {
        // Catch the other server errors if any
        return res.status(500).send(`Server error: ${err}`);
      })
      //    4. deletes any files on the server on finish of the response
      .finally((resolve) => {
        if (resolve) {
          deleteLocalFiles([resolve]);
        }
      });
  }
);

// Root Endpoint
// Displays a simple message to the user
app.get("/", async (req, res) => {
  res.status(200).send("try GET /filteredimage?image_url={{}}");
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log(`press CTRL+C to stop server`);
});
