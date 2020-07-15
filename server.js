const express = require("express");
const cors = require("cors");
const app = express();
// const port = 8000;
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.send(`Hi! Server is listening on port ${port}`);
});
app.post("/", (req, res) => {
    res.send(`POSFNN`);
});

app.post("/auth", async function(req, res) {
    const code = req.query.code;
    var resp = "";

    var request = require("request");

    function callAPI() {
        return new Promise(function(resolve, reject) {
            const params = {
                client_id: "INC000002163230",
                code: code,
                redirect_uri:
                    "https://firestore.googleapis.com/v1/projects/nusocial-7c7e8/databases/(default)/documents/users/",
                grant_type: "authorization_code",
                resource: "sg_edu_nus_oauth",
            };

            const url = "https://luminus.azure-api.net/login/ADFSToken";

            request.post(
                {
                    url: url,
                    form: params,
                    headers: {
                        "Ocp-Apim-Subscription-Key":
                            "c9672e39d6854ec084706e9a944f8b21",
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
                function(error, response, body) {
                    if (error) {
                        resolve(error);
                    } else {
                        console.log(body);
                        resp += JSON.parse(body)["access_token"];
                        resolve(response);
                    }
                }
            );
        });
    }
    await callAPI();
    return res.send(resp);
});

// listen on the port
app.listen(port);
