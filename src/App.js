import React, { useState, useEffect, useCallback } from 'react';

import MoviesList from './components/MoviesList';
import AddMovie from './components/AddMovie';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(true);

  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://crudcrud.com/api/e55e9cf8ef0441a083263aa98a27d2ca/movies');
      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const data = await response.json();

      const transformedMovies = data.map((movieData) => {
        return {
          id: movieData._id,
          title: movieData.title,
          openingText: movieData.openingText,
          releaseDate: movieData.releaseDate,
        };
      });
      setMovies(transformedMovies);
    } catch (error) {
      if (isRetrying && retryCount < 5) {
        setError(`Something went wrong...Retrying`);
        setTimeout(() => setRetryCount(retryCount + 1), 5000);
      } else {
        setError('Failed to fetch movies.');
      }
    }
    setIsLoading(false);
  }, [retryCount, isRetrying]);

  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);
  
  async function addMovieHandler(movie) {
    const response = await fetch('https://crudcrud.com/api/e55e9cf8ef0441a083263aa98a27d2ca/movies', {
      method: 'POST',
      body: JSON.stringify(movie),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
  }

  const cancelRetryHandler = () => {
    setIsRetrying(false);
    setRetryCount(0);
  };

  let content = <p>Found no movies.</p>;

  if (movies.length > 0) {
    content = <MoviesList movies={movies} />;
  }

  if (error) {
    content = (
      <>
        <p>{error}</p>
        {isRetrying && (
          <button onClick={cancelRetryHandler}>Cancel</button>
        )}
      </>
    );
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
