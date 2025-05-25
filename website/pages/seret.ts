import { send } from "../utilities";

type MovieCard = {
    Id: number,
    Name: string,
    Image: string,
    Description: string,
};

let ratingButton = document.querySelector("#ratingButton") as HTMLButtonElement;
let ratingInput = document.querySelector("#ratingInput") as HTMLInputElement;
let ratingDiv = document.querySelector("#ratingDiv") as HTMLDivElement;
let starsContainer = document.querySelector("#starsContainer") as HTMLDivElement;

let userId = localStorage.getItem("userId");
  
let urlParams = new URLSearchParams(window.location.search);
let seretId = parseInt(urlParams.get("seretId") || "", 10);

  if (!userId) {
    ratingDiv.innerHTML = "Please Connect So You Can Rate";
    }

if (userId)
{

ratingInput.oninput = function () {
  if (ratingInput.value !== "") {
      ratingButton.disabled = false;
      let rating = parseFloat(ratingInput.value);
      if (rating < 0) ratingInput.value = "0";
      if (rating > 5) ratingInput.value = "5";
  }
};

ratingButton.onclick = async function () {

  let rating = parseFloat(ratingInput.value);
  if (!Number.isNaN(rating)) {
    console.log(rating, userId, seretId);
    await send("rate", [rating, userId, seretId]);
    drawStars();
  } else {
    alert("Enter a valid rating.");
  }

};

async function drawStars() {
  let rating = await send("GetAverage", seretId) as number;

  starsContainer.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    let img = document.createElement("img");
    img.classList.add("star");
    starsContainer.appendChild(img);

    if (i <= rating) {
      img.src = "/website/images/star_full.png";
    } else if (i - 0.5 <= rating) {
      img.src = "/website/images/star_half.png";
    } else {
      img.src = "/website/images/star_empty.png";
    }
  }
}

drawStars();

}


send("getMovieCards", []).then((MovieCards) => {
    let movie = MovieCards.find((movie: MovieCard) => movie.Id === seretId);

    let container = document.querySelector(".movie-details") as HTMLElement;

    let image = document.createElement("img");
    image.src = movie.Image;
    image.alt = movie.Name;

    let name = document.createElement("h1");
    name.innerText = movie.Name;

    let Description = document.createElement("p");
    Description.innerText = movie.Description;

    container.appendChild(image);
    container.appendChild(name);
    container.appendChild(Description);
    
});

if (userId != null) {
  let ratingValue = await send("getRating", [userId, seretId]) as string | null;
  if (ratingValue != null) {
    ratingInput.value = ratingValue;
  }
}


