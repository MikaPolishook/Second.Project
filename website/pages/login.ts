import { send } from "../utilities";

let usernameInput = document.getElementById("usernameInput") as HTMLInputElement;
let passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
let submitButton = document.getElementById("submitButton") as HTMLButtonElement;
let messageDiv = document.getElementById("messageDiv") as HTMLDivElement;

submitButton.onclick = async function () {
  let id = await send("logIn", [ usernameInput.value, passwordInput.value,]) as string | null;

if (passwordInput.value == null && usernameInput.value == null)
{
  messageDiv.innerText = "Please Enter Username And Password";
}

  if (id == null) {
    usernameInput.value = "";
    passwordInput.value = "";
    messageDiv.innerText = "Username or Password were incorrent";
  }
  else {
    localStorage.setItem("userId", id);
    location.href = "index.html";
  }
}

