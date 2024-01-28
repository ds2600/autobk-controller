const app = require('./server');
const port = process.env.REACT_APP_API_PORT || 5000;
const host = process.env.API_IP;

app.listen(port, host, () => {
    console.log(`AutoBk Controller API listening at http://${host}:${port}`);
});