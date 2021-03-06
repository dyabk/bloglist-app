const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const app = require("../app");
const api = supertest(app);
const helper = require("./test_helper");

describe("when there is a single user in the database", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("the user is returned", async () => {
    const response = await api.get("/api/users");

    expect(response.body).toHaveLength(1);
  });

  test("creation succeeds with a new username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "ntesla",
      name: "Nikola Tesla",
      password: "eelunIzMiSun",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with statuscode 400 if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "washincoln6771",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(`expected \`username\` to be unique`);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("creation fails with statuscode 400 if username is too short (length < 3)", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "fo",
      name: "Superuser",
      password: "washincoln6771",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(
      `Path \`username\` (\`${newUser.username}\`) is shorter than the minimum allowed length`
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("creation fails with statuscode 400 if username is missing", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: "Superuser",
      password: "washincoln6771",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Path `username` is required");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("creation fails with statuscode 400 if password is missing", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "ntesla",
      name: "Superuser",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("Path `password` is required");

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test("creation fails with statuscode 400 if password is too short (length < 3)", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "ntesla",
      name: "Superuser",
      password: "rr",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain(`The password is too short`);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
