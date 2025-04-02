import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust based on your project setup
import styles from "../styles.js";

export default function BudgetDetails({ route }) {
    const { budgetId } = route.params;
    const [budget, setBudget] = useState(null);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const budgetRef = doc(db, "sharedBudgets", budgetId);
                const budgetSnap = await getDoc(budgetRef);
                if (budgetSnap.exists()) {
                    setBudget(budgetSnap.data());
                } else {
                    console.error("Budget not found.");
                }
            } catch (error) {
                console.error("Error fetching budget details:", error);
            }
        };

        fetchBudget();
    }, [budgetId]);

    if (!budget) {
        return (
            <View style={styles.container}>
                <Text>Loading budget details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Budget Details</Text>
            <Text>Budget Amount: {budget.budget}</Text>
            <Text>Shared by User ID: {budget.userId}</Text>
        </View>
    );
};
