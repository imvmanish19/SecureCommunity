# Multifactor Security Authentication Using Vonage APIs for Secure Community Web App

## Overview

This project demonstrates enhanced multifactor authentication in a **Secure Community Web App** using Vonage’s **SIM Swap API**, **Verify v2 API**, and **SMS API**. The web app includes a user login feature that sends **new login notifications** via SMS to the user's emergency contact. It focuses on ensuring the safety of users by detecting **SIM swap activities** and verifying user identity through multifactor authentication during password resets (forgot password).

- If a **SIM swap** is detected, additional security measures are triggered to prevent unauthorized access.
- If no SIM swap is detected, the user is authenticated via a secure **code-based authentication** process.

![Design](https://github.com/imvmanish19/SecureCommunity/blob/main/public/CommunityDesign.png?raw=true)


## Key Features

- **User Login**: Secure login for community members through new login detections sent using SMS API.
- **SIM Swap Detection**: Uses the Vonage SIM Swap API to detect recent SIM card swaps and prevent malicious password resets.
- **Multifactor Authentication (MFA)**: Uses the Vonage Verify v2 API to send verification codes via SMS for user authentication.
- **Personalized Dashboard**: Access to a personalized safety community dashboard after successful authentication.
- **Extra Security Measures**: Applies additional security steps if a SIM swap is detected, such as account lockout or manual intervention requests.


## Prerequisites

- A [Vonage Developer Account](https://developer.vonage.com).
- Node.js and npm installed.

## Getting Started

1. Clone the repository.

2. Install the required packages:
   ```bash
   npm install
   ```

3. Create `.env` file in the project root and include the following environment variables:
   ```bash
    VONAGE_API_SECRET=your_api_secret
    VONAGE_APPLICATION_ID=your_application_id
    VONAGE_PRIVATE_KEY=private_key

    JWT=your_jwt_token

    MAX_AGE=72
   ```

4. You have the choice to set `RECIPIENT_NUMBER`, to define a different phone number from the one used during SIM Swap to receive the SMS. (Useful because we are using Vonage Network Sandbox)

5. You also have choice to set `EMERGENCY_CONTACT` to define a emergency phone number to which new login detections will be sent.

5. Run the application:
   ```bash
   node server.js
   ```

5. Launch your web browser and enter the URL:
   ```bash
   http://localhost:3000/
   ```

## How It Works

### SIM Swap API

The application uses the Vonage SIM Swap API to check whether a given phone number has been swapped in the last few days. This protects users from attacks that exploit SIM swaps.

### Verify V2 API

The Verify v2 API sends a one-time code to the user's phone number for authentication. This verification code will be sent if the SIM Swap API determines that the number has not been recently swapped.

### SMS API

The SMS API sends new login detection messages to emergency contact specified by the user.

### Application Flow

1. The user enters their phone number and password on the login page. A **new login detection message** is sent to the user’s emergency contact.
2. During **password reset**, the **SIM Swap API** checks whether the number was swapped recently.
3. If a **SIM swap** is detected, the user is shown a screen where they can **contact support**.
4. If no SIM swap is detected, a **verification code** is sent via the **Verify v2 API**.
5. After successful verification, the user can access their **community dashboard**.