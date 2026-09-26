process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campus_events_test";

const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const app = require("../app");

let mongoServer;
let organizerA;
let organizerB;
let student;
let tokenA;
let tokenB;
let studentToken;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

const validEvent = {
  title: "Hackathon Kickoff",
  description: "Campus coding event",
  category: "Technical",
  date: "2026-10-12",
  time: "10:00",
  location: "Main Auditorium",
  capacity: 50,
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
  ]);

  [organizerA, organizerB, student] = await User.create([
    {
      name: "Organizer A",
      email: "organizer-a@campus.edu",
      password: "hashed",
      role: "organizer",
    },
    {
      name: "Organizer B",
      email: "organizer-b@campus.edu",
      password: "hashed",
      role: "organizer",
    },
    {
      name: "Student",
      email: "student@campus.edu",
      password: "hashed",
      role: "student",
    },
  ]);

  tokenA = signToken(organizerA);
  tokenB = signToken(organizerB);
  studentToken = signToken(student);
});

test("POST /api/events creates a valid event for an organizer", async () => {
  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${tokenA}`)
    .send(validEvent);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, "Event created successfully");
  assert.equal(res.body.data.title, validEvent.title);
  assert.equal(String(res.body.data.organizerId), String(organizerA._id));
});

test("POST /api/events rejects a missing title", async () => {
  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ ...validEvent, title: "" });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Title is required");
});

test("POST /api/events rejects a missing capacity", async () => {
  const body = { ...validEvent };
  delete body.capacity;

  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${tokenA}`)
    .send(body);

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Capacity is required");
});

test("POST /api/events rejects an invalid capacity", async () => {
  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ ...validEvent, capacity: 0 });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Capacity must be a positive integer");
});

test("POST /api/events rejects an unauthenticated user", async () => {
  const res = await request(app).post("/api/events").send(validEvent);

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test("POST /api/events rejects a student", async () => {
  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${studentToken}`)
    .send(validEvent);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test("POST /api/events ignores organizerId from the request body", async () => {
  const res = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ ...validEvent, organizerId: String(organizerB._id) });

  assert.equal(res.status, 201);
  assert.equal(String(res.body.data.organizerId), String(organizerA._id));
});

test("GET /api/events returns created events", async () => {
  await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app).get("/api/events");

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(Array.isArray(res.body.data), true);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].title, validEvent.title);
});

test("GET /api/events/:id returns an existing event", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app).get(`/api/events/${event._id}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(String(res.body.data._id), String(event._id));
});

test("GET /api/events/:id returns 404 for a missing event", async () => {
  const missingId = new mongoose.Types.ObjectId();

  const res = await request(app).get(`/api/events/${missingId}`);

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Event not found");
});

test("GET /api/events/:id returns 400 for an invalid ID", async () => {
  const res = await request(app).get("/api/events/not-an-id");

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, "Invalid event ID");
});

test("PUT /api/events/:id lets the owner update the event", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .put(`/api/events/${event._id}`)
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ title: "Updated Hackathon" });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.title, "Updated Hackathon");
});

test("PUT /api/events/:id rejects a different organizer", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .put(`/api/events/${event._id}`)
    .set("Authorization", `Bearer ${tokenB}`)
    .send({ title: "Hijacked Event" });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test("PUT /api/events/:id rejects a student", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .put(`/api/events/${event._id}`)
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ title: "Student Edit" });

  assert.equal(res.status, 403);
});

test("PUT /api/events/:id returns 404 for a missing event", async () => {
  const missingId = new mongoose.Types.ObjectId();

  const res = await request(app)
    .put(`/api/events/${missingId}`)
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ title: "Missing" });

  assert.equal(res.status, 404);
  assert.equal(res.body.message, "Event not found");
});

test("DELETE /api/events/:id lets the owner delete the event", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .delete(`/api/events/${event._id}`)
    .set("Authorization", `Bearer ${tokenA}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(await Event.findById(event._id), null);
});

test("DELETE /api/events/:id rejects a different organizer", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .delete(`/api/events/${event._id}`)
    .set("Authorization", `Bearer ${tokenB}`);

  assert.equal(res.status, 403);
});

test("DELETE /api/events/:id rejects a student", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .delete(`/api/events/${event._id}`)
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 403);
});

test("DELETE /api/events/:id returns 404 for a missing event", async () => {
  const missingId = new mongoose.Types.ObjectId();

  const res = await request(app)
    .delete(`/api/events/${missingId}`)
    .set("Authorization", `Bearer ${tokenA}`);

  assert.equal(res.status, 404);
  assert.equal(res.body.message, "Event not found");
});

test("DELETE /api/events/:id removes related registrations", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });
  await Registration.create({
    studentId: student._id,
    eventId: event._id,
    status: "REGISTERED",
  });

  const res = await request(app)
    .delete(`/api/events/${event._id}`)
    .set("Authorization", `Bearer ${tokenA}`);

  assert.equal(res.status, 200);
  assert.equal(await Registration.countDocuments({ eventId: event._id }), 0);
});

test("GET /api/events/:id/participants lets the owner see an empty list", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .get(`/api/events/${event._id}/participants`)
    .set("Authorization", `Bearer ${tokenA}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.data, []);
});

test("GET /api/events/:id/participants returns registrations for the owner", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });
  await Registration.create({
    studentId: student._id,
    eventId: event._id,
    status: "REGISTERED",
  });

  const res = await request(app)
    .get(`/api/events/${event._id}/participants`)
    .set("Authorization", `Bearer ${tokenA}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].studentId.email, student.email);
});

test("GET /api/events/:id/participants rejects a different organizer", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .get(`/api/events/${event._id}/participants`)
    .set("Authorization", `Bearer ${tokenB}`);

  assert.equal(res.status, 403);
});

test("GET /api/events/:id/participants rejects a student", async () => {
  const event = await Event.create({ ...validEvent, organizerId: organizerA._id });

  const res = await request(app)
    .get(`/api/events/${event._id}/participants`)
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 403);
});
