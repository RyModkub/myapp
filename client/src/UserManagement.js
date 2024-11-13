import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // URL ของเซิร์ฟเวอร์ของคุณ

const VisitorRegister = () => {
        const [visitors, setVisitors] = useState([]);
        const [name, setName] = useState('');
        const [company, setCompany] = useState('');
        const [floor, setFloor] = useState('');
        const [department, setDepartment] = useState('');
        const [contact, setContact] = useState('');
        const [reason, setReason] = useState('');
        const [note, setNote] = useState('');
        const [date, setDate] = useState(new Date().toISOString());
        const [error, setError] = useState('');

        useEffect(() => {
            fetchVisitors(); // ดึงข้อมูลผู้เยี่ยมชมจาก API เมื่อ component โหลด
        }, []);

        const fetchVisitors = async() => {
            try {
                const response = await axios.get(`${API_URL}/visitors`);
                setVisitors(response.data);
            } catch (error) {
                console.error('Error fetching visitors:', error);
            }
        };

        const handleRegister = async() => {
            // ตรวจสอบค่าที่กรอกแล้วส่งไปที่ API
            if (!name || !company || !floor || !department || !contact) {
                setError('Please fill in all the required fields!');
                return;
            }

            try {
                const visitorData = {
                    name,
                    company,
                    floor,
                    department,
                    contact,
                    reason: reason || '-', // ถ้าไม่กรอกเหตุผลให้ใส่ '-'
                    note: note || '-', // ถ้าไม่กรอกโน้ตให้ใส่ '-'
                    date,
                };

                await axios.post(`${API_URL}/visitors`, visitorData);
                fetchVisitors(); // รีเฟรชรายการผู้เยี่ยมชมหลังจากบันทึกสำเร็จ
                setName('');
                setCompany('');
                setFloor('');
                setDepartment('');
                setContact('');
                setReason('');
                setNote('');
                setError('');
                alert('Visitor registered successfully!');
            } catch (error) {
                console.error('Error registering visitor:', error);
                setError('Failed to register visitor!');
            }
        };

        return ( <
            div >
            <
            h1 > Visitor Register < /h1> {
                error && < p style = {
                        { color: 'red' } } > { error } < /p>} <
                    input
                type = "text"
                placeholder = "Name"
                value = { name }
                onChange = {
                    (e) => setName(e.target.value) }
                /> <
                input
                type = "text"
                placeholder = "Company"
                value = { company }
                onChange = {
                    (e) => setCompany(e.target.value) }
                /> <
                input
                type = "text"
                placeholder = "Floor"
                value = { floor }
                onChange = {
                    (e) => setFloor(e.target.value) }
                /> <
                input
                type = "text"
                placeholder = "Department"
                value = { department }
                onChange = {
                    (e) => setDepartment(e.target.value) }
                /> <
                input
                type = "text"
                placeholder = "Contact"
                value = { contact }
                onChange = {
                    (e) => setContact(e.target.value) }
                /> <
                input
                type = "text"
                placeholder = "Reason"
                value = { reason }
                onChange = {
                    (e) => setReason(e.target.value) }
                /> <
                input
                type = "text"
                placeholder = "Note"
                value = { note }
                onChange = {
                    (e) => setNote(e.target.value) }
                /> <
                button onClick = { handleRegister } > Register < /button>

                <
                h2 > Today 's Visitors</h2> <
                    ul > {
                        visitors.map(visitor => ( <
                            li key = { visitor.id } > { visitor.name } - { visitor.company } - { visitor.department } <
                            /li>
                        ))
                    } <
                    /ul> <
                    /div>
            );
        };

        export default VisitorRegister;