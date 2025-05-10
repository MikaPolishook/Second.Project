import { send } from "../utilities";

type MovieCard = {
    Id: number,
    Name: string,
    Image: string,
    Description: string,
  };


let MovieCards = await send("getMovieCards", []) as MovieCard[]; 
let movieListContainer = document.querySelector(".movie-list .container") as HTMLElement ;

MovieCards.forEach(movie => { 
  
    let movieCard = document.createElement("a");
    movieCard.classList.add("movie-card");

    let image = document.createElement("img");
    image.src = movie.Image;
    image.alt = movie.Name;

    let movieName = document.createElement("h3");
    movieName.innerText = movie.Name;


    movieCard.appendChild(image);
    movieCard.appendChild(movieName);

    movieListContainer.appendChild(movieCard);

    console.log(movie);

    movieCard.href = "seret.html?seretId=" + movie.Id;
});

