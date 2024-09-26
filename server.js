const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase, set, push, get, update, remove } = require('firebase-admin/database');

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
// Fetch Departments Route
app.get('/departments', async(req, res) => {
    try {
        const departmentsRef = db.ref('contactOptions/departments');
        const snapshot = await departmentsRef.once('value');
        if (snapshot.exists()) {
            res.status(200).send(snapshot.val());
        } else {
            res.status(404).send({ error: 'No departments found' });
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).send({ error: 'Failed to fetch departments' });
    }
});

// Fetch Reasons Route
app.get('/reasons', async(req, res) => {
    try {
        const reasonsRef = db.ref('contactOptions/reasons');
        const snapshot = await reasonsRef.once('value');
        if (snapshot.exists()) {
            res.status(200).send(snapshot.val());
        } else {
            res.status(404).send({ error: 'No reasons found' });
        }
    } catch (error) {
        console.error('Error fetching reasons:', error);
        res.status(500).send({ error: 'Failed to fetch reasons' });
    }
});

// Add Department Route
app.post('/contactOptions/departments', async(req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Department name is required' });

    try {
        const newDepartmentRef = db.ref(`contactOptions/departments/${name}`);
        await set(newDepartmentRef, { contacts: [] });
        res.json({ success: true, message: 'Department added successfully' });
    } catch (error) {
        console.error('Error adding department:', error);
        res.status(500).json({ success: false, error: 'Failed to add department' });
    }
});

// Add Contact Route
app.post('/contactOptions/departments/:department/contacts', async(req, res) => {
    const { department } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Contact name is required' });

    try {
        const contactsRef = db.ref(`contactOptions/departments/${department}/contacts`);
        const newContactRef = push(contactsRef);
        await set(newContactRef, { name });
        res.json({ success: true, message: 'Contact added successfully' });
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ success: false, error: 'Failed to add contact' });
    }
});

// Fetch Reasons Route


app.put('/contactOptions/departments/:oldName', async(req, res) => {
    const { oldName } = req.params;
    const { newName } = req.body;

    if (!newName) return res.status(400).json({ success: false, error: 'New department name is required' });

    try {
        const oldRef = ref(db, `contactOptions/departments/${oldName}`);
        const newRef = ref(db, `contactOptions/departments/${newName}`);

        // Get the existing department data
        const snapshot = await get(oldRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Create the new department with the old data and remove the old department
            await set(newRef, data);
            await remove(oldRef);
            res.json({ success: true, message: 'Department updated successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Department not found' });
        }
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ success: false, error: 'Failed to update department' });
    }
});

app.delete('/departments/:name', async(req, res) => {
    const { name } = req.params;

    try {
        const departmentRef = ref(db, `contactOptions/departments/${name}`);
        await remove(departmentRef);
        res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ success: false, error: 'Failed to delete department' });
    }
});

app.put('/departments/:department/contacts/:contactId', async(req, res) => {
    const { department, contactId } = req.params;
    const { newName } = req.body;

    if (!newName) return res.status(400).json({ success: false, error: 'New contact name is required' });

    try {
        const contactRef = ref(db, `contactOptions/departments/${department}/contacts/${contactId}`);
        await update(contactRef, { name: newName });
        res.json({ success: true, message: 'Contact updated successfully' });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ success: false, error: 'Failed to update contact' });
    }
});

app.delete('/departments/:department/contacts/:contactId', async(req, res) => {
    const { department, contactId } = req.params;

    try {
        const contactRef = ref(db, `contactOptions/departments/${department}/contacts/${contactId}`);
        await remove(contactRef);
        res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ success: false, error: 'Failed to delete contact' });
    }
});

app.delete('/reasons/:reasonId', async(req, res) => {
    const { reasonId } = req.params;

    try {
        const reasonRef = ref(db, `contactOptions/reasons/${reasonId}`);
        await remove(reasonRef);
        res.json({ success: true, message: 'Reason deleted successfully' });
    } catch (error) {
        console.error('Error deleting reason:', error);
        res.status(500).json({ success: false, error: 'Failed to delete reason' });
    }
});

// Add Reason Route
app.post('/reasons', async(req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, error: 'Reason is required' });

    try {
        const reasonsRef = db.ref('contactOptions/reasons');
        const newReasonRef = push(reasonsRef);
        await set(newReasonRef, { reason });
        res.json({ success: true, message: 'Reason added successfully' });
    } catch (error) {
        console.error('Error adding reason:', error);
        res.status(500).json({ success: false, error: 'Failed to add reason' });
    }
});

// Run Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});