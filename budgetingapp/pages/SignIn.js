export default function SignIn(auth) {
    const signIn = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("User signed in successfully!");
        } catch (error) {
            console.error("Error signing in:", error);
        }
    }
}