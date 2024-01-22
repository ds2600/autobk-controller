// deviceRoutes.test.js
const request = require('supertest');
const server = require('../api/server'); // Adjust the path as needed
const { sequelize } = require('../api/v1/models');

let token;
// Authenticate before running the device tests
beforeAll(async () => {
  const res = await request(server)
    .post('/api/login')
    .send({ email: 'admin@example.com', password: 'p@ssw0rd' });
  token = res.body.token;
});

describe('Device API Endpoints', () => {
    
    let newDeviceId;
    const dateTime = new Date().getTime();
    const testDeviceDetails = {
        name: `Test Device ${dateTime}`,
        type: 'DCM',
        ip: '192.168.1.1',
        autoDay: 3,
        autoHour: 5,
        autoWeeks: 7
    };
    
    it('GET /api/devices - should return all devices', async () => {
        const res = await request(server)
        .get('/api/devices')
        .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            res.body.forEach(device => {
                expect(device).toHaveProperty('deviceId');
                expect(device).toHaveProperty('name');
                expect(device).toHaveProperty('type');
                expect(device).toHaveProperty('ip');
            })
        }
    });
    
    it('POST /api/devices - should create a new device', async () => {
        // const newDeviceData = { name: `New Device ${dateTime}`, type: 'DCM', ip: '192.168.1.1', autoDay: 3, autoHour: 5, autoWeeks: 7 };
        const res = await request(server)
        .post('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .send(testDeviceDetails);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('deviceId');
        newDeviceId = res.body.deviceId;
    });

    it('GET /api/devices/:id - should get an existing device information', async () => {
        const res = await request(server)
        .get(`/api/devices/${newDeviceId}`) // Use the newDeviceId from the POST test
        .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toEqual(200);
        
        expect(res.body.deviceInfo).toHaveProperty('deviceId');
        expect(res.body.deviceInfo).toHaveProperty('name', testDeviceDetails.name);
        expect(res.body.deviceInfo).toHaveProperty('type', testDeviceDetails.type);
        expect(res.body.deviceInfo).toHaveProperty('ip', testDeviceDetails.ip);
        expect(res.body.deviceInfo).toHaveProperty('autoDay', testDeviceDetails.autoDay);
        expect(res.body.deviceInfo).toHaveProperty('autoHour', testDeviceDetails.autoHour);
        expect(res.body.deviceInfo).toHaveProperty('autoWeeks', testDeviceDetails.autoWeeks);
    });
    
    it('PUT /api/devices/:id - should update an existing device', async () => {
        const updateData = { name: `Updated Device ${dateTime}` };
        const res = await request(server)
        .put(`/api/devices/${newDeviceId}`) // Use the newDeviceId from the POST test
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
    
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('name', `Updated Device ${dateTime}`);
        // Add more assertions as necessary
    });

    it('DELETE /api/devices/:id - should delete a device and it\'s associated backups and schedules', async () => {
        const res = await request(server)        
        .delete(`/api/devices/${newDeviceId}`) // Use the newDeviceId from the POST test
        .set('Authorization', `Bearer ${token}`)
    
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Device and all associated data deleted successfully');

    });
});

afterAll(done => {
    sequelize.close().then(() => done());
});
