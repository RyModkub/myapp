import { auth, db } from './firebaseConfig';

const createUser = async(email, password) => {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

const saveUserData = async(userId, userData) => {
    try {
        await db.ref(`users/${userId}`).set(userData);
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
};

const registerUser = async(email, password, userRole) => {
    try {
        const user = await createUser(email, password);
        const userData = {
            email,
            role: userRole
        };
        await saveUserData(user.uid, userData);
        console.log('User created and data saved successfully!');
    } catch (error) {
        console.error('Error registering user:', error);
    }
};

export { registerUser };