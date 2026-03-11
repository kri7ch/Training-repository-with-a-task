import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '230606',
    database: 'dbshoptech',
    port: 3306
};

async function migrate() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to DB');

        // Check if registration_date exists
        const [columns] = await connection.execute("SHOW COLUMNS FROM users LIKE 'registration_date'");
        if (columns.length === 0) {
            console.log('Adding registration_date column to users table...');
            await connection.execute("ALTER TABLE users ADD COLUMN registration_date DATETIME DEFAULT CURRENT_TIMESTAMP");
            console.log('Column added successfully.');
        } else {
            console.log('registration_date column already exists.');
        }

        await connection.end();
    } catch (err) {
        console.error('Migration error:', err);
    }
}

migrate();
