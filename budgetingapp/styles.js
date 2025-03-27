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
    /* Form with black text and text centered in the middle */
    formTwo: {
        backgroundColor: "#F5F5F5",
        width: "80%",
        padding: 20,
        borderRadius: 18,
        marginBottom: 10,
        alignItems: "center",
    },
    /* Small text, links to new pages etc. */
    link: {
        color: "#A984BE",
        fontSize: 16,
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
        justifyContent: "space-between",
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
    /* Buttons in the my groups page */
    buttonThree: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#A984BE",
        width: "100%",
        height: "40",
        borderRadius: 18,
        marginVertical: 10,
    },
    buttonForm: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#A984BE",
        height: "40",
        borderRadius: 18,
        marginVertical: 15,
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
    iconStyle: {
        marginRight: 20,
        fontWeight: "bold",
    },
    profile: {
        margin: 40,
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    /* My groups page groups list*/
    list:{
        width: "80%",
        padding: 20,
        borderRadius: 18,
        marginBottom: 10,
    },
    inputActive: {
        backgroundColor: '#ffffff',
        color: '#000000', // Black text color for active fields
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
      },
      inputInactive: {
        backgroundColor: '#f0f0f0',
        color: '#aaaaaa', // Greyed out text color
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
      },

})

export default styles;