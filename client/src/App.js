import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login'; // Import หน้า Login
import Dashboard from './Dashboard'; // Import หน้า Dashboard หรือหน้าอื่นๆ
import UserManagement from './UserManagement';
import ContactOptionsManagement from './ContactOptionsManagement';
import UserRegistrationComponent from './UserRegistrationComponent';

function App() {
    return ( <
        Router >
        <
        Routes > { /* เส้นทางหลักไปที่หน้าล็อกอิน */ } <
        Route path = "/"
        element = { < Navigate to = "/login" / > }
        /> <
        Route path = "/login"
        element = { < Login / > }
        /> { /* เส้นทางไปที่หน้าหลักหลังจากล็อกอินสำเร็จ */ } <
        Route path = "/dashboard"
        element = { < Dashboard / > }
        /> <
        Route path = "/usermanagement"
        element = { < UserManagement / > }
        /> <
        Route path = "/contactoptionsmanagement"
        element = { < ContactOptionsManagement / > }
        /> <
        Route path = "/UserRegistrationComponent"
        element = { < UserRegistrationComponent / > }
        /> <
        /Routes> <
        /Router>
    );
}

export default App;