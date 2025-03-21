import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    /* Styling for containers for the entire application */
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF",
    },
    /* Titles: sign in, sign up, settings, create group */
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#A984BE"
    },
    /* Sign in and sign up "forms" */
    form: {
        backgroundColor: "#F5F5F5",
        width: "80%",
        padding: 20,
        borderRadius: 18,
        marginBottom: 10,
    },
    /* Small text, links to new pages etc. */
    link: {
        color: "#A984BE",

    },
    /* Input fields in forms */
    formInput: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DDD",
        height: "30",
        marginBottom: 5,
        textAlignVertical: "center",
        paddingVertical: 0,
        paddingHorizontal: 10,
    },
    buttonOne: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#A984BE",
        width: "80%",
        height: "40",
        borderRadius: 18,
        marginVertical: 10,
    },
    /* Button where text is in the middle */
    buttonTwo: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#A984BE",
        width: "80%",
        height: "40",
        borderRadius: 18,
        marginVertical: 10,
    },
    /* Button text aligned left */
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 20,
    },
    /* Button text in the middle of the button */
    buttonTextMiddle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    profile: {
        margin: 40,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
    }

})

export default styles;