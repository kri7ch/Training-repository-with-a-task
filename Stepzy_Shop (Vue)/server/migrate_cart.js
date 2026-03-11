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

        // Create cart_items table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                device_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                PRIMARY KEY (id),
                UNIQUE KEY unique_user_device (user_id, device_id),
                CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                CONSTRAINT fk_cart_device FOREIGN KEY (device_id) REFERENCES devices (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `;

        await connection.execute(createTableQuery);
        console.log('cart_items table created or already exists.');

        await connection.end();
    } catch (err) {
        console.error('Migration error:', err);
    }
}

migrate();
