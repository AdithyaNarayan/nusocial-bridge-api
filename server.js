const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");
const app = express();
// const port = 8000;
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

app.get("/", (req, res) => {
    console.log("/GET");
    res.send(`Hi! Server is listening on port ${port}`);
});

app.post("/auth", async function(req, res) {
    const code = req.query.code;
    var resp = "";
    if (code == null || code == "undefined" || code == "" || code == "null") {
        return res.send("Error");
    }
    console.log("abc");
    var request = require("request");

    function callAPI() {
        return new Promise(function(resolve, reject) {
            const params = {
                client_id: "INC000002163230",
                code: code,
                redirect_uri:
                    "https://nusocial-admin.herokuapp.com/authenticate",
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
                    console.log(error);
                    console.log(response);
                    console.log(body);
                    if (error) {
                        resolve(error);
                    } else {
                        console.log(body);
                        resp += body;
                        resolve(response);
                    }
                }
            );
        });
    }
    await callAPI();
    return res.send(resp);
});

app.post("/firebaseToken", async function(req, res) {
    const uid = req.query.id;
    if (uid == null || uid == "undefined" || uid == "" || uid == "null") {
        return res.send("Error");
    }

    var token = await admin.auth().createCustomToken(uid);

    return res.send(token);
});

app.post("/profile", async function(req, res) {
    const token = req.query.token;
    if (
        token == null ||
        token == "undefined" ||
        token == "" ||
        token == "null"
    ) {
        return res.send("Error");
    }

    var resp = "";
    var request = require("request");

    function callAPI() {
        return new Promise(function(resolve, reject) {
            const url = "https://luminus.azure-api.net/user/Profile";
            request.get(
                {
                    url: url,
                    headers: {
                        "Ocp-Apim-Subscription-Key":
                            "c9672e39d6854ec084706e9a944f8b21",
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: "Bearer " + token,
                    },
                },
                function(error, response, body) {
                    console.log("Resp" + response);
                    console.log("body" + body);
                    if (error) {
                        resolve(error);
                    } else {
                        console.log(body);
                        resp += JSON.parse(body)["userID"];
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
