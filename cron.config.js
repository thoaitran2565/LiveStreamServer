// Cron job to hit endpoint every 14 sec to keep backend alive always
import * as cron from 'cron';
import https from 'https';
const backendUrl = "https://livestream-server.onrender.com";

export const job = new cron.CronJob('*/13 * * * *', function () {
    // This function will be executed every 14 minutes.
    console.log("--------------------------");
    console.log("Restarting server");
    // Perform an HTTPS GET request to hit any backend api.
    https
        .get(backendUrl, (res) => {
            if (res.statusCode == 200) {
                console.log('Server restarted');
            }
            else {
                console.error(
                    `failed to restart server with status code: ${res.statusCode}`
                );
            }
            console.log("--------------------------");
        })
        .on("error", (err) => {
            console.error('Error during Restart:', err.message);
            console.log("--------------------------");
        })
});
// Export the cron job.
// module.exports = { job }