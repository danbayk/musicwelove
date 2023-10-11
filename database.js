const mysql = require('mysql2');
let instance = null;

const pool = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '$$$$$$$asF',
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

    async insertSong(songname, artist, album, url, id, cover) {
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
                    const query = "INSERT INTO songs (songname, artist, album, url, id, cover) VALUES (?, ?, ?, ?, ?, ?)";

                    pool.query(query, [songname, artist, album, url, id, cover], (err, results) => {
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

                pool.query(query, [school.replace(/\s/g, ""), username], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }

    async getSchoolSongs(school) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM songs INNER JOIN songs_users ON songs.id = songs_users.songs_id INNER JOIN users ON songs_users.users_username = users.username WHERE school = ?";

                pool.query(query, [school], (err, results) => {
                    if(err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch(error) {
            console.log(error);
        }
    }

    async getUserSongs(username) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users INNER JOIN songs_users ON users.username = songs_users.users_username INNER JOIN songs ON songs_users.songs_id = songs.id WHERE username = ?";

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
}

module.exports = databaseQueries;