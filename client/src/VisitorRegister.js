import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';

const VisitorRegister = () => {
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [visitorName, setVisitorName] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedContact, setSelectedContact] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [note, setNote] = useState('');
    const [todayVisitors, setTodayVisitors] = useState([]);
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const permitRef = useRef(null);

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

    useEffect(() => {
        const db = getDatabase();
        const companiesRef = ref(db, 'contactOptions/floors');
        onValue(companiesRef, (snapshot) => {
            const companiesData = snapshot.val();
            if (companiesData) {
                const companiesList = [];
                Object.keys(companiesData).forEach(floor => {
                    Object.keys(companiesData[floor]).forEach(company => {
                        companiesList.push({ name: company, floor });
                    });
                });
                setCompanies(companiesList);
            }
        });

        const reasonsRef = ref(db, 'contactOptions/reasons');
        onValue(reasonsRef, (snapshot) => {
            const reasonsData = snapshot.val();
            if (reasonsData) {
                const reasonsList = Object.values(reasonsData).map(item => item.reason);
                setReasons(reasonsList);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            const db = getDatabase();
            const departmentsRef = ref(db, `contactOptions/floors/${selectedCompany.floor}/${selectedCompany.name}/departments`);
            onValue(departmentsRef, (snapshot) => {
                const departmentsData = snapshot.val();
                setDepartments(departmentsData ? Object.keys(departmentsData) : []);
                setContacts([]);
            });
        }
    }, [selectedCompany]);

    useEffect(() => {
        if (selectedDepartment) {
            const db = getDatabase();
            const contactsRef = ref(db, `contactOptions/floors/${selectedCompany.floor}/${selectedCompany.name}/departments/${selectedDepartment}`);
            onValue(contactsRef, (snapshot) => {
                const contactsData = snapshot.val();
                setContacts(contactsData ? Object.values(contactsData).map(contact => contact.name) : []);
            });
        }
    }, [selectedDepartment, selectedCompany]);

    useEffect(() => {
        const db = getDatabase();
        const visitorsRef = ref(db, 'visitorRegisters');
        onValue(visitorsRef, (snapshot) => {
            const visitorsData = snapshot.val();
            if (visitorsData) {
                const today = [];
                Object.keys(visitorsData).forEach(key => {
                    const visitor = visitorsData[key];
                    if (visitor.date === formattedDate) {
                        today.push(visitor);
                    }
                });
                setTodayVisitors(today);
            }
        });
    }, [formattedDate]);

    const handleRegister = () => {
        const db = getDatabase();
        const registerRef = ref(db, 'visitorRegisters');
        const newRegisterRef = push(registerRef);

        const currentTime = new Date();
        const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;

        const newVisitor = {
            name: visitorName,
            company: selectedCompany.name,
            department: selectedDepartment,
            contact: selectedContact,
            reason: selectedReason,
            note: note,
            date: formattedDate,
            time: formattedTime,
            floor: selectedCompany.floor,
        };

        set(newRegisterRef, newVisitor)
            .then(() => {
                alert('Registration Successful!');
                setVisitorName('');
                setSelectedCompany('');
                setSelectedDepartment('');
                setSelectedContact('');
                setSelectedReason('');
                setNote('');
            })
            .catch((error) => {
                console.error('Error writing new visitor data: ', error);
            });
    };

    const handlePrint = (visitor) => {
        setSelectedVisitor(visitor);
    };

    const printPermit = () => {
        const printContents = permitRef.current.innerHTML;
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';

        // เพิ่ม iframe ลงใน body
        document.body.appendChild(iframe);

        // เขียนเนื้อหาใน iframe
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
                <head>
                    <style>
                        /* กำหนดขนาดใบเสร็จ */
                        @page {
                            size: 80mm 200mm; /* ขนาดของใบเสร็จประมาณ 80mm x 200mm */
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100%;
                            font-family: Arial, sans-serif;
                        }
                        .permit {
                            width: 100%;
                            max-width: 100%;
                            padding: 10px;
                            border: 1px solid #000;
                            box-sizing: border-box;
                            text-align: center;
                        }
                        /* กำหนดรูปแบบข้อความ */
                        .permit h3 {
                            margin: 0;
                            font-size: 16px;
                        }
                        .permit p {
                            margin: 5px 0;
                            font-size: 14px;
                        }
                        .permit .qr-code {
                            margin-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="permit">${printContents}</div>
                </body>
            </html>
        `);
        doc.close();

        // รอให้ iframe โหลดเสร็จแล้วพิมพ์
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // ลบ iframe หลังจากพิมพ์เสร็จ
        document.body.removeChild(iframe);
    };



    return ( < div >
        <
        h2 > Visitor Registration < /h2> <
        form onSubmit = {
            (e) => { e.preventDefault();
                handleRegister(); } } >
        <
        label >
        Name:
        <
        input type = "text"
        value = { visitorName }
        onChange = {
            (e) => setVisitorName(e.target.value) }
        required /
        >
        <
        /label> <
        label >
        Company:
        <
        select value = { selectedCompany.name }
        onChange = {
            (e) => {
                const company = companies.find(comp => comp.name === e.target.value);
                setSelectedCompany(company || '');
            }
        }
        required >
        <
        option value = "" > Select Company < /option> {
            companies.map((company, index) => ( <
                option key = { index }
                value = { company.name } > { company.name } < /option>
            ))
        } <
        /select> <
        /label> <
        label >
        Department(Optional):
        <
        select value = { selectedDepartment }
        onChange = {
            (e) => setSelectedDepartment(e.target.value) } >
        <
        option value = "" > Select Department < /option> {
            departments.map((department, index) => ( <
                option key = { index }
                value = { department } > { department } < /option>
            ))
        } <
        /select> <
        /label> <
        label >
        Contact(Optional):
        <
        select value = { selectedContact }
        onChange = {
            (e) => setSelectedContact(e.target.value) } >
        <
        option value = "" > Select Contact < /option> {
            contacts.map((contact, index) => ( <
                option key = { index }
                value = { contact } > { contact } < /option>
            ))
        } <
        /select> <
        /label> <
        label >
        Reason:
        <
        select value = { selectedReason }
        onChange = {
            (e) => setSelectedReason(e.target.value) }
        required >
        <
        option value = "" > Select Reason < /option> {
            reasons.map((reason, index) => ( <
                option key = { index }
                value = { reason } > { reason } < /option>
            ))
        } <
        /select> <
        /label> <
        label >
        Note(Optional):
        <
        textarea value = { note }
        onChange = {
            (e) => setNote(e.target.value) }
        /> <
        /label> <
        button type = "submit" > Register < /button> <
        /form>

        <
        h3 > Visitors Registered Today < /h3> <
        table border = "1"
        style = {
            { width: '100%', borderCollapse: 'collapse' } } >
        <
        thead >
        <
        tr >
        <
        th > Name < /th> <
        th > Company < /th> <
        th > Department < /th> <
        th > Contact < /th> <
        th > Reason < /th> <
        th > Note < /th> <
        th > Date < /th> <
        th > Time < /th> <
        th > Floor < /th> <
        th > Actions < /th> <
        /tr> <
        /thead> <
        tbody > {
            todayVisitors.map((visitor, index) => ( <
                tr key = { index } >
                <
                td > { visitor.name } < /td> <
                td > { visitor.company } < /td> <
                td > { visitor.department } < /td> <
                td > { visitor.contact } < /td> <
                td > { visitor.reason } < /td> <
                td > { visitor.note } < /td> <
                td > { visitor.date } < /td> <
                td > { visitor.time } < /td> <
                td > { visitor.floor } < /td> <
                td >
                <
                button onClick = {
                    () => handlePrint(visitor) } > Print < /button> <
                /td> <
                /tr>
            ))
        } <
        /tbody> <
        /table>

        {
            selectedVisitor && ( <
                div style = {
                    { marginTop: '10px', textAlign: 'center' } }
                ref = { permitRef }
                className = "permit" >
                <
                h3 > Visitor Permit < /h3> <
                p > < strong > Name: < /strong> {selectedVisitor.name}</p >
                <
                p > < strong > Company: < /strong> {selectedVisitor.company}</p >
                <
                p > < strong > Department: < /strong> {selectedVisitor.department}</p >
                <
                p > < strong > Contact: < /strong> {selectedVisitor.contact}</p >
                <
                p > < strong > Reason: < /strong> {selectedVisitor.reason}</p >
                <
                p > < strong > Note: < /strong> {selectedVisitor.note}</p >
                <
                p > < strong > Date: < /strong> {selectedVisitor.date}</p >
                <
                p > < strong > Time: < /strong> {selectedVisitor.time}</p >
                <
                p > < strong > Floor: < /strong> {selectedVisitor.floor}</p >
                <
                div className = "qr-code" >
                <
                QRCodeSVG value = { `${selectedVisitor.name}, ${selectedVisitor.date}, ${selectedVisitor.floor}` }
                size = { 128 }
                includeMargin = { true }
                /> <
                /div> <
                /div>
            )
        }

        {
            selectedVisitor && ( <
                div style = {
                    { marginTop: '10px', textAlign: 'center' } } >
                <
                button onClick = { printPermit } > Print Permit < /button> <
                /div>
            )
        } <
        /div>
    )
};

export default VisitorRegister;