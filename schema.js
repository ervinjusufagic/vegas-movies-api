const axios = require("axios");
const mongoose = require("mongoose");
const MovieDb = require("./movies");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLInputObjectType
} = require("graphql");

function fetchMovies(id) {
  return axios
    .get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=d3bc8ccb47c8aae5e110016737796192&append_to_response=videos,credits`
    )
    .then(result => {
      if (result.data !== null) {
        return result.data;
      }
    });
}

//types
const GenreType = new GraphQLObjectType({
  name: "Genre",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString }
  })
});

const VideoType = new GraphQLObjectType({
  name: "Video",
  fields: () => ({
    results: { type: new GraphQLList(VideoResultType) }
  })
});
const VideoResultType = new GraphQLObjectType({
  name: "VideoResult",
  fields: () => ({
    id: { type: GraphQLString },
    key: { type: GraphQLString },
    type: { type: GraphQLString }
  })
});

const CastType = new GraphQLObjectType({
  name: "Cast",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    character: { type: GraphQLString },
    profile_path: { type: GraphQLString }
  })
});

const CreditsType = new GraphQLObjectType({
  name: "Credits",
  fields: () => ({
    cast: { type: new GraphQLList(CastType) }
  })
});

const MovieType = new GraphQLObjectType({
  name: "Movie",
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    overview: { type: GraphQLString },
    poster_path: { type: GraphQLString },
    release_date: { type: GraphQLString },
    vote_average: { type: GraphQLFloat },
    vote_count: { type: GraphQLInt },
    runtime: { type: GraphQLInt },
    genres: { type: new GraphQLList(GenreType) },
    videos: { type: VideoType },
    credits: { type: CreditsType }
  })
});

const SearchType = new GraphQLObjectType({
  name: "Search",
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    overview: { type: GraphQLString },
    poster_path: { type: GraphQLString },
    release_date: { type: GraphQLString }
  })
});

const MovieID = new GraphQLObjectType({
  name: "MovieID",
  fields: () => ({
    id: { type: GraphQLInt }
  })
});

//queries
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    movies: {
      type: new GraphQLList(MovieType),
      args: {
        ids: { type: new GraphQLList(GraphQLInt) }
      },
      resolve(parent, args) {
        let movies = [];

        args.ids.forEach(id => {
          movies.push(fetchMovies(id));
        });

        return movies;
      }
    },
    search: {
      type: new GraphQLList(SearchType),
      args: {
        query: { type: GraphQLString }
      },
      resolve(parent, args) {
        return axios
          .get(
            `https://api.themoviedb.org/3/search/movie?api_key=d3bc8ccb47c8aae5e110016737796192&language=en-US&query=${
              args.query
            }&include_adult=false`
          )
          .then(res => res.data.results);
      }
    },
    nowplaying: {
      type: new GraphQLList(MovieID),
      resolve(parent) {
        return axios
          .get(
            `https://api.themoviedb.org/3/movie/now_playing?api_key=d3bc8ccb47c8aae5e110016737796192&language=en-US&page=1`
          )
          .then(res => res.data.results);
      }
    },
    popular: {
      type: new GraphQLList(MovieID),
      resolve(parent) {
        return axios
          .get(
            `https://api.themoviedb.org/3/movie/popular?api_key=d3bc8ccb47c8aae5e110016737796192&language=en-US&page=1`
          )
          .then(res => res.data.results);
      }
    },
    favourites: {
      type: new GraphQLList(GraphQLInt),

      resolve(parent, args) {
        return MovieDb.where({ _id: "5d474cd81c9d440000d6e395" })
          .select("favourites")
          .exec()
          .then(movies => {
            return movies[0].favourites;
          });
      }
    },

    watchLater: {
      type: new GraphQLList(GraphQLInt),

      resolve(parent, args) {
        return MovieDb.where({ _id: "5d474cd81c9d440000d6e395" })
          .select("watchLater")
          .exec()
          .then(movies => {
            return movies[0].watchLater;
          });
      }
    }
  }
});

//mutations

const MovieInputType = new GraphQLInputObjectType({
  name: "InputMovie",
  fields: () => ({
    id: { type: GraphQLInt }
  })
});

MutationType = new GraphQLObjectType({
  name: "MutationType",
  fields: {
    addToWatchLater: {
      type: GraphQLString,
      args: {
        movieId: { type: GraphQLInt }
      },

      resolve(parent, args) {
        MovieDb.update(
          { _id: "5d474cd81c9d440000d6e395" },
          { $push: { watchLater: args.movieId } },

          function(error, success) {
            if (error) {
              console.log(error);
            } else {
              console.log(success);
            }
          }
        );
      } //fix return
    },
    addToFavourites: {
      type: GraphQLString,
      args: {
        movieId: { type: GraphQLInt }
      },

      resolve(parent, args) {
        MovieDb.update(
          { _id: "5d474cd81c9d440000d6e395" },
          { $push: { favourites: args.movieId } },

          function(error, success) {
            if (error) {
              console.log(error);
            } else {
              console.log(success);
            }
          }
        );
      } //fix return
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: MutationType
});
