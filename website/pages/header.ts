import { send } from "../utilities";

var userId = localStorage.getItem("userId");
let SignUpB = document.getElementById("SignUpB") as HTMLButtonElement;
let LoginB = document.getElementById("LoginB") as HTMLButtonElement;
let container = document.querySelector(".container") as HTMLElement ;

if (userId)
{
    var username = await send ("GetUsername" , userId) as string;
    var usernameElement = document.createElement("p");
    usernameElement.innerText = "Hello, " + username;

    var userInfo = document.getElementById("userInfo");
    if (userInfo)
    {
    userInfo.appendChild(usernameElement);
    }

    SignUpB.style.display = "none";
    LoginB.style.display = "none";
    

    let LogOutB = document.createElement("button");
    LogOutB.classList.add("LogOutB");
    LogOutB.innerText = "Log Out";
    LogOutB.onclick = () => {
        localStorage.removeItem("userId");
        top!.location.reload();
    };
    container.appendChild(LogOutB);

}
 
else {
        SignUpB.style.display = "block";
       LoginB.style.display = "block";
}