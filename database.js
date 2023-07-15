const mysql = require('mysql2');
let instance = null;

const pool = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'root',
        database: 'musicdatabase'
});

pool.connect((err) => {
    if(err) {
        console.log(err.message);
    }
});

class databaseQueries {
    static getServiceInstance() {
        return instance ? instance : new databaseQueries();
    }

    async postInsert(username, token, firstLogin) {
        try {
            const response = await new Promise((resolve, reject) => {
                let query = null;
                if(firstLogin) {
                    query = "INSERT INTO users (username, token) VALUES (?, ?)";

                    pool.query(query, [username, token], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    })
                } else {
                    query = "UPDATE users SET token = (?) WHERE username = (?)"

                    pool.query(query, [token, username], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    })
                }
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }

    async getEntries() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users";

                pool.query(query, (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }

    async getUsername(username) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users WHERE username = ?";

                pool.query(query, [username], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }

    async getUserToken(username) {
        try {
            const response =  await new Promise((resolve, reject) => {
                const query = "SELECT token FROM users WHERE username = ?";

                pool.query(query, [username], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }

    async insertSong(songname, artist, album, url, id) {
        const newSong = await new Promise((resolve, reject) => {
            const query = "SELECT id FROM songs WHERE id = ?";

            pool.query(query, [id], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results.length === 0);
            });
        });
        if(newSong) {
            try {
                const response = await new Promise((resolve, reject) => {
                    const query = "INSERT INTO songs (songname, artist, album, url, id) VALUES (?, ?, ?, ?, ?)";

                    pool.query(query, [songname, artist, album, url, id], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });

                return response;
            } catch(error) {
                console.log(error);
            }
        }
    }

    async linkSongWithUser(id, username) {
        const newSongUser = await new Promise((resolve, reject) => {
            const query = "SELECT songs_id FROM songs_users WHERE (songs_id, users_username) = (?, ?)";

            pool.query(query, [id, username], (err, results) => {
                if(err) reject(new Error(err.message));
                resolve(results.length === 0);
            });
        });
        if(newSongUser) {
            try {
                const response = await new Promise((resolve, reject) => {
                    const query = "INSERT INTO songs_users (songs_id, users_username) VALUES (?, ?)";

                    pool.query(query, [id, username], (err, results) => {
                        if(err) reject(new Error(err.message));
                        resolve(results);
                    });
                });
                return response;
            } catch(error) {
                console.log(error);
            }
        }
    }

    async insertSchool(school, username) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE users SET school = ? WHERE username = ?";

                pool.query(query, [school, username], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }
}

module.exports = databaseQueries;