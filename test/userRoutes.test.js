const request = require('supertest');
const server = require('../api/server');
const { sequelize } = require('../api/v1/models');

let token;
let userId;
let testEmail = 'admin@example.com';
let testPassword = 'p@ssw0rd';

beforeAll(async () => {
    const res = await request(server)
        .post('/api/login')
        .send({ email: testEmail, password: testPassword });
    token = res.body.token;
});

describe('User API Endpoints', () => {
    it('GET /api/users - should return all users', async () => {
        const res = await request(server)
          .get('/api/users')
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            res.body.forEach(user => {
                expect(user).toHaveProperty('kSelf');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('isDailyReportEnabled');
                expect(user).toHaveProperty('userLevel');
            });
        }
    });

    it('GET /api/user/:id - should return a single user', async () => {
        const res = await request(server)
          .get('/api/user/1')
          .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('kSelf');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('isDailyReportEnabled');
        expect(res.body).toHaveProperty('userLevel');
    });

    it('POST /api/register - should create a new user', async () => {
        const newUser = {
          email: 'newuser@example.com',
          password: 'newuserpassword',
          isDailyReportEnabled: true,
          userLevel: 'User',
        };
    
        const res = await request(server)
          .post('/api/register')
          .set('Authorization', `Bearer ${token}`)
          .send(newUser);
    
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User created successfully');
        expect(res.body).toHaveProperty('userId');
        
        userId = res.body.userId;
      });
    
      it('PUT /api/user/update-settings/:userId - should update user settings', async () => {
        const updatedSettings = {
          isDailyReportEnabled: false,
        };
    
        const res = await request(server)
          .put(`/api/user/update-settings/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updatedSettings);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User settings updated successfully');

      });
    
      it('DELETE /api/user/:userId - should delete a user', async () => {
        const res = await request(server)
          .delete(`/api/user/${userId}`)
          .set('Authorization', `Bearer ${token}`);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User deleted successfully');
      });

      it('PUT /api/user/change-password - should update users password', async () => {
        const newPassword = 'newp@ssw0rd';
        
        const passwordBody = {
          currentPassword: testPassword,
          newPassword: newPassword,
        };
        
        const res = await request(server)
          .put(`/api/user/change-password`)
          .set('Authorization', `Bearer ${token}`)
          .send(passwordBody);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Password updated successfully');

        const passwordRevert = {
          currentPassword: newPassword,
          newPassword: testPassword,
        };

        const resRevert = await request(server)
          .put(`/api/user/change-password`)
          .set('Authorization', `Bearer ${token}`)
          .send(passwordRevert);

        expect(resRevert.statusCode).toEqual(200);

      });

});

afterAll(done => {
    sequelize.close().then(() => done());
})