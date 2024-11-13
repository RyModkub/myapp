import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const goToUserManagement = () => {
        navigate('/UserManagement');
    };

    const goToContactOptionsManagement = () => {
        navigate('/ContactOptionsManagement'); // Change URL to the page you want to create
    };

    const goToVisitorRegister = () => {
        navigate('/VisitorRegister'); // Change URL to the page you want to create
    };

    return ( <
        div >
        <
        h1 > Dashboard < /h1> <
        nav >
        <
        ul >
        <
        li >
        <
        button onClick = { goToUserManagement } > User Management < /button> <
        /li> <
        li >
        <
        button onClick = { goToContactOptionsManagement } > ContactOptionsManagement < /button> <
        /li> <
        li >
        <
        button onClick = { goToVisitorRegister } > VisitorRegister < /button> <
        /li> <
        /ul> <
        /nav> <
        /div>
    );
};

export default Dashboard;