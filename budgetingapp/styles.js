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
    /* Dark title */
    titleDark: {
        fontSize: 24,
        marginBottom: 20,
        color: "#4F4F4F"
    },
    /* A smaller title */
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
        color: "#4F4F4F"
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
        marginBottom: 5,
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
        flex: 1,
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
    /* Modal layout */
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#FFF",
        borderRadius: 18,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    settingsContainer: {
        paddingTop: 40,
        alignItems: "center",
    },
    settingsForm: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 1,
        width: "90%",
    },
    settingsFormTwo: {
        marginVertical: 16,
        width: "90%",
    },
    settingsButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#A984BE",
        width: "90%",
        height: "40",
        borderRadius: 18,
        marginVertical: 10,
    },
    deleteContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    deleteText: {
        color: "red",
        fontSize: 14,
        marginRight: 5,
        textDecorationLine: "underline",
    },
    /* A delete icon "X" for a touchable */
    deleteIconForTouchable: {
        marginRight: 5, 
        padding: 5,
        borderRadius: 18,
    },
    /* TEMPORARY styling for MyBudget page */
    message: {
        marginTop: 16,
        fontSize: 16,
        color: 'green',
    },
    remaining: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'blue',
    },
    budgetItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    deleteButton: {
        fontSize: 18,
        color: 'red',
        paddingHorizontal: 8,
    },
    groupItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    groupText: {
        fontSize: 16,
    },
    chatContainer: {
        position: 'absolute',
        bottom: 80, // Slightly above the bottom edge for better spacing
        right: 25, // Aligns the icon to the bottom-right corner
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    /* Footer */
    footer: {
        backgroundColor: "#A984BE",
        height: 50,
        width: "100%",
        position: "absolute",
        bottom: 0,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
      
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    }
})

export default styles;