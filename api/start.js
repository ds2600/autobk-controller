const app = require('./server');
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`AutoBk Controller API listening at http://localhost:${port}`);
});