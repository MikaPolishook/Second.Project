import { send } from "../utilities";

type MovieCard = {
    Id: number,
    Name: string,
    Image: string,
    Description: string,
    CreatedBy: string,
  };


let MovieCards = await send("getMovieCards", []) as MovieCard[]; 
 let userId = localStorage.getItem("userId");
let movieListContainer = document.querySelector(".movie-list .container") as HTMLElement ;

MovieCards.forEach(movie => { 
  
    let movieCard = document.createElement("a");
    movieCard.classList.add("movie-card");

    let image = document.createElement("img");
    image.src = movie.Image;
    image.alt = movie.Name;

    let movieName = document.createElement("h3");
    movieName.innerText = movie.Name;


    if (userId != null && movie.CreatedBy === userId)
    {
    let deleteButton = document.createElement("button");
    let trashImg = document.createElement("img");
    trashImg.src = "/website/images/trash-can.png";
    deleteButton.classList.add("deleteButton");

        deleteButton.onclick = async function (event) {
          event.preventDefault();
            await send("deleteMovie", movie.Id); 
            movieListContainer.removeChild(movieCard); 
    };
        deleteButton.appendChild(trashImg);
        movieCard.appendChild(deleteButton);
  } 
  
  

    if (userId != null)
    {
   let favButton = document.createElement("button");
   favButton.innerText = "Add to Favorites";
   favButton.classList.add("favoriteButton");

   favButton.onclick = async function (event) {
    event.preventDefault();
    console.log(userId, movie.Id);
    await send("addFavorite", [userId, movie.Id]);
   }

       movieCard.appendChild(favButton);
    };

    movieCard.appendChild(image);
    movieCard.appendChild(movieName);

    movieListContainer.appendChild(movieCard);

    console.log(movie);

    movieCard.href = "seret.html?seretId=" + movie.Id;
});


let OpenPopup = document.getElementById("OpenPopup") as HTMLButtonElement;
let popup = document.getElementById("popup") as HTMLDivElement;
let overlay = document.getElementById("overlay") as HTMLDivElement;
let closeBtn = document.querySelector(".close-btn") as HTMLButtonElement;
let saveBtn = document.querySelector(".save-btn") as HTMLButtonElement;

OpenPopup.onclick = async function () {
  popup.style.display = "block";
  overlay.style.display = "flex";
};


closeBtn.onclick = function () {
  popup.style.display = "none";
  overlay.style.display = "none";
};


saveBtn.onclick = async function () {
  let title = (document.getElementById("titleInput") as HTMLInputElement).value;
  let image = (document.getElementById("imageInput") as HTMLInputElement).value;
  let description = (document.getElementById("descriptionInput") as HTMLTextAreaElement).value;

  const newMovie = {
    Name: title,
    Image: image,
    Description: description,
    CreatedBy: userId, 
  };

   await send("addMovieCard", newMovie);

    location.reload();

  popup.style.display = "none";
  overlay.style.display = "none";
}



let top10movies = document.querySelector(".top10movies .container") as HTMLElement;

let top10 = await send("getTop10Movies", []) as MovieCard[];

top10.forEach((movie, index) => {
  let card = document.createElement("div");
  card.classList.add("top-movie");

  let rank = document.createElement("h2");
  rank.innerText = `${index + 1}`;

  let name = document.createElement("h3");
  name.innerText = movie.Name;

  let img = document.createElement("img");
  img.src = movie.Image;
  img.alt = movie.Name;

  card.appendChild(rank);
  card.appendChild(img);
  card.appendChild(name);

  top10movies.appendChild(card);
});
