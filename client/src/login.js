import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig'; // นำเข้า auth จากไฟล์ firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth';

const API_URL = 'http://localhost:5000';

const Login = () => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const navigate = useNavigate();

        const handleLogin = async() => {
            try {
                // ล็อกอินด้วยอีเมลและรหัสผ่าน
                const userCredential = await signInWithEmailAndPassword(auth, username, password);

                // ดึง ID token ของผู้ใช้หลังจากเข้าสู่ระบบสำเร็จ
                const idToken = await userCredential.user.getIdToken();

                // ส่ง ID token ไปยังเซิร์ฟเวอร์เพื่อยืนยัน
                const response = await axios.post(`${API_URL}/login`, { idToken });
                console.log(response.data);

                // หากล็อกอินสำเร็จ จะไปที่หน้า dashboard
                navigate('/dashboard');
            } catch (err) {
                if (err.response) {
                    setError(err.response.data.error || 'Login failed.');
                } else {
                    setError(`Error: ${err.message}`);
                }
            }
        };

        return ( <
            div >
            <
            h1 > Login < /h1> <
            input type = "text"
            placeholder = "Email"
            value = { username }
            onChange = {
                (e) => setUsername(e.target.value) }
            /> <
            input type = "password"
            placeholder = "Password"
            value = { password }
            onChange = {
                (e) => setPassword(e.target.value) }
            /> <
            button onClick = { handleLogin } > Login < /button> {
                error && < p style = {
                        { color: 'red' } } > { error } < /p>} <
                    /div>
            );
        };

        export default Login;