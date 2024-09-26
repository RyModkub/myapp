import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust to your API URL

const ContactOptionsManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [newDepartment, setNewDepartment] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [newContact, setNewContact] = useState('');
    const [reasons, setReasons] = useState([]);
    const [newReason, setNewReason] = useState('');

    useEffect(() => {
        fetchDepartments();
        fetchReasons();
    }, []);

    const fetchDepartments = async() => {
        try {
            const response = await axios.get(`${API_URL}/departments`);
            const data = response.data;

            // Check if the data is an object and transform it into an array
            const departmentsArray = Object.keys(data).map(department => ({
                name: department,
                contacts: Object.keys(data[department].contacts || {}).map(contactId => ({
                    id: contactId,
                    name: data[department].contacts[contactId].name
                }))
            }));
            setDepartments(departmentsArray);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    // Fetch Reasons
    const fetchReasons = async() => {
        try {
            const response = await axios.get(`${API_URL}/reasons`);
            const data = response.data;

            // Convert object to array if necessary (if reasons are stored as key-value pairs)
            const reasonsArray = Array.isArray(data) ? data : Object.keys(data).map(key => data[key]);

            setReasons(reasonsArray);
        } catch (error) {
            console.error('Error fetching reasons:', error);
        }
    };

    const addDepartment = async() => {
        if (!newDepartment) return alert('Please enter a department name.');
        try {
            await axios.post(`${API_URL}/contactOptions/departments`, { name: newDepartment });
            setNewDepartment(''); // Reset input field
            fetchDepartments(); // Refresh the list of departments
        } catch (error) {
            console.error('Error adding department:', error);
        }
    };

    const addContact = async() => {
        if (!selectedDepartment || !newContact) {
            return alert('Please select a department and enter a contact name.');
        }
        try {
            await axios.post(`${API_URL}/contactOptions/departments/${selectedDepartment}/contacts`, { name: newContact });
            setNewContact(''); // Reset input field
            fetchDepartments(); // Refresh the list of departments
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    const updateDepartment = async(oldName, newName) => {
        try {
            await axios.put(`${API_URL}/departments/${oldName}`, { newName });
            fetchDepartments();
        } catch (error) {
            console.error('Error updating department:', error);
        }
    };

    const deleteDepartment = async(name) => {
        try {
            await axios.delete(`${API_URL}/departments/${name}`);
            fetchDepartments();
        } catch (error) {
            console.error('Error deleting department:', error);
        }
    };

    const updateContact = async(department, contactId, newName) => {
        try {
            await axios.put(`${API_URL}/departments/${department}/contacts/${contactId}`, { newName });
            fetchDepartments();
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const deleteContact = async(department, contactId) => {
        try {
            await axios.delete(`${API_URL}/departments/${department}/contacts/${contactId}`);
            fetchDepartments();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const addReason = async() => {
        if (!newReason) return alert('Please enter a reason.');
        try {
            await axios.post(`${API_URL}/contactOptions/reasons`, { reason: newReason });
            setNewReason(''); // Reset input field
            fetchReasons();
        } catch (error) {
            console.error('Error adding reason:', error);
        }
    };

    const deleteReason = async(reasonId) => {
        try {
            await axios.delete(`${API_URL}/reasons/${reasonId}`);
            fetchReasons();
        } catch (error) {
            console.error('Error deleting reason:', error);
        }
    };

    return ( <
        div >
        <
        h1 > Contact Options Management < /h1>

        <
        h2 > Departments & Contacts < /h2> <
        input type = "text"
        placeholder = "New Department"
        value = { newDepartment }
        onChange = {
            (e) => setNewDepartment(e.target.value) }
        /> <
        button onClick = { addDepartment } > Add Department < /button> <
        h2 > Contact List < /h2> {
            departments.map((dept) => ( <
                div key = { dept.name } >
                <
                h3 > { dept.name } < /h3> <
                input type = "text"
                placeholder = "Update Department Name"
                onChange = {
                    (e) => setNewDepartment(e.target.value) }
                /> <
                button onClick = {
                    () => updateDepartment(dept.name, newDepartment) } > Update Department < /button> <
                button onClick = {
                    () => deleteDepartment(dept.name) } > Delete Department < /button>

                <
                input type = "text"
                placeholder = "New Contact"
                value = { newContact }
                onChange = {
                    (e) => setNewContact(e.target.value) }
                /> <
                button onClick = {
                    () => {
                        setSelectedDepartment(dept.name);
                        addContact();
                    }
                } >
                Add Contact <
                /button>

                <
                ul > {
                    dept.contacts &&
                    dept.contacts.map((contact, index) => ( <
                        li key = { index } > { contact.name } <
                        input type = "text"
                        placeholder = "Update Contact Name"
                        onChange = {
                            (e) => setNewContact(e.target.value) }
                        /> <
                        button onClick = {
                            () => updateContact(dept.name, contact.id, newContact) } >
                        Update Contact <
                        /button> <
                        button onClick = {
                            () => deleteContact(dept.name, contact.id) } >
                        Delete Contact <
                        /button> <
                        /li>
                    ))
                } <
                /ul> <
                /div>
            ))
        }

        <
        h2 > Reasons
        for Contact < /h2> <
        input type = "text"
        placeholder = "New Reason"
        value = { newReason }
        onChange = {
            (e) => setNewReason(e.target.value) }
        /> <
        button onClick = { addReason } > Add Reason < /button> <
        h2 > Reasons List < /h2> <
        ul > {
            reasons.map((reason, idx) => ( <
                li key = { idx } > { reason.reason } <
                button onClick = {
                    () => deleteReason(reason.id) } > Delete < /button> <
                /li>
            ))
        } <
        /ul> <
        /div>
    );
};

export default ContactOptionsManagement;