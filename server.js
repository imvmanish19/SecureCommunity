require('dotenv').config({path:'/Users/mVenkatesh2/Downloads/SafetyCommunityProject/safety_community_project/.env'})
const axios = require("axios");
const express = require("express");
const path = require("path");
const { Auth } = require("@vonage/auth");
const { Vonage } = require("@vonage/server-sdk");
const { Channels } = require("@vonage/verify2");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const vonage = new Vonage(
  new Auth({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    applicationId: process.env.VONAGE_APPLICATION_ID,
    privateKey: process.env.VONAGE_PRIVATE_KEY,
  })
);

const scope = "dpv:FraudPreventionAndDetection#check-sim-swap";
const authReqUrl = "https://api-eu.vonage.com/oauth2/bc-authorize";
const tokenUrl = "https://api-eu.vonage.com/oauth2/token";
const simSwapApiUrl = "https://api-eu.vonage.com/camara/sim-swap/v040/check";

let phoneNumber = null;
let verifyRequestId = null;
let pwd = "123";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "views/main.html"));
});

async function authenticate(phone, scope) {
  try {
    const authReqResponse = await axios.post(
      authReqUrl,
      {
        login_hint: phone,
        scope: scope,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.JWT}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const authReqId = authReqResponse.data.auth_req_id;

    const tokenResponse = await axios.post(
      tokenUrl,
      {
        auth_req_id: authReqId,
        grant_type: "urn:openid:params:grant-type:ciba",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.JWT}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error(
      "Error during authentication:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function checkSim() {
  try {
    const accessToken = await authenticate(phoneNumber, scope);
    const response = await axios.post(
      simSwapApiUrl,
      {
        phoneNumber: phoneNumber,
        maxAge: process.env.MAX_AGE,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.swapped;
  } catch (error) {
    console.error(
      "Error checking SIM swap:",
      error.response?.data || error.message
    );
    throw error;
  }
}

app.post("/sendcode", async (req, res) => {
  const phone = process.env.RECIPIENT_NUMBER ? process.env.RECIPIENT_NUMBER: phoneNumber;

  try {
    const response = await vonage.verify2.newRequest({
     brand: "COMMUNITY",
      workflow: [
        {
          channel: Channels.SMS,
          to: phone,
        },
      ],
    });
    verifyRequestId = response.requestId;
    res.json({
      message: "Verification code sent.",
      verifycode: true,
      request_id: verifyRequestId,
    });
  } catch (error) {
    console.error("Error during verification:", error);
    res.status(500).json({ message: "Error processing request.", verifycode: false });
  }
});

app.post("/simswap", async (req, res) => {
  phoneNumber = req.body.phone;
  try {
    const simSwapped = await checkSim();
    res.json({
      swapped: simSwapped,
    });
    console.log("Sim Swap Response :"+simSwapped);
  } catch (error) {
    console.error("Error checking SIM swap:", error);
    res.status(500).json({ message: "Error processing request." });
  }
});

app.post("/verify", (req, res) => {
  const { pin } = req.body;
  vonage.verify2
    .checkCode(verifyRequestId, pin)
    .then((status) => {
      if (status === "completed") {
        res.json({ message: "Success" });
      } else {
        res.json({ message: "Invalid verification code. Please try again." });
      }
    })
    .catch((err) => {
      console.error("Error during PIN verification:", err);
      res.status(500).json({ message: "Error during PIN verification." });
    });
});

app.post("/update", (req, res) => {
  const { newPass } = req.body;
  pwd = newPass;
  res.json({ message: "Success" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (password === pwd) {
    vonage.messages
      .send({
        text: "Security alert: We have detected a new login to your Safety Community account.",
        message_type: "text",
        to: process.env.EMERGENCY_CONTACT,
        from: "Vonage",
        channel: "sms"
    })
    .then((resp) => console.log(resp))
    .catch((err) => console.error(err));
    res.json({ message: "Success" });
  } else {
    res.status(401).json({ message: "Invalid user and password" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
