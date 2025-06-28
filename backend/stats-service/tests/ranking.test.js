const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Stats Service API', () => {
    const testEmail = 'rankingtest@example.com';

    beforeAll(async () => {
        await User.create({
        email: testEmail,
        name: 'Ranking Test',
        totalScore: 100,
        quizzesCompleted: 5,
        });
    });

    afterAll(async () => {
        await User.deleteOne({ email: testEmail });
    });

    it('should include test user in global ranking', async () => {
        const res = await request(app).get('/api/stats/global');
        expect(res.statusCode).toBe(200);
        const found = res.body.find(u => u.email === testEmail);
        expect(found).toBeDefined();
        expect(found.totalScore).toBe(100);
        expect(found.quizzesCompleted).toBe(5);
    });

  it('should return global ranking (array)', async () => {
    const res = await request(app).get('/api/stats/global');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('totalScore');
      expect(res.body[0]).toHaveProperty('quizzesCompleted');
    }
  });

  it('should return weekly ranking (array)', async () => {
    const res = await request(app).get('/api/stats/weekly');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('weeklyScore');
      expect(res.body[0]).toHaveProperty('quizzesCompleted');
    }
  });

  it('should return an empty array if no users', async () => {
    const res = await request(app).get('/api/stats/global');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    });

    it('should not return more than 100 users', async () => {
    const res = await request(app).get('/api/stats/global');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(100);
    });

    it('should return users sorted by totalScore descending', async () => {
    const res = await request(app).get('/api/stats/global');
    expect(res.statusCode).toBe(200);
    const scores = res.body.map(u => u.totalScore);
    for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
    });
});




// $ npm test

// > stats-service@1.0.0 test
// > jest

//   console.log
//     MongoDB connected

//       at log (../config/db.js:9:13)

//   console.log
//     Stats Service running on port 5001

//       at Server.log (app.js:32:34)

//   console.log
//     session controller!!

//       at log (controllers/weeklyRankingController.js:4:11)

// PASS tests/ranking.test.js
//   Stats Service API
//     √ should include test user in global ranking (60 ms)
//     √ should return global ranking (array) (20 ms)
//     √ should return weekly ranking (array) (19 ms)
//     √ should return an empty array if no users (12 ms)
//     √ should not return more than 100 users (11 ms)
//     √ should return users sorted by totalScore descending (10 ms)

// Test Suites: 1 passed, 1 total
// Tests:       6 passed, 6 total
// Snapshots:   0 total
// Time:        3.549 s, estimated 4 s
