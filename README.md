# WM Vote Central

## Getting Started

1. Clone this repo

  ```sh
  $ git clone https://github.com/lscspirit/wmvote.git
  ```

2. Install all necessary package

  ```sh
  $ npm install
  ```

3. Start MySQL DB server

  ```sh
  $ docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=test1234 mysql
  ```

4. Start Redis server

  ```sh
  $ docker run -p 6379:6379 -d redis
  ```

5. Create database schema

  ```sh
  $ npm run db-migrate
  ```

6. Start the app server (from within the repo directory)

  ```sh
  $ npm start
  ```

7. Visit the app  

  - Voting page: http://127.0.0.1:3000
  - Result page: http://127.0.0.1:3000/votes/result


## Configuration

### Server Port

You can change the application server port by using the `PORT` environment variable.

For example:
```sh
$ PORT=4000 npm start
```
Now, the app will be available at http://127.0.0.1:4000.

### Service Settings

Settings for database, redis and external services can be found at `/config/default.json`.

## Scalability

This application server is designed to run in a distributed environment. Caching are done using Redis server, which can be distributed through Redis Cluster. Persistent data are stored in MySQL server, which also can be distributed with MySQL Cluster. This application server itself has logic in place to prevent multiple instances of the server from interfering with each other. As a result, we can scale the number of server instances as we wish. 

## Data Persistent

Data stored within a Docker container lives only within the life-cycle of the container. Therefore, once the container is killed, all the data will be gone. In this case, data within the MySQL database and Redis server (Redis is memory only in this setup anyways) will not persists. There are ways to map persistent data volume to each container, but that is out of the scope of this exercise.

