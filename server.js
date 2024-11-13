const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase, ref, set, push, get, update, remove } = require('firebase-admin/database');

// Setup Firebase Admin SDK
const serviceAccount = require('./firebaseServiceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://visitor-management-syste-24342-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const auth = getAuth();
const db = getDatabase();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Login Route
app.post('/login', async(req, res) => {
    const { idToken } = req.body;
    console.log('Received ID Token:', idToken);

    try {
        // ตรวจสอบ ID token
        const decodedToken = await auth.verifyIdToken(idToken); // Use auth here
        console.log('Decoded Token:', decodedToken);

        const email = decodedToken.email;

        // ดึงข้อมูลผู้ใช้จาก Realtime Database
        const userRef = db.ref('users').orderByChild('email').equalTo(email);
        const snapshot = await userRef.once('value');

        if (!snapshot.exists()) {
            console.log('No user found for email:', email);
            return res.status(401).send({ error: 'Invalid email' });
        }

        const userData = snapshot.val();
        const userId = Object.keys(userData)[0];
        const userRole = userData[userId].role;

        res.status(200).send({ uid: userId, role: userRole });
    } catch (error) {
        console.error('Error verifying token or fetching user:', error);
        res.status(401).send({ error: 'Invalid token or user does not exist.' });
    }
});

// เส้นทางสำหรับลงทะเบียนผู้ใช้
app.post('/register', async(req, res) => {
    const { email, password, role } = req.body;
    try {
        const userRecord = await auth.createUser({ email, password });
        const userRef = db.ref(`users/${userRecord.uid}`);
        await userRef.set({ email, role });
        res.status(201).send({ uid: userRecord.uid, role });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// เส้นทางสำหรับลบผู้ใช้
app.delete('/users/:uid', async(req, res) => {
    const { uid } = req.params;
    try {
        await auth.deleteUser(uid);
        await db.ref(`users/${uid}`).remove();
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// เส้นทางสำหรับอัปเดตผู้ใช้
app.put('/users/:uid', async(req, res) => {
    const { uid } = req.params;
    const { password, role } = req.body;
    try {
        await db.ref(`users/${uid}`).update({ role });
        if (password) {
            await auth.updateUser(uid, { password });
        }
        res.status(200).send({ message: 'User updated successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});
app.get('/users', async(req, res) => {
    try {
        const usersRef = db.ref('users');
        const snapshot = await usersRef.once('value');
        if (snapshot.exists()) {
            res.status(200).send(snapshot.val());
        } else {
            res.status(404).send({ error: 'No users found' });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// API: ดึง Floors
app.get('/floors', async(req, res) => {
    try {
        const floorsRef = db.ref('contactOptions/floors');
        const snapshot = await floorsRef.once('value');
        const floors = snapshot.val();
        res.json(floors || {});
    } catch (error) {
        res.status(500).send('Error fetching floors');
    }
});

// API: ดึง Companies ตาม Floor
app.get('/floors/:floor/companies', async(req, res) => {
    const { floor } = req.params;
    try {
        const companiesRef = db.ref(`contactOptions/floors/${floor}/companies`);
        const snapshot = await companiesRef.once('value');
        const companies = snapshot.val();
        res.json(companies || {});
    } catch (error) {
        res.status(500).send('Error fetching companies');
    }
});

// API: ดึง Departments ตาม Company
app.get('/companies/:company/departments', async(req, res) => {
    const { company } = req.params;
    try {
        const departmentsRef = db.ref(`contactOptions/companies/${company}/departments`);
        const snapshot = await departmentsRef.once('value');
        const departments = snapshot.val();
        res.json(departments || {});
    } catch (error) {
        res.status(500).send('Error fetching departments');
    }
});

// API: ดึง Contacts ตาม Department
app.get('/departments/:department/contacts', async(req, res) => {
    const { department } = req.params;
    try {
        const contactsRef = db.ref(`contactOptions/departments/${department}/contacts`);
        const snapshot = await contactsRef.once('value');
        const contacts = snapshot.val();
        res.json(contacts || {});
    } catch (error) {
        res.status(500).send('Error fetching contacts');
    }
});

// API: ดึง Reasons
app.get('/reasons', async(req, res) => {
    try {
        const reasonsRef = db.ref('contactOptions/reasons');
        const snapshot = await reasonsRef.once('value');
        const reasons = snapshot.val();
        res.json(reasons || {});
    } catch (error) {
        res.status(500).send('Error fetching reasons');
    }
});

// API: เพิ่ม Company
app.post('/floors/:floor/companies', async(req, res) => {
    const { floor } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).send('Company name is required');
    }

    try {
        const newCompanyRef = db.ref(`contactOptions/floors/${floor}/${name}`); // ใช้ชื่อบริษัทเป็น key
        await newCompanyRef.set({}); // เพิ่มข้อมูลบริษัทด้วยข้อมูลว่าง
        res.status(201).send('Company added');
    } catch (error) {
        console.error('Error adding company:', error);
        res.status(500).send('Error adding company');
    }
});




// API: เพิ่ม Department
app.post('/companies/:company/departments', async(req, res) => {
    const { company } = req.params;
    const { name } = req.body;
    try {
        const newDepartmentId = `department${Date.now()}`;
        const departmentRef = db.ref(`contactOptions/companies/${company}/departments/${newDepartmentId}`);
        await departmentRef.set({ name });
        res.status(201).send('Department added');
    } catch (error) {
        res.status(500).send('Error adding department');
    }
});

// API: เพิ่ม Contact
app.post('/departments/:department/contacts', async(req, res) => {
    const { department } = req.params;
    const { name } = req.body;
    try {
        const newContactId = `contact${Date.now()}`;
        const contactRef = db.ref(`contactOptions/departments/${department}/contacts/${newContactId}`);
        await contactRef.set({ name });
        res.status(201).send('Contact added');
    } catch (error) {
        res.status(500).send('Error adding contact');
    }
});

// API: เพิ่ม Reason
app.post('/reasons', async(req, res) => {
    const { reason } = req.body;
    try {
        const newReasonId = `reason${Date.now()}`;
        const reasonRef = db.ref(`contactOptions/reasons/${newReasonId}`);
        await reasonRef.set({ reason });
        res.status(201).send('Reason added');
    } catch (error) {
        res.status(500).send('Error adding reason');
    }
});

// API: ลบ Company
app.delete('/companies/:companyId', async(req, res) => {
    const { companyId } = req.params;
    try {
        const companyRef = db.ref(`contactOptions/companies/${companyId}`);
        await companyRef.remove();
        res.status(200).send('Company deleted');
    } catch (error) {
        res.status(500).send('Error deleting company');
    }
});

// API: ลบ Department
app.delete('/departments/:departmentId', async(req, res) => {
    const { departmentId } = req.params;
    try {
        const departmentRef = db.ref(`contactOptions/departments/${departmentId}`);
        await departmentRef.remove();
        res.status(200).send('Department deleted');
    } catch (error) {
        res.status(500).send('Error deleting department');
    }
});

// API: ลบ Contact
app.delete('/contacts/:contactId', async(req, res) => {
    const { contactId } = req.params;
    try {
        const contactRef = db.ref(`contactOptions/contacts/${contactId}`);
        await contactRef.remove();
        res.status(200).send('Contact deleted');
    } catch (error) {
        res.status(500).send('Error deleting contact');
    }
});

// API: ลบ Reason
app.delete('/reasons/:reasonId', async(req, res) => {
    const { reasonId } = req.params;
    try {
        const reasonRef = db.ref(`contactOptions/reasons/${reasonId}`);
        await reasonRef.remove();
        res.status(200).send('Reason deleted');
    } catch (error) {
        res.status(500).send('Error deleting reason');
    }
}); { // visitor
    // Endpoint สำหรับดึงข้อมูล  visitor 
    // ดึงรายชื่อบริษัททั้งหมดจาก floors (ในโครงสร้างที่เรามี)
    app.get('/visitor/companies', async(req, res) => {
        try {
            const companiesRef = db.ref('contactOptions/floors');
            const snapshot = await companiesRef.once('value');
            const floorsData = snapshot.val();
            let companies = [];

            for (const floor in floorsData) {
                for (const company in floorsData[floor]) {
                    companies.push({
                        floor,
                        company
                    });
                }
            }

            res.json(companies);
        } catch (error) {
            res.status(500).send('Error fetching companies');
        }
    });

    // ดึงแผนกตามบริษัทที่เลือก
    app.get('/visitor/companies/:company/departments', async(req, res) => {
        const { company } = req.params;
        try {
            const departmentsRef = db.ref(`contactOptions/companies/${company}/departments`);
            const snapshot = await departmentsRef.once('value');
            const departments = snapshot.val();
            res.json(departments || {});
        } catch (error) {
            res.status(500).send('Error fetching departments');
        }
    });

    // ดึงรายชื่อบุคคลติดต่อจากแผนกที่เลือก
    app.get('/visitor/departments/:department/contacts', async(req, res) => {
        const { department } = req.params;
        try {
            const contactsRef = db.ref(`contactOptions/departments/${department}/contacts`);
            const snapshot = await contactsRef.once('value');
            const contacts = snapshot.val();
            res.json(contacts || {});
        } catch (error) {
            res.status(500).send('Error fetching contacts');
        }
    });

    // เส้นทางสำหรับบันทึกข้อมูล Visitor Register
    app.post('/visitor/register', async(req, res) => {
        const { name, company, department, contact, note } = req.body;
        const date = new Date().toISOString();

        try {
            // หา floor ที่เกี่ยวข้องกับ company ที่เลือก
            const companySnapshot = await db.ref(`contactOptions/floors`).orderByChild(company).once('value');
            const floor = companySnapshot.exists() ? Object.keys(companySnapshot.val())[0] : null;

            const newVisitorRef = push(db.ref('visitors'));
            await newVisitorRef.set({
                name,
                company,
                department,
                contact,
                note,
                floor,
                date,
            });
            res.status(201).send('Visitor registered');
        } catch (error) {
            res.status(500).send('Error registering visitor');
        }
    });


}
// Run Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});