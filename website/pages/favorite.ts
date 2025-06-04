import { send } from "../utilities";

let container = document.getElementById("favoritesContainer") as HTMLElement;
let userId = localStorage.getItem("userId");

if (!userId) {
  container.innerHTML = "<p>Please Connect To See Your Favorites :)</p>";
} else {
  loadFavorites();
}

async function loadFavorites() {
  const favorites = await send("getFavorites", userId) as {
    Id: number,
    Name: string,
    Image: string,
    Description: string
  }[];

  favorites.forEach(movie => {
    let card = document.createElement("a");
    card.classList.add("movie-card");
    card.href = `seret.html?seretId=${movie.Id}`;

        
    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("deleteButton");
    
    deleteButton.onclick = async function (event) {
    event.preventDefault();
    await send("removeFavorite", [userId, movie.Id]); 
    container.removeChild(card); 
    }

    let image = document.createElement("img");
    image.src = movie.Image;
    image.alt = movie.Name;

    let name = document.createElement("h3");
    name.innerText = movie.Name;
     

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(deleteButton);

    container.appendChild(card);
  });
}
