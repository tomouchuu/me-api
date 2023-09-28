import { RESTDataSource } from '@apollo/datasource-rest';

class GithubApi extends RESTDataSource {
  baseURL = 'https://api.github.com/';

  willSendRequest(_path, request) {
    request.headers['User-Agent'] = process.env.GITHUB_USERNAME;
  }

  // per_page
  getEvents(limit = 10) {
    return this.get(
      `users/${process.env.GITHUB_USERNAME}/events/public`, {
        params: {
          per_page: limit.toString()
        }
      }
    );
  }
}

export default GithubApi;