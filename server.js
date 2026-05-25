const express = require('express');
const path = require('path');
const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;

// ตั้งค่าให้ Express สามารถรับข้อมูลแบบ JSON และดึงไฟล์หน้าเว็บได้
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// จำลองฐานข้อมูลด้วย Object (ในระบบจริงควรใช้ PostgreSQL หรือ MongoDB)
const urlDatabase = {};

// Endpoint สำหรับสร้าง URL ย่อ (ครอบคลุม FR1 และ FR2)
app.post('/api/shorten', (req, res) => {
    const { originalUrl, customCode } = req.body;

    if (!originalUrl) {
         return res.status(400).json({ error: 'กรุณาระบุ URL ต้นฉบับ' });
    }

    let shortCode = customCode;

    // หากไม่ระบุ Custom Code ให้สุ่มรหัส 6 หลัก
    if (!shortCode) {
        shortCode = Math.random().toString(36).substring(2, 8);
    } else if (urlDatabase[shortCode]) {
        // ตรวจสอบว่า Custom Code ซ้ำหรือไม่
        return res.status(400).json({ error: 'ชื่อ URL นี้ถูกใช้งานไปแล้ว' });
    }

    // บันทึกข้อมูลลงฐานข้อมูลจำลอง (ครอบคลุม FR3 บางส่วน)
    urlDatabase[shortCode] = {
        originalUrl: originalUrl,
        clicks: 0,
        createdAt: new Date()
    };

    const shortUrl = `http://localhost:${PORT}/${shortCode}`;
    res.json({ shortUrl, shortCode });
});

// Endpoint สำหรับ Redirect ไปยัง URL ต้นฉบับ (ครอบคลุม FR6)
app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const urlData = urlDatabase[shortCode];

    if (urlData) {
        urlData.clicks++; // บันทึกสถิติการคลิก
        console.log(`URL: ${shortCode} ถูกคลิก ${urlData.clicks} ครั้ง`);
        res.redirect(urlData.originalUrl);
    } else {
        res.status(404).send('ไม่พบ URL ที่ต้องการ หรือ URL อาจถูกลบไปแล้ว');
    }
});

// เริ่มรันเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์เปิดทำงานแล้วที่ http://localhost:${PORT}`);
});