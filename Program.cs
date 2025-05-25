using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

class Program
{
    private static double value;
    private static int movieCardId;

    static void Main()
  {
    int port = 5000;

    var server = new Server(port);

    Console.WriteLine("The server is running");
    Console.WriteLine($"Main Page: http://localhost:{port}/website/pages/index.html");

    var database = new Database();

    if (!database.MovieCards.Any())
    {

      database.MovieCards.Add(new MovieCard("Outer Banks", "https://dnm.nflximg.net/api/v6/mAcAr9TxZIVbINe88xb3Teg5_OA/AAAABQ-JLdIftbjpq1egLdVnlCxSMHEk92lnsdyMVW1hlG112qc-W6-QFPzm212c5FYsjtjdIx9K7h2ZXZ5JMYF1OwVOXQ1Lw2G5dimNRWOFO_eOyc_Alh1n-wL3lN9OYvLIK_wvJQ.jpg?r=7d3", "On an island of haves and have-nots, teen John B enlists his three best friends to hunt for a legendary treasure linked to his father's disappearance."));
      database.MovieCards.Add(new MovieCard("The Vampire Diaries", "https://static0.srcdn.com/wordpress/wp-content/uploads/2022/11/The-Vampire-Diaries-New-Poster.jpg", "The lives, loves, dangers and disasters in the town, Mystic Falls, Virginia. Creaturs of unspeakable horror lurk beneath this town as a teenage girl is suddenly torn between two vampire brothers."));
      database.MovieCards.Add(new MovieCard("To All The Boys I've Loved Before", "https://m.media-amazon.com/images/M/MV5BMjQ3NjM5MTAzN15BMl5BanBnXkFtZTgwODQzMDAwNjM@._V1_.jpg", "A teenage girl's secret love letters are exposed and wreak havoc on her love life."));

      database.SaveChanges();
    }

    while (true)
    {
      (var request, var response) = server.WaitForRequest();

      Console.WriteLine($"Recieved a request with the path: {request.Path}");

      if (File.Exists(request.Path))
      {
        var file = new File(request.Path);
        response.Send(file);
      }
      else if (request.ExpectsHtml())
      {
        var file = new File("website/pages/404.html");
        response.SetStatusCode(404);
        response.Send(file);
      }
      else
      {
        try
        {

          if (request.Path == "getMovieCards")
          {
            MovieCard[] movieCards = database.MovieCards.ToArray();
            response.Send(movieCards);
          }

          if (request.Path == "signUp")
          {
            var (username, password) = request.GetBody<(string, string)>();

            var userExists = database.Users.Any(user =>
              user.Username == username
            );

            if (!userExists)
            {
              var userId = Guid.NewGuid().ToString();
              database.Users.Add(new User(userId, username, password));
              response.Send(userId);
            }
          }

          if (request.Path == "logIn")
          {
            var (username, password) = request.GetBody<(string, string)>();

            var user = database.Users.FirstOrDefault(
              user => user.Username == username && user.Password == password
            )!;

            var userId = user.Id;

            response.Send(userId);
          }

          else if (request.Path == "GetUsername")
          {
           string userId = request.GetBody<string>();
           var user = database.Users.Find(userId);
    
           if (user != null)
           response.Send(user.Username);
          }

          else if (request.Path == "getRating")
          {
            var (userId, movieCardId) = request.GetBody<(string, int)>();

            var value = database.Ratings
              .FirstOrDefault(rating => rating.UserId == userId && rating.MovieCardId == movieCardId)?
              .Value;

            response.Send(value);
          }

          if (request.Path == "rate")
          {
             var (rating ,userId, movieCardId) = request.GetBody<(int , string, int)>();

             var existsRating = database.Ratings
             .FirstOrDefault(r => r.UserId == userId && r.MovieCardId == movieCardId);

             if (existsRating != null)
              {
               existsRating.Value = rating;
                }

             else
             {
              var newRating = new Rating(rating, userId, movieCardId);
               database.Ratings.Add(newRating);
             }

                response.Send("Rating successfully updated or created.");
          }

          if (request.Path == "GetAverage")
          {
           var movieCardId = request.GetBody<int>();  

            var averageRating = database.Ratings
            .Where(rating => rating.MovieCardId == movieCardId) 
            .Average(rating => rating.Value);  

             response.Send(averageRating);
          }

          if (request.Path == "addMovieCard")
          {
           var newMovie = request.GetBody<MovieCard>();

           var movie = new MovieCard(newMovie.Name, newMovie.Image, newMovie.Description);

           database.MovieCards.Add(movie);

           response.Send("Movie added successfully.");
          }

          if (request.Path == "deleteMovie")
          {
            var movieId = request.GetBody<int>(); 

            var movieToDelete = database.MovieCards.FirstOrDefault(MovieCard => MovieCard.Id == movieId);

            if (movieToDelete != null)
             {

            var relatedRatings = database.Ratings.Where(Rating => Rating.MovieCardId == movieId).ToList();
            database.Ratings.RemoveRange(relatedRatings);

           database.MovieCards.Remove(movieToDelete);

           response.Send("Movie deleted successfully.");
             }
          }

          if (request.Path == "addFavorite")
          {
          var (userId, movieCardId) = request.GetBody<(string, int)>();

          var exists = database.Favorites.Any(f => f.UserId == userId && f.MovieCardId == movieCardId);

          if (!exists)
           {
            var favorite = new Favorite(userId, movieCardId);
            database.Favorites.Add(favorite);
           }

           response.Send("Added to favorites");
        }


         if (request.Path == "getFavorites")
         {
          var userId = request.GetBody<string>();
          var favorites = database.Favorites.Where(f => f.UserId == userId).Select(f => f.MovieCard).ToArray();

          response.Send(favorites);
         }

           if (request.Path == "removeFavorite")
          {
            var (userId, movieCardId) = request.GetBody<(string, int)>();

            var Favorite = database.Favorites.FirstOrDefault(f =>
            f.UserId == userId && f.MovieCardId == movieCardId);
            database.Favorites.Remove(Favorite);

            response.Send("Favorite removed");
          }


          if (request.Path == "getTop10Movies")
          {
            var top10 = database.MovieCards
          .Select(movie => new
          {
            Movie = movie,
            AverageRating = database.Ratings
               .Where(r => r.MovieCardId == movie.Id)
               .Average(r => (double?)r.Value) ?? 0  // אם אין דירוג = 0
          })
         .OrderByDescending(m => m.AverageRating)
         .Take(10)
         .Select(m => m.Movie)
         .ToArray();

            response.Send(top10);
          }

         



        


          response.SetStatusCode(405);

          database.SaveChanges();
        }
        catch (Exception exception)
        {
          Log.WriteException(exception);
        }
      }

      response.Close();
    }
  }
}


class Database() : DbBase("database")
{
  public DbSet<User> Users { get; set; } = default!;
  public DbSet<MovieCard> MovieCards { get; set; } = default!;
  public DbSet<Rating> Ratings { get; set; } = default!;
  public DbSet<Favorite> Favorites { get; set; } = default!;
}

class User(string id, string username, string password)
{
  [Key] public string Id { get; set; } = id;
  public string Username { get; set; } = username;
  public string Password { get; set; } = password;
}

class MovieCard(string name, string image, string description)
{
  [Key] public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public string Image { get; set; } = image;
  public string Description { get; set; } = description;
}

class Rating(double value, string userId, int movieCardId)
{
  [Key] public int Id { get; set; } = default!;
  public double Value { get; set; } = value;
  public string UserId { get; set; } = userId;
  [ForeignKey("UserId")] public User User { get; set; } = default!;
  public int MovieCardId { get; set; } = movieCardId;
  [ForeignKey("MovieCardId")] public MovieCard MovieCard { get; set; } = default!;

}

class Favorite(string userId, int movieCardId)
{
  [Key] public int Id { get; set; } = default!;
  public string UserId { get; set; } = userId;
  [ForeignKey("UserId")] public User User { get; set; } = default!;
  public int MovieCardId { get; set; } = movieCardId;
  [ForeignKey("MovieCardId")] public MovieCard MovieCard { get; set; } = default!;
}