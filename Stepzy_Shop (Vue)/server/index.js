import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '230606',
    database: 'dbshoptech',
    port: 3306
};

async function query(sql, params) {
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.execute(sql, params);
    await connection.end();
    return results;
}

app.get('/api/products', async (req, res) => {
    try {
        const products = await query(`
            SELECT d.*, b.brand_name as manufacturer, t.type_name as category, s.quantity as stock_quantity,
            (SELECT image_url FROM images WHERE device_id = d.id LIMIT 1) as image
            FROM devices d
            JOIN brands b ON d.brand_id = b.id
            JOIN device_types t ON d.type_id = t.id
            LEFT JOIN stocks s ON d.id = s.device_id
        `);
        res.json(products);
    } catch (err) {
        console.error('API Error /api/products:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await query('SELECT id, type_name as name FROM device_types');
        res.json(categories);
    } catch (err) {
        console.error('API Error /api/categories:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/manufacturers', async (req, res) => {
    try {
        const manufacturers = await query('SELECT id, brand_name as name FROM brands');
        res.json(manufacturers);
    } catch (err) {
        console.error('API Error /api/manufacturers:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pickup-points', async (req, res) => {
    try {
        const points = await query('SELECT id, postal_code as address_index, city as address_city, street as address_street, house_number as address_number_house FROM pickup_points');
        res.json(points);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/suppliers', async (req, res) => {
    try {
        const suppliers = await query('SELECT id, supplier_name as name FROM suppliers');
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await query(
            'SELECT id, last_name as lastname, first_name as name, middle_name as midname, email, role FROM users WHERE email = ? AND password_hash = ?',
            [email, password]
        );
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ success: false, message: 'Неверный email или пароль' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { lastname, name, midname, email, password } = req.body;
    
    if (!lastname || !name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Заполните обязательные поля' });
    }

    try {
        const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
        }

        const result = await query(
            'INSERT INTO users (last_name, first_name, middle_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            [lastname, name, midname || null, email, password, 'клиент']
        );
        
        res.json({ success: true, userId: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { user_id, pickup_point_id, products } = req.body;
    const date_order = new Date().toISOString().split('T')[0];
    const date_delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const code = Math.floor(100 + Math.random() * 900);

    try {
        for (const p of products) {
            const [rows] = await query('SELECT quantity as stock_quantity FROM stocks WHERE device_id = ?', [p.id]);
            if (!rows || rows.stock_quantity < p.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Недостаточно товара "${p.name}" на складе. Доступно: ${rows ? rows.stock_quantity : 0}` 
                });
            }
        }

        const result = await query(
            'INSERT INTO orders (order_date, delivery_date, pickup_point_id, user_id, order_code, order_status) VALUES (?, ?, ?, ?, ?, ?)',
            [date_order, date_delivery, pickup_point_id, user_id, code, 'Оформлен']
        );
        const order_id = result.insertId;

        for (const p of products) {
            await query(
                'INSERT INTO order_items (order_id, device_id, quantity, price) VALUES (?, ?, ?, ?)',
                [order_id, p.id, p.quantity, p.price]
            );
            await query(
                'UPDATE stocks SET quantity = quantity - ? WHERE device_id = ?',
                [p.quantity, p.id]
            );
        }

        res.json({ success: true, order_id, code });
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders/:user_id', async (req, res) => {
    try {
        const orders = await query(
            'SELECT id, order_date as date_order, delivery_date as date_delivery, order_code as code, order_status as status_order FROM orders WHERE user_id = ? ORDER BY order_date DESC',
            [req.params.user_id]
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const devices = await query(
            `SELECT d.*, b.brand_name as manufacturer, t.type_name as category, s.quantity as stock_quantity
             FROM devices d
             JOIN brands b ON d.brand_id = b.id
             JOIN device_types t ON d.type_id = t.id
             LEFT JOIN stocks s ON d.id = s.device_id
             WHERE d.id = ?`,
            [req.params.id]
        );
        if (devices.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        const images = await query('SELECT image_url FROM images WHERE device_id = ?', [req.params.id]);
        const product = devices[0];
        product.images = images.map(img => img.image_url);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    let { lastname, name, midname, email } = req.body;
    
    lastname = lastname ? lastname.trim() : '';
    name = name ? name.trim() : '';
    midname = midname ? midname.trim() : '';
    email = email ? email.trim() : '';

    if (!lastname || !name || !email) {
        return res.status(400).json({ success: false, message: 'Заполните обязательные поля' });
    }

    if (lastname.length < 2 || name.length < 2) {
        return res.status(400).json({ success: false, message: 'Имя и фамилия должны содержать минимум 2 символа' });
    }

    try {
        const existing = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email уже используется другим пользователем' });
        }

        await query(
            'UPDATE users SET last_name = ?, first_name = ?, middle_name = ?, email = ? WHERE id = ?',
            [lastname, name, midname || null, email, req.params.id]
        );
        
        const updatedUser = await query(
            'SELECT id, last_name as lastname, first_name as name, middle_name as midname, email, role FROM users WHERE id = ?',
            [req.params.id]
        );

        res.json({ success: true, user: updatedUser[0] });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cart/:userId', async (req, res) => {
    try {
        const cartItems = await query(`
            SELECT ci.id, ci.quantity, ci.device_id, d.model_name as name, d.price, d.discount,
                   b.brand_name as manufacturer, t.type_name as category, s.quantity as stock_quantity,
                   (SELECT image_url FROM images WHERE device_id = d.id LIMIT 1) as image
            FROM cart_items ci
            JOIN devices d ON ci.device_id = d.id
            JOIN brands b ON d.brand_id = b.id
            JOIN device_types t ON d.type_id = t.id
            LEFT JOIN stocks s ON d.id = s.device_id
            WHERE ci.user_id = ?
        `, [req.params.userId]);
        
        const items = cartItems.map(item => ({
            ...item,
            price: Math.round(item.price * (1 - (item.discount || 0) / 100))
        }));
        
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cart', async (req, res) => {
    const { user_id, device_id, quantity } = req.body;
    try {
        const [stock] = await query('SELECT quantity FROM stocks WHERE device_id = ?', [device_id]);
        if (!stock || stock.quantity < quantity) {
            return res.status(400).json({ success: false, message: 'Недостаточно товара на складе' });
        }

        const existing = await query('SELECT id, quantity FROM cart_items WHERE user_id = ? AND device_id = ?', [user_id, device_id]);
        
        if (existing.length > 0) {
            const newQuantity = existing[0].quantity + quantity;
            if (stock.quantity < newQuantity) {
                return res.status(400).json({ success: false, message: 'Достигнут лимит товара на складе' });
            }
            await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQuantity, existing[0].id]);
        } else {
            await query('INSERT INTO cart_items (user_id, device_id, quantity) VALUES (?, ?, ?)', [user_id, device_id, quantity]);
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cart/:id', async (req, res) => {
    const { quantity } = req.body;
    try {
        if (quantity <= 0) {
            await query('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
        } else {
            const [item] = await query('SELECT device_id FROM cart_items WHERE id = ?', [req.params.id]);
            if (item) {
                const [stock] = await query('SELECT quantity FROM stocks WHERE device_id = ?', [item.device_id]);
                if (!stock || stock.quantity < quantity) {
                    return res.status(400).json({ success: false, message: 'Недостаточно товара на складе' });
                }
                await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cart/:id', async (req, res) => {
    try {
        await query('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/cart/user/:userId', async (req, res) => {
    try {
        await query('DELETE FROM cart_items WHERE user_id = ?', [req.params.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await query('SELECT id, last_name, first_name, middle_name, email, role, registration_date FROM users ORDER BY registration_date DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await query(`
            SELECT o.id, o.order_date, o.delivery_date, o.order_status, o.order_code,
                   u.email as user_email, CONCAT(u.last_name, ' ', u.first_name) as user_name,
                   COUNT(oi.id) as items_count, SUM(oi.price * oi.quantity) as total_price
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.order_date DESC
        `);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await query('UPDATE orders SET order_status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const { model_name, price, supplier_id, brand_id, type_id, discount, specifications, stock_quantity, image_url } = req.body;
    try {
        const result = await query(
            'INSERT INTO devices (model_name, price, supplier_id, brand_id, type_id, discount, specifications) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [model_name, price, supplier_id, brand_id, type_id, discount || 0, specifications]
        );
        const deviceId = result.insertId;

        await query('INSERT INTO stocks (device_id, quantity, unit) VALUES (?, ?, ?)', [deviceId, stock_quantity || 0, 'шт.']);

        if (image_url) {
            await query('INSERT INTO images (device_id, image_url) VALUES (?, ?)', [deviceId, image_url]);
        }

        res.json({ success: true, id: deviceId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { model_name, price, supplier_id, brand_id, type_id, discount, specifications, stock_quantity, image_url } = req.body;
    try {
        await query(
            'UPDATE devices SET model_name=?, price=?, supplier_id=?, brand_id=?, type_id=?, discount=?, specifications=? WHERE id=?',
            [model_name, price, supplier_id, brand_id, type_id, discount, specifications, req.params.id]
        );

        const stockExists = await query('SELECT id FROM stocks WHERE device_id = ?', [req.params.id]);
        if (stockExists.length > 0) {
            await query('UPDATE stocks SET quantity = ? WHERE device_id = ?', [stock_quantity, req.params.id]);
        } else {
            await query('INSERT INTO stocks (device_id, quantity, unit) VALUES (?, ?, ?)', [req.params.id, stock_quantity, 'шт.']);
        }

        if (image_url) {
            await query('DELETE FROM images WHERE device_id = ?', [req.params.id]);
            await query('INSERT INTO images (device_id, image_url) VALUES (?, ?)', [req.params.id, image_url]);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await query('DELETE FROM images WHERE device_id = ?', [req.params.id]);
        await query('DELETE FROM stocks WHERE device_id = ?', [req.params.id]);
        
        try {
            await query('DELETE FROM devices WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } catch (e) {
             if (e.code === 'ER_ROW_IS_REFERENCED_2') {
                 res.status(400).json({ success: false, message: 'Нельзя удалить товар, который был заказан.' });
             } else {
                 throw e;
             }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
