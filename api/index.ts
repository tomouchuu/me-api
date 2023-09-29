import { Elysia } from "elysia";
import { apollo, gql } from "@elysiajs/apollo";

import GithubApi from "./modules/github/index.js";
import LastFMApi from "./modules/lastfm/index.js";
import personal from "./modules/personal/index.js";

const typeDefs = gql`
  type LastFmMusicInfo {
    url: String!
    name: String!
    image: String
    playedCount: Int!
  }

  type RecentlyPlayed {
    track: LastFmMusicInfo!
    artist: LastFmMusicInfo!
    album: LastFmMusicInfo!
    isLive: String
  }

  type GithubRepo {
    name: String
  }

  type GithubIssue {
    number: String
  }

  type GithubPayload {
    action: String
    issue: GithubIssue
    ref: String
    ref_type: String
  }

  type GithubEvent {
    payload: GithubPayload
    repo: GithubRepo
    type: String
  }

  type Contact {
    email: String!
    twitter: String!
    github: String!
    instagram: String
    applemusic: String
    lastfm: String
    discord: String
    youtube: String
    twitch: String
    linkedin: String
    cv: String
  }

  type Project {
    name: String
    description: String
    url: String!
  }

  type Work {
    company: String
    date: String
    description: String
    title: String
    url: String!
  }

  type Personal {
    name: String!
    birthday: String!
    location: String!
    based: String
    contact: Contact!
    skills: [String]!
    projects: [Project]!
    work: [Work]!
  }

  type Query {
    github(limit: Int): [GithubEvent]
    music: RecentlyPlayed
    personal: Personal!
  }
`;

const resolvers = {
  Query: {
    github: (_source, { limit }, { dataSources }) => {
      return dataSources.githubApi.getEvents(limit);
    },
    music: (_source, _args, { dataSources }) => {
      return dataSources.lastFmAPI.formatLatestTrack();
    },
    personal: () => personal,
  },
};

const app = new Elysia()
  .use(
    apollo({
      typeDefs,
      resolvers,
      introspection: true,
      context: async () => {
        return {
          dataSources: {
            githubApi: new GithubApi(),
            lastFmAPI: new LastFMApi(),
          },
        };
      },
      path: "/",
      enablePlayground: true,
    })
  )
  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
