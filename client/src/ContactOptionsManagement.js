import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, remove, update } from 'firebase/database';
import { app } from './firebaseConfig'; // เชื่อมต่อ Firebase App

const ContactOptionsManagement = () => {
    const [floors, setFloors] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState('');
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [contacts, setContacts] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [newReason, setNewReason] = useState('');
    const db = getDatabase(app); // ใช้ Firebase Realtime Database

    useEffect(() => {
        fetchFloors();
        fetchReasons();
    }, []);

    // ฟังก์ชันในการดึงข้อมูล Floors
    const fetchFloors = async() => {
        try {
            const floorRef = ref(db, 'contactOptions/floors');
            const snapshot = await get(floorRef);
            if (snapshot.exists()) {
                setFloors(Object.keys(snapshot.val() || {}));
            } else {
                console.log("No data available");
            }
        } catch (error) {
            console.error('Error fetching floors:', error);
        }
    };

    // ฟังก์ชันในการดึงข้อมูล Companies ตาม floor ที่เลือก
    const fetchCompanies = async(floor) => {
        setSelectedFloor(floor); // ตั้งค่า selectedFloor
        setCompanies([]); // รีเซ็ตบริษัท
        setDepartments([]); // รีเซ็ตแผนก
        setContacts([]); // รีเซ็ต contacts
        if (floor === '') return; // หากไม่ได้เลือก floor ให้ return ไป

        try {
            // ดึงข้อมูลจาก AIS หรือ TRUE ที่อยู่ใน floors/{floor}
            const companyRef = ref(db, `contactOptions/floors/${floor}`);
            const snapshot = await get(companyRef);

            if (snapshot.exists()) {
                // ใช้ Object.keys เพื่อดึงชื่อบริษัทที่มีใน floor
                const companiesData = Object.keys(snapshot.val()).map(company => ({
                    id: company,
                    name: company // ใช้ชื่อบริษัทตรงนี้ (AIS, TRUE)
                }));
                setCompanies(companiesData);
            } else {
                setCompanies([]); // ไม่มีบริษัทใน floor นี้
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };


    // ฟังก์ชันในการดึงข้อมูล Departments ตาม company ที่เลือก
    const fetchDepartments = async(company) => {
        setSelectedCompany(company);
        setDepartments([]); // รีเซ็ตแผนก
        setContacts([]); // รีเซ็ตรายชื่อผู้ติดต่อ
        if (company === '') return; // ถ้าไม่มีการเลือกบริษัท ออกจากฟังก์ชัน

        try {
            // ดึงข้อมูลแผนกจาก Firebase
            const departmentRef = ref(db, `contactOptions/floors/${selectedFloor}/${company}/departments`);
            const snapshot = await get(departmentRef);

            if (snapshot.exists()) {
                // แปลงคีย์ของแผนก (เช่น HR, IT) เป็นข้อมูลแผนก
                const departmentsData = Object.keys(snapshot.val()).map(departmentKey => ({
                    id: departmentKey, // ใช้คีย์ของแผนกเป็น ID
                    name: departmentKey // ใช้คีย์ของแผนกเป็นชื่อ
                }));
                setDepartments(departmentsData);
            } else {
                setDepartments([]); // ไม่มีแผนก
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };




    // ฟังก์ชันในการดึงข้อมูล Contacts ตาม department ที่เลือก
    const fetchContacts = async(department) => {
        setSelectedDepartment(department);
        console.log('Fetching contacts for:', department, selectedFloor, selectedCompany);

        try {
            // ใช้ path ที่เหมาะสมกับโครงสร้างใน Firebase
            const contactRef = ref(db, `contactOptions/floors/${selectedFloor}/${selectedCompany}/departments/${department}/contacts`);
            console.log('Contact Ref:', contactRef.toString()); // ตรวจสอบ path

            const snapshot = await get(contactRef);

            if (snapshot.exists()) {
                const contactData = snapshot.val(); // จะได้ข้อมูลทั้งหมดใน contacts

                // แปลงข้อมูล contactData ให้อยู่ในรูปแบบของ list
                const contactsList = Object.entries(contactData).map(([contactId, contactDetails]) => ({
                    id: contactId,
                    name: contactDetails.name // ดึงค่า name จากแต่ละ contact
                }));

                console.log('Contacts found:', contactsList);
                setContacts(contactsList); // แสดงผลใน contacts
            } else {
                console.log('No contacts found.');
                setContacts([]); // ไม่มีข้อมูล
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };




    // ฟังก์ชันในการดึงข้อมูล Reasons
    const fetchReasons = async() => {
        try {
            const reasonsRef = ref(db, 'contactOptions/reasons');
            const snapshot = await get(reasonsRef);
            if (snapshot.exists()) {
                setReasons(Object.entries(snapshot.val() || {}).map(([id, data]) => ({ id, ...data })));
            }
        } catch (error) {
            console.error('Error fetching reasons:', error);
        }
    };
    const handleSelectFloor = (event) => {
        const selectedFloor = event.target.value;
        setSelectedFloor(selectedFloor);
        setCompanies([]); // รีเซ็ตบริษัท
        setDepartments([]); // รีเซ็ตแผนก
        setContacts([]); // รีเซ็ต contacts
        fetchCompanies(selectedFloor); // ดึงข้อมูลใหม่เมื่อเลือก floor
    };

    // ฟังก์ชันการเพิ่มข้อมูล (Company, Department, Contact, Reason)

    // ฟังก์ชันเพิ่มบริษัทใหม่
    const handleAddCompany = async() => {
        if (!selectedFloor) {
            alert("Please select a floor before adding a company.");
            return;
        }

        const newCompanyName = prompt("Please provide a name for the company:");
        if (!newCompanyName || newCompanyName.trim() === "") {
            alert("Please provide a valid name for the company.");
            return;
        }

        try {
            // เพิ่มบริษัทใหม่
            const newCompanyRef = ref(db, `contactOptions/floors/${selectedFloor}/${newCompanyName.trim()}`);
            await set(newCompanyRef, { name: newCompanyName.trim() }); // เพิ่มชื่อบริษัท
            fetchCompanies(selectedFloor); // อัพเดตบริษัทในชั้นที่เลือก
        } catch (error) {
            console.error('Error adding company:', error);
        }
    };




    // ฟังก์ชันเพิ่มแผนกใหม่
    const handleAddDepartment = async() => {
        if (!selectedCompany || !selectedFloor) {
            alert("Please select a company and floor before adding a department.");
            return;
        }

        const newDepartmentName = prompt("Please provide a name for the department:");
        if (!newDepartmentName) {
            alert("Please provide a name for the department.");
            return;
        }

        try {
            // เพิ่มแผนกใหม่
            const newDepartmentRef = ref(db, `contactOptions/floors/${selectedFloor}/${selectedCompany}/departments/${newDepartmentName}`);
            await set(newDepartmentRef, { name: newDepartmentName });
            fetchDepartments(selectedCompany); // อัพเดตแผนกในบริษัท
        } catch (error) {
            console.error('Error adding department:', error);
        }
    };




    // ฟังก์ชันเพิ่มผู้ติดต่อใหม่
    const handleAddContact = async() => {
        if (!selectedDepartment || !selectedCompany || !selectedFloor) {
            alert("Please select a floor, company, and department before adding a contact.");
            return;
        }

        const newContactName = prompt("Please provide a name for the contact:");
        if (!newContactName) {
            alert("Please provide a name for the contact.");
            return;
        }

        try {
            // เพิ่มผู้ติดต่อใหม่
            const newContactRef = ref(db, `contactOptions/floors/${selectedFloor}/${selectedCompany}/departments/${selectedDepartment}/contacts/${newContactName}`);
            await set(newContactRef, { name: newContactName });
            fetchContacts(selectedDepartment); // อัพเดตผู้ติดต่อในแผนก
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };



    const handleAddReason = async() => {
        const reason = prompt("Please enter the reason for the action:");
        if (!reason) {
            alert("Reason is required to proceed.");
            return;
        }

        try {
            // เพิ่มเหตุผลใน Firebase หรือฐานข้อมูลที่ต้องการ
            const newReasonRef = ref(db, `reasons/${reason}`);
            await set(newReasonRef, { reason: reason });
            alert("Reason added successfully!");
        } catch (error) {
            console.error('Error adding reason:', error);
        }
    };



    // ฟังก์ชันลบบริษัท
    const handleDeleteCompany = async(companyId) => {
        try {
            await remove(ref(db, `contactOptions/floors/${selectedFloor}/${companyId}`));
            fetchCompanies(selectedFloor); // อัพเดตบริษัท
        } catch (error) {
            console.error('Error deleting company:', error);
        }
    };


    // ฟังก์ชันลบแผนก
    const handleDeleteDepartment = async(departmentId) => {
        try {
            await remove(ref(db, `contactOptions/floors/${selectedFloor}/${selectedCompany}/departments/${departmentId}`));
            fetchDepartments(selectedCompany); // อัพเดตแผนก
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    };


    // ฟังก์ชันลบผู้ติดต่อ
    const handleDeleteContact = async(contactId) => {
        try {
            await remove(ref(db, `contactOptions/floors/${selectedFloor}/${selectedCompany}/departments/${selectedDepartment}/contacts/${contactId}`));
            fetchContacts(selectedDepartment); // อัพเดตผู้ติดต่อ
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };


    const handleDeleteReason = async(reasonId) => {
        try {
            // ลบข้อมูลจาก Firebase ที่ path ของ 'reasonId'
            await remove(ref(db, `contactOptions/reasons/${reasonId}`));
            // รีเฟรชการดึงข้อมูล reasons ใหม่หลังลบ
            fetchReasons();
        } catch (error) {
            console.error('Error deleting reason:', error);
        }
    };
    // ฟังก์ชันแก้ไขบริษัท
    const handleEditCompany = async(companyId, newName) => {
        try {
            const companyRef = ref(db, `contactOptions/floors/${selectedFloor}/${companyId}`);
            await update(companyRef, { name: newName });
            fetchCompanies(selectedFloor); // อัพเดตบริษัท
        } catch (error) {
            console.error('Error editing company:', error);
        }
    };


    // ฟังก์ชันแก้ไขแผนก
    const handleEditDepartment = async(departmentId, newName) => {
        try {
            const departmentRef = ref(db, `contactOptions/floors/${selectedFloor}/${selectedCompany}/departments/${departmentId}`);
            await update(departmentRef, { name: newName });
            fetchDepartments(selectedCompany); // อัพเดตแผนก
        } catch (error) {
            console.error('Error editing department:', error);
        }
    };


    // ฟังก์ชันแก้ไขผู้ติดต่อ
    const handleEditContact = async(contactId, newName) => {
        try {
            const contactRef = ref(db, `contactOptions/floors/${selectedFloor}/${selectedCompany}/departments/${selectedDepartment}/contacts/${contactId}`);
            await update(contactRef, { name: newName });
            fetchContacts(selectedDepartment); // อัพเดตผู้ติดต่อ
        } catch (error) {
            console.error('Error editing contact:', error);
        }
    };

    // ฟังก์ชันสำหรับการแก้ไขข้อมูล
    const handleEditReason = async(id, newReasonName) => {
        // ตรวจสอบว่า newReasonName มีการเปลี่ยนแปลงก่อนหรือไม่
        if (newReasonName && newReasonName !== '') { // ถ้ามีการเปลี่ยนแปลง
            try {
                const reasonRef = ref(db, `contactOptions/reasons/${id}`);
                await update(reasonRef, { reason: newReasonName });
                fetchReasons(); // รีเฟรชข้อมูล
            } catch (error) {
                console.error('Error editing reason:', error);
            }
        } else {
            console.log('Edit canceled or no changes made');
        }
    };


    return ( <
        div >
        <
        h1 > Contact Options Management < /h1>

        <
        h2 > Companies on { selectedFloor } < /h2> <
        select onChange = { handleSelectFloor } >
        <
        option value = "" > Select a floor < /option> {
            floors.map(floor => ( <
                option key = { floor }
                value = { floor } > { floor } < /option>
            ))
        } <
        /select>

        <
        div style = {
            { marginTop: "10px" } } >
        <
        button onClick = { handleAddCompany } > Add Company < /button> <
        /div>

        {
            selectedFloor && companies.length === 0 ? ( <
                p > No companies available on this floor. < /p>
            ) : ( <
                ul > {
                    companies.map(company => ( <
                        li key = { company.id } > { company.name } <
                        button onClick = {
                            () => fetchDepartments(company.id) } > View Departments < /button> <
                        button onClick = {
                            () => handleEditCompany(company.id, prompt("Edit company name:", company.name)) } > Edit < /button> <
                        button onClick = {
                            () => handleDeleteCompany(company.id) } > Delete < /button>        <
                        /li>
                    ))
                } <
                /ul>
            )
        }




        <
        h2 > Departments in { selectedCompany } < /h2> <
        button onClick = {
            () => handleAddDepartment() } > Add Department < /button> <
        ul > {
            departments.length > 0 ? (
                departments.map(department => ( <
                    li key = { department.id } > { department.name } { /* แสดงชื่อแผนก */ } <
                    button onClick = {
                        () => fetchContacts(department.id) } > View Contacts < /button> <
                    button onClick = {
                        () => handleEditDepartment(department.id, prompt("Edit department name:", department.name)) } > Edit < /button> <
                    button onClick = {
                        () => handleDeleteDepartment(department.id) } > Delete < /button>             <
                    /li>
                ))
            ) : ( <
                p > No departments available. < /p>
            )
        } <
        /ul>




        <
        h2 > Contacts in { selectedDepartment } < /h2> <
        button onClick = {
            () => handleAddContact() } > Add Contact < /button> <
        ul > {
            contacts.map(contact => ( <
                li key = { contact.id } > { contact.name } <
                button onClick = {
                    () => handleDeleteContact(contact.id) } > Delete < /button> <
                button onClick = {
                    () => handleEditContact(contact.id, prompt("Edit contact name:", contact.name)) } > Edit < /button> <
                /li>
            ))
        } <
        /ul>


        <
        h2 > Reasons
        for Contact < /h2>         <
        button onClick = { handleAddReason } > Add Reason < /button> <
        ul > {
            reasons.map(reason => ( <
                li key = { reason.id } > { reason.reason } <
                button onClick = {
                    () => handleEditReason(reason.id, prompt('Edit Reason:', reason.reason)) } > Edit < /button> <
                button onClick = {
                    () => handleDeleteReason('reasons', reason.id) } > Delete < /button> <
                /li>
            ))
        } <
        /ul> <
        /div>
    );
};

export default ContactOptionsManagement;