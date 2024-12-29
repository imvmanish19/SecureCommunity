document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const userInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const phoneForm = document.getElementById("phoneForm");
  const pinForm = document.getElementById("pinForm");
  const phoneInput = document.getElementById("phone");
  const pinInput = document.getElementById("pin");

  const passInput = document.getElementById("pass1");
  const passReInput = document.getElementById("pass2");

  const updatePassForm = document.getElementById("changePwdForm");
  const confirmSwappedForm = document.getElementById("confirmSwapForm");

  const smsModal = document.getElementById("modalSMS");
  const swappedModal = document.getElementById("modalSwapped");
  const verifyModal = document.getElementById("modalVerification");
  const changePassModal = document.getElementById("modalNewPassword");

  const acceptSwappedBtn = document.getElementById("accept_swapped");
  const cancelSwappedBtn = document.getElementById("cancel_swapped");

  const forgotBtn = document.getElementById("forgotButton");
  const logoutButton = document.getElementById("logoutButton");
  let currentModal = "";

  function closeCurrentModal() {
    if (currentModal) {
      currentModal.style.display = "none";
      currentModal = "";
    }
  }

  function showModal(modal) {
    modal.style.display = "block";
    if (currentModal && currentModal !== modal) {
      currentModal.style.display = "none";
    }
    currentModal = modal;
  }

  if (forgotBtn) {
    forgotBtn.onclick = function () {
      showModal(smsModal);
    };
  }

  const spans = document.getElementsByClassName("close");
  for (let i = 0; i < spans.length; i++) {
    spans[i].onclick = function () {
      closeCurrentModal();
    };
  }

  async function sendData(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error during data request to ${url}:`, error);
    }
  }

  function sendCode() {
    sendData("/sendcode", {})
      .then((data) => {
        if (data && data.verifycode) {
          console.log("Verification code sent successfully:", data);
        } else {
          alert("There was an error sending the verification code. Please try again later.");
          closeCurrentModal();
        }
      })
      .catch((error) => {
        console.error("Error during verification code sending:", error);
        alert("An error occurred while trying to send the verification code.");
      });
  }

  if (phoneForm) {
    phoneForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const phone = phoneInput.value.trim();
      if (phone) {
        sendData("/simswap", { phone })
          .then((data) => {
            if (data.swapped) {
              showModal(swappedModal);
            } else {
              showModal(verifyModal);
              sendCode();
            }
          })
          .catch((error) => {
            console.log(error);
            alert("An error occurred while checking your SIM Swap.");
          });
      } else {
        alert("Please enter a valid phone number.");
      }
    });
  }

  if (pinForm) {
    pinForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const pin = pinInput.value.trim();
      if (pin) {
        sendData("/verify", { pin })
          .then((data) => {
            if (data.message !== "Success") {
              alert("Invalid verification code. Please try again.");
            } else {
              showModal(changePassModal);
            }
          })
          .catch((error) => {
            console.log(error);
            alert("Invalid verification code. Please try again.");
          });
      } else {
        alert("Please enter the verification code.");
      }
    });
  }

  if (updatePassForm) {
    updatePassForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const newPass = passInput.value.trim();
      const confirmPass = passReInput.value.trim();
      if (newPass === confirmPass) {
        sendData("/update", { newPass })
          .then((data) => {
            if (data.message === "Success") {
              alert("Password successfully updated.");
              closeCurrentModal();
            }
          })
          .catch((error) => {
            console.log(error);
            alert("An error occurred while updating your password. Please try again.");
          });
      } else {
        alert("Passwords don't match.");
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = userInput.value.trim();
      const password = passwordInput.value.trim();

      sendData("/login", { username, password })
        .then((data) => {
          if (data.message !== "Success") {
            alert("Invalid user and password.");
          } else {
            window.location.href = "/main";
          }
        })
        .catch((error) => {
          console.error("Error during login:", error);
          alert("Invalid user and password.");
        });
    });
  }

  if (acceptSwappedBtn) {
    acceptSwappedBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showModal(verifyModal);
      sendCode();
    });
  }

  if (cancelSwappedBtn) {
    cancelSwappedBtn.addEventListener("click", (event) => {
      event.preventDefault();
      closeCurrentModal();
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      window.location.href = "/";
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const contactSupportBtn = document.getElementById("contactSupportBtn");

  if (contactSupportBtn) {
      contactSupportBtn.addEventListener("click", () => {
          window.location.href = "mailto:support@example.com?subject=SIM Swap Issue&body=I noticed a SIM swap on my account, please assist.";
      });
  }
});
