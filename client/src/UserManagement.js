import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // เปลี่ยนเป็น URL ของเซิร์ฟเวอร์ของคุณ

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('staff');
    const [editUserId, setEditUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async() => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            // ตรวจสอบว่าข้อมูลที่ได้รับเป็น object หรือ array
            const data = response.data;
            // แปลง object เป็น array
            const userArray = Object.keys(data).map(key => ({ uid: key, ...data[key] }));
            setUsers(userArray);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const addUser = async() => {
        try {
            await axios.post(`${API_URL}/register`, { email, password, role });
            fetchUsers(); // Refresh user list
            setEmail('');
            setPassword('');
            setRole('staff');
            alert('User registered successfully!');
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const deleteUser = async(uid) => {
        try {
            await axios.delete(`${API_URL}/users/${uid}`);
            fetchUsers(); // Refresh user list
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const editUser = (user) => {
        setEditUserId(user.uid);
        setEmail(user.email);
        setRole(user.role);
    };

    const updateUser = async() => {
        try {
            await axios.put(`${API_URL}/users/${editUserId}`, { password, role });
            fetchUsers(); // Refresh user list
            setEditUserId(null);
            setEmail('');
            setPassword('');
            setRole('staff');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return ( <
        div >
        <
        h1 > User Management < /h1> <
        input type = "email"
        placeholder = "Email"
        value = { email }
        onChange = {
            (e) => setEmail(e.target.value) }
        /> <
        input type = "password"
        placeholder = "Password"
        value = { password }
        onChange = {
            (e) => setPassword(e.target.value) }
        /> <
        select value = { role }
        onChange = {
            (e) => setRole(e.target.value) } >
        <
        option value = "admin" > Admin < /option> <
        option value = "staff" > Staff < /option> <
        /select>

        {
            editUserId ? ( <
                button onClick = { updateUser } > Update User < /button>
            ) : ( <
                button onClick = { addUser } > Add User < /button>
            )
        }

        <
        h2 > User List < /h2> <
        ul > {
            users.map(user => ( <
                li key = { user.uid } > { user.email }({ user.role }) <
                button onClick = {
                    () => editUser(user) } > Edit < /button> <
                button onClick = {
                    () => deleteUser(user.uid) } > Delete < /button> <
                /li>
            ))
        } <
        /ul> <
        /div>
    );
};

export default UserManagement;