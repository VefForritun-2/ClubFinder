"use client";

import { useState, useEffect } from "react";
import { getAllClubsData, getUserPreferences } from "@/app/library/actions";
import memberOfClubs from "@/app/components/profileMemberClubs";
import styles from "./club.module.css";

export default function DiscoverPage() {
    const [clubs, setClubs] = useState([]); // State for all clubs
    const [userPreferences, setUserPreferences] = useState([]); // State for user preferences
    const [searchTerm, setSearchTerm] = useState(""); // Initialize search term as empty string
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const fetchedClubs = await getAllClubsData(); // Fetch all clubs
                const preferences = await getUserPreferences(); // Fetch user preferences
                setClubs(fetchedClubs);
                setUserPreferences(preferences);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter clubs by search term
    const filteredClubs = clubs.filter((club) =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Create categories dynamically based on the clubs' category fields
    const categories = Array.from(new Set(clubs.map(club => club.category))).filter(Boolean);

    // Categorize clubs based on their category field
    const categorizedClubs = categories.reduce((acc, category) => {
        acc[category] = filteredClubs.filter((club) => club.category === category);
        return acc;
    }, {});

    // Recommend clubs based on user preferences
    const recommendedClubs = categories.reduce((acc, category) => {
        // Ensure category is a string before calling .toLowerCase()
        const categoryString = typeof category === 'string' ? category : String(category);
        
        // Safely compare category names
        if (userPreferences.map(p => p.toLowerCase()).includes(categoryString.toLowerCase())) {
            acc[category] = categorizedClubs[category];
        }
        return acc;
    }, {});

    // Render Loading or Error state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Helper Component to display a list of clubs
    const ClubList = ({ title, clubs }) => {
        if (!clubs.length) return null;
        return (
            <div>
                <h2>{title}</h2>
                <div className={styles.clubRow}>
                    {clubs.map((club) =>
                        memberOfClubs(
                            club.name,
                            club.description,
                            club.img,
                            club.id,
                            false
                        )
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search Clubs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.search_bar}
            />

            {/* Display All Clubs */}
            <ClubList title="All Clubs" clubs={filteredClubs} />

            {/* Display clubs by dynamically inferred categories */}
            <div className={styles.recommendedClubs}>
                {categories.map((category) => (
                    <ClubList
                        key={category}
                        title={`${category} Clubs`}
                        clubs={categorizedClubs[category]}
                    />
                ))}
            </div>

            {/* Recommended Clubs */}
            <div>
                <h2>Recommended for You</h2>
                {Object.keys(recommendedClubs).map((category) => (
                    <ClubList
                        key={category}
                        title={`Recommended ${category} Clubs`}
                        clubs={recommendedClubs[category]}
                    />
                ))}
            </div>
        </div>
    );
}