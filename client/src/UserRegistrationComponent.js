import React, { useState } from 'react';
import axios from 'axios';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { db } from './firebaseConfig'; // ปรับให้ตรงกับที่ตั้งไฟล์ firebaseConfig ของคุณ

const UserRegistrationComponent = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [role, setRole] = useState('staff');
        const [error, setError] = useState('');

        const handleRegister = async(e) => {
            e.preventDefault();
            const auth = getAuth();

            try {
                // สร้างผู้ใช้ใน Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // เพิ่มข้อมูลของผู้ใช้ลงใน Realtime Database
                const userRef = ref(db, `users/${user.uid}`);
                await set(userRef, { email, role });

                // เคลียร์ข้อมูลหลังจากลงทะเบียนสำเร็จ
                setEmail('');
                setPassword('');
                setRole('staff');
                setError('');
                alert('User registered successfully!');
            } catch (error) {
                console.error('Error registering user:', error);
                setError('Registration failed. Please try again.');
            }
        };

        return ( <
            div >
            <
            h1 > Register New User < /h1> <
            form onSubmit = { handleRegister } >
            <
            input type = "email"
            placeholder = "Email"
            value = { email }
            onChange = {
                (e) => setEmail(e.target.value) }
            required /
            >
            <
            input type = "password"
            placeholder = "Password"
            value = { password }
            onChange = {
                (e) => setPassword(e.target.value) }
            required /
            >
            <
            select value = { role }
            onChange = {
                (e) => setRole(e.target.value) } >
            <
            option value = "admin" > Admin < /option> <
            option value = "staff" > Staff < /option> <
            /select> <
            button type = "submit" > Register < /button> <
            /form> {
                error && < p > { error } < /p>} <
                    /div>
            );
        };

        export default UserRegistrationComponent;